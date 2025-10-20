import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import biomecanica from '../assets/biomecanica.png';
import logoLoading from '../assets/movup_loading.png';
import useVideoUpload from '../hooks/useVideoUpload';
import 'primeicons/primeicons.css';
import '../styles/record-page.css';

/**
 * Video preview component
 */
const VideoPreview = ({ videoPreview, selectedVideo, onConfirm, onCancel, isLoading }) => (
  <Dialog visible={videoPreview}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-black py-3">Prévia do Vídeo</h3>
        <video 
          controls 
          className="w-80 max-w-md p-2"
          style={{ maxHeight: '65vh' }}
        >
          <source src={videoPreview} type={selectedVideo?.type} />
          Seu navegador não suporta o elemento de vídeo.
        </video>
        <div className="flex gap-2 justify-content-center pt-3 pb-4">
          <Button 
            label="Analisar" 
            icon="pi pi-check"
            className="button-preview p-button-success"
            onClick={onConfirm}
            disabled={isLoading}
          />
          <Button 
            label="Cancelar" 
            icon="pi pi-times"
            className="button-preview p-button-outlined p-button-secondary"
            onClick={onCancel}
            disabled={isLoading}
          />
        </div>
      </div>
  </Dialog>
);

/**
 * Loading screen component
 */
const LoadingScreen = () => (
  <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center loading-page">
    <div className="text-center flex flex-column justify-content-center align-items-center">
      <img src={logoLoading} style={{width: '50%'}} className='mb-2' />
      <ProgressSpinner style={{ width: '50px', height: '50px', stroke: 'black' }} strokeWidth="5" />
      <h2 className="text-2xl font-bold text-black mt-3">Analisando Corrida...</h2>
      <p className="text-black-alpha-80 mt-2">Aguarde enquanto analisamos sua técnica</p>
    </div>
  </div>
);

/**
 * Instructions component
 */
const Instructions = () => (
  <Card className="mb-4 shadow-none p-3">
    <div className="text-left mb-3">
      <h2>Instruções</h2>
    </div>
    <div className="text-left">
      <p className="text-black-alpha-80 line-height-3 text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div className="text-center my-3">
        <img src={biomecanica} style={{width: '80%'}}/>
      </div>
      <p className="text-black-alpha-80 line-height-3 text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <br/>
      <p className="text-black-alpha-80 line-height-3 text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </div>
  </Card>
);

/**
 * Action buttons component
 */
const ActionButtons = ({ onRecord, onUpload, isLoading }) => (
  <div className="grid grid-cols-1 gap-3 my-4">
    <Button 
      label="GRAVE SUA CORRIDA" 
      icon="pi pi-video"
      className="p-button-raised bg-yellow-400 text-black border-none button-record"
      size="large"
      style={{ height: '60px', fontSize: '16px' }}
      onClick={onRecord}
      disabled={isLoading}
    />
    <Button 
      label="CARREGUE SUA CORRIDA" 
      icon="pi pi-upload"
      className="p-button-raised bg-yellow-400 text-black border-none button-record"
      size="large"
      style={{ height: '60px', fontSize: '16px' }}
      onClick={onUpload}
      disabled={isLoading}
    />
  </div>
);

/**
 * Main Video page component
 */
const Video = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const { uploadVideo, isLoading, error, progress, clearError } = useVideoUpload();

  /**
   * Handles file selection
   */
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setShowConfirm(true);
      clearError();
    } else {
      setError('Por favor, selecione um arquivo de vídeo válido.');
    }
  }, [clearError]);

  /**
   * Handles upload button click
   */
  const handleUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Handles record button click
   */
  const handleRecord = useCallback(() => {
    navigate('/recording');
  }, [navigate]);

  /**
   * Handles video analysis confirmation
   */
  const handleConfirm = useCallback(async () => {
    try {
      const result = await uploadVideo(selectedVideo);
      localStorage.setItem('postureReport', JSON.stringify(result));
      navigate('/report', { state: { reportData: result } });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadVideo, selectedVideo, navigate]);

  /**
   * Handles video selection cancellation
   */
  const handleCancel = useCallback(() => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setShowConfirm(false);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    clearError();
  }, [videoPreview, clearError]);

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="page-container">
      <Instructions />

      <ActionButtons 
        onRecord={handleRecord}
        onUpload={handleUpload}
        isLoading={isLoading}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && (
        <Card className="mb-4 bg-red-50 border-round">
          <div className="text-center">
            <Message 
              severity="error" 
              text={error}
              className="w-full"
            />
          </div>
        </Card>
      )}

      {videoPreview && showConfirm && (
        <VideoPreview
          videoPreview={videoPreview}
          selectedVideo={selectedVideo}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Video;