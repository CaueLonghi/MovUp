import { ReactMediaRecorder } from 'react-media-recorder';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useState } from 'react';
import 'primeicons/primeicons.css';

const MediaRecorderComponent = ({ onSave, onRestart, onBack, onSend, isLoading }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleStopRecording = (stopRecording) => {
    stopRecording();
    setShowPreview(true);
  };

  const handleSave = (mediaBlobUrl) => {
    if (mediaBlobUrl) {
      // Create download link
      const a = document.createElement('a');
      a.href = mediaBlobUrl;
      a.download = `movup-recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert('Vídeo salvo com sucesso!');
      onSave();
    }
  };

  const handleSendToAPI = async (mediaBlobUrl) => {
    if (mediaBlobUrl && onSend) {
      try {
        // Convert blob URL to File object
        const response = await fetch(mediaBlobUrl);
        const blob = await response.blob();
        const file = new File([blob], `recording-${new Date().toISOString().slice(0, 19)}.webm`, {
          type: 'video/webm'
        });
        
        await onSend(file);
      } catch (error) {
        console.error('Error converting blob to file:', error);
        alert('Erro ao processar o vídeo gravado.');
      }
    }
  };

  const handleRestart = (clearBlobUrl) => {
    clearBlobUrl();
    setShowPreview(false);
    onRestart();
  };

  return (
    <ReactMediaRecorder
      video={{
        facingMode: 'environment', // Use back camera if available
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }}
      audio={true}
      askPermissionOnMount={true}
      blobPropertyBag={{
        type: 'video/webm'
      }}
      render={({ 
        status, 
        startRecording, 
        stopRecording, 
        mediaBlobUrl, 
        previewStream, 
        error, 
        clearBlobUrl 
      }) => (
        <div className="recording-page">
          {/* Header */}
          <div className="recording-header">
            <Button
              icon="pi pi-arrow-left"
              className="p-button-text p-button-rounded"
              onClick={onBack}
              tooltip="Voltar"
            />
            <h1 className="text-xl font-bold text-black">Gravar Corrida</h1>
            <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
          </div>

          {/* Camera Feed */}
          <div className="camera-feed-container">
            {previewStream && !showPreview && (
              <video
                ref={(videoElement) => {
                  if (videoElement && previewStream) {
                    videoElement.srcObject = previewStream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="camera-feed"
              />
            )}
            
            {/* Recording Indicator */}
            {status === 'recording' && (
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                <span>GRAVANDO</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="recording-controls">
            {!showPreview ? (
              // Recording Controls
              <div className="flex justify-content-center gap-3">
                {status === 'idle' ? (
                  <Button
                    label="Iniciar Gravação"
                    icon="pi pi-video"
                    className="p-button-raised p-button-success recording-button"
                    onClick={startRecording}
                    disabled={!previewStream}
                  />
                ) : status === 'recording' ? (
                  <Button
                    label="Parar Gravação"
                    icon="pi pi-stop"
                    className="p-button-raised p-button-danger recording-button"
                    onClick={() => handleStopRecording(stopRecording)}
                  />
                ) : (
                  <Button
                    label="Aguarde..."
                    icon="pi pi-spinner pi-spin"
                    className="p-button-raised p-button-secondary recording-button"
                    disabled
                  />
                )}
              </div>
            ) : (
              // Post-Recording Controls
              <div className="flex flex-column gap-3">
                {/* Video Preview */}
                {mediaBlobUrl && (
                  <Card className="video-preview-card">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-black mb-3">Prévia da Gravação</h3>
                      <video
                        controls
                        className="preview-video"
                        src={mediaBlobUrl}
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-content-center gap-3">
                  <Button
                    label="Salvar"
                    icon="pi pi-check"
                    className="p-button-raised p-button-success action-button"
                    onClick={() => handleSave(mediaBlobUrl)}
                    disabled={!mediaBlobUrl || isLoading}
                  />
                  {onSend && (
                    <Button
                      label="Enviar para Análise"
                      icon="pi pi-send"
                      className="p-button-raised p-button-primary action-button"
                      onClick={() => handleSendToAPI(mediaBlobUrl)}
                      disabled={!mediaBlobUrl || isLoading}
                    />
                  )}
                  <Button
                    label="Refazer"
                    icon="pi pi-refresh"
                    className="p-button-raised p-button-warning action-button"
                    onClick={() => handleRestart(clearBlobUrl)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <Card className="instructions-card">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-black mb-2">Instruções</h3>
              <p className="text-black-alpha-80 text-sm line-height-3">
                Posicione-se de forma que sua corrida seja claramente visível na tela. 
                Certifique-se de que há boa iluminação e que você está em um local seguro.
              </p>
              {status && (
                <p className="text-black-alpha-60 text-xs mt-2">
                  Status: {status === 'idle' ? 'Pronto' : 
                          status === 'acquiring_media' ? 'Configurando câmera...' :
                          status === 'recording' ? 'Gravando...' :
                          status === 'stopping' ? 'Parando...' :
                          status === 'stopped' ? 'Gravação finalizada' : status}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-xs mt-2">
                  Erro: {error}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    />
  );
};

export default MediaRecorderComponent;
