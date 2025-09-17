import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import MediaRecorderComponent from '../components/MediaRecorderComponent';
import useVideoUpload from '../hooks/useVideoUpload';
import logoLoading from '../assets/movup_loading.png';
import '../styles/record-page.css';

const RecordingPage = () => {
  const navigate = useNavigate();
  const { uploadVideo, isLoading, error } = useVideoUpload();

  const handleSave = () => {
    navigate('/video');
  };

  const handleRestart = () => {
    // Component handles restart internally
  };

  const handleBack = () => {
    navigate('/video');
  };

  const handleSendRecordedVideo = async (videoFile) => {
    try {
      const result = await uploadVideo(videoFile);
      // Store the result in localStorage and navigate to report page
      localStorage.setItem('postureReport', JSON.stringify(result));
      navigate('/report', { state: { reportData: result } });
    } catch (error) {
      // Error is handled by the hook
      console.error('Upload failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center loading-page">
        <div className="text-center flex flex-column justify-content-center align-items-center">
          <img src={logoLoading} style={{width: '50%'}} className='mb-2' />
          <ProgressSpinner style={{ width: '50px', height: '50px', stroke: 'black' }} strokeWidth="5" />
          <h2 className="text-2xl font-bold text-black mt-3">Analisando Corrida...</h2>
          <p className="text-black-alpha-80 mt-2">Aguarde enquanto analisamos sua técnica</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recording-page">
      {/* Error Display */}
      {error && (
        <div className="error-overlay">
          <div className="error-content">
            <h2>Erro</h2>
            <p className="text-red-600">{error}</p>
            <Button
              label="Fechar"
              className="p-button-outlined"
              onClick={() => window.location.reload()}
            />
          </div>
        </div>
      )}

      {/* Media Recorder Component */}
      <MediaRecorderComponent 
        onSave={handleSave}
        onRestart={handleRestart}
        onBack={handleBack}
        onSend={handleSendRecordedVideo}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RecordingPage;
