import { useState } from 'react';

const useVideoUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadVideo = async (videoFile) => {
    if (!videoFile) {
      setError('Nenhum arquivo de vídeo selecionado');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch('http://127.0.0.1:8000/analisar-video/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      return result;
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Erro ao enviar o vídeo. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadVideo,
    isLoading,
    error,
    setError
  };
};

export default useVideoUpload;