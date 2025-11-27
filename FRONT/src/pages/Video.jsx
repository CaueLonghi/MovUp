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
const VideoPreview = ({ videoPreview, selectedVideo, onConfirm, onCancel, isLoading, sectionRef }) => (
  <Card ref={sectionRef}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-black py-3">Prévia do Vídeo</h3>
        <video 
          controls 
          className="w-80 max-w-md p-2"
          style={{ maxHeight: '65vh', maxWidth: '100%' }}
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
  </Card>
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
      Para garantir uma análise biomecânica precisa e resultados confiáveis, é fundamental seguir corretamente as orientações de captura do vídeo. A qualidade da gravação interfere diretamente na detecção dos pontos corporais e, consequentemente, na avaliação final. Siga as recomendações abaixo:
      </p>
      <div className="text-center my-3">
        <img src={biomecanica} style={{width: '80%'}}/>
      </div>
      <section id="instrucoes-captura" aria-labelledby="titulo-instrucoes" className="instrucao-captura">
        <article aria-labelledby="posicionamento-camera" className="instrucao-bloco">
          <h3 id="posicionamento-camera">Posicionamento da Câmera</h3>
          <ul>
            <li>A câmera deve estar posicionada <strong>lateralmente</strong> ao corredor.</li>
            <li>Grave <strong>sempre o lado direito do corpo</strong>.</li>
            <li>O atleta deve estar <strong>totalmente visível no quadro</strong>, da cabeça aos pés.</li>
            <li>Mantenha a câmera estável — o ideal é apoiá-la em um suporte fixo (tripé ou suporte rígido).</li>
          </ul>
        </article>
        <br/>
        <article aria-labelledby="distancia-enquadramento" className="instrucao-bloco">
          <h3 id="distancia-enquadramento">Distância e Enquadramento</h3>
          <ul>
            <li>Posicione a câmera a uma distância que permita visualizar <strong>100% da movimentação</strong> do corredor.</li>
            <li>Evite gravações muito próximas ou muito distantes.</li>
            <li>A câmera deve estar aproximadamente na altura da <strong>cintura</strong> do atleta.</li>
          </ul>
        </article>
        <br/>
        <article aria-labelledby="esteira" className="instrucao-bloco">
          <h3 id="esteira">Esteira</h3>
          <ul>
            <li>Utilize uma esteira comum e mantenha o corredor no centro da faixa.</li>
            <li><strong>A barra frontal da esteira não pode ficar na frente do corredor</strong> — isso atrapalha a captura dos pontos corporais.</li>
            <li>Verifique se a área ao redor está livre de objetos que possam obstruir a visão lateral.</li>
          </ul>
        </article>
        <br/>
        <article aria-labelledby="especificacoes-tecnicas" className="instrucao-bloco">
          <h3 id="especificacoes-tecnicas">Especificações Técnicas da Gravação</h3>
          <ul>
            <li>Resolução mínima: <strong>720p</strong>.</li>
            <li>Taxa de quadros (FPS): <strong>mínimo de 30 fps</strong> (ideal 60 fps, se disponível).</li>
            <li>Evite vídeos tremidos — mantenha a câmera fixa.</li>
            <li>Ambiente com <strong>boa iluminação</strong>; evite sombras intensas ou locais muito escuros.</li>
          </ul>
        </article>
        <br/>
        <article aria-labelledby="duracao-video" className="instrucao-bloco">
          <h3 id="duracao-video">Duração do Vídeo</h3>
          <p>Recomendado: <strong>10 a 30 segundos</strong>. Vídeos mais longos também são aceitos, mas exigem maior tempo de processamento.</p>
        </article>

        <footer className="instrucao-rodape">
          <p><small>Dica: faça um teste rápido antes de gravar a versão final para garantir enquadramento, iluminação e estabilidade.</small></p>
        </footer>
      </section>
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
  const sectionRef = useRef(null);

  const { uploadVideo, isLoading, error, progress, clearError } = useVideoUpload();

  const handleScroll = () => {
    setTimeout(() => {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
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
      handleScroll();
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
    <div className="page-container" style={{ scrollBehavior: 'smooth' }}>
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
          sectionRef={sectionRef}
        />
      )}
    </div>
  );
};

export default Video;