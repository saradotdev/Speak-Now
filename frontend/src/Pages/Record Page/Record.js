import React, { useEffect, useRef, useState } from 'react';
import Button from '../../Components/Button/Button';
import axios from 'axios';

const Record = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      mediaRecorderRef.current = null;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;

        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      mediaRecorderRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const uploadVideo = async () => {
    if (recordedVideoUrl) {
      try {
        const response = await axios.post('http://localhost:5000/api/upload_recorded_video', { videoUrl: recordedVideoUrl });
        console.log(response.data);
      } catch (error) {
        console.log('Error uploading video', error);
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay controls muted />
      <div>
        {isRecording ? (
          <>
            <button onClick={stopRecording}>Stop Recording</button>
            {isPaused ? (
              <button onClick={resumeRecording}>Resume Recording</button>
            ) : (
              <button onClick={pauseRecording}>Pause Recording</button>
            )}
          </>
        ) : (
          <>
            <button onClick={startRecording}>Start Recording</button>
            {recordedVideoUrl && (
              <div className="container-fluid featureButton">
                <Button message={"Upload"} onClick={uploadVideo} link={"feedback"} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Record;