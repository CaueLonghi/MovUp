import React, { useState } from 'react';
import { Galleria } from 'primereact/galleria';

/**
 * ImageCarousel Component
 * Displays error and success frame images in a carousel
 * 
 * @param {string} errorImage - URL of the error frame image
 * @param {string} successImage - URL of the success frame image
 * @param {number} errorFrameNumber - Frame number of the error image
 * @param {string} title - Title for the carousel
 */
const ImageCarousel = ({ errorImage, successImage, errorFrameNumber, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Build images array based on available images
  const images = [];
  
  if (errorImage) {
    images.push({
      itemImageSrc: errorImage,
      thumbnailImageSrc: errorImage,
      alt: `${title} - Error Frame`,
      title: 'Frame com Erro',
      frameNumber: errorFrameNumber
    });
  }
  
  if (successImage) {
    images.push({
      itemImageSrc: successImage,
      thumbnailImageSrc: successImage,
      alt: `${title} - Success Frame`,
      title: 'Frame de Sucesso',
      frameNumber: null
    });
  }

  // If no images, return null
  if (images.length === 0) {
    return null;
  }

  // If only one image, display it without carousel
  if (images.length === 1) {
    return (
      <div className="text-center">
        {images[0].frameNumber && (
          <h4 className="text-sm font-semibold text-black mb-2">
            {images[0].title} (#{images[0].frameNumber})
          </h4>
        )}
        {!images[0].frameNumber && (
          <h4 className="text-sm font-semibold text-black mb-2">
            {images[0].title}
          </h4>
        )}
        <div className="relative inline-block">
          <img 
            src={images[0].itemImageSrc} 
            alt={images[0].alt}
            className="h-auto border-round shadow-2"
            style={{ 
              maxWidth: '80%',
              maxHeight: '70vh',
              objectFit: 'contain',
              imageOrientation: 'from-image'
            }}
            onLoad={(e) => {
              const img = e.target;
              const isPortrait = img.naturalHeight > img.naturalWidth;
              if (isPortrait && img.naturalWidth < img.naturalHeight) {
                // Ensure portrait images are displayed correctly
                img.style.maxWidth = '60%';
                img.style.maxHeight = '80vh';
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Custom item template for the carousel
  const itemTemplate = (item) => {
    return (
      <div className="text-center">
        {item.frameNumber && (
          <h4 className="text-sm font-semibold text-black mb-2">
            {item.title} (#{item.frameNumber})
          </h4>
        )}
        {!item.frameNumber && (
          <h4 className="text-sm font-semibold text-black mb-2">
            {item.title}
          </h4>
        )}
        <div className="relative inline-block">
          <img 
            src={item.itemImageSrc} 
            alt={item.alt}
            className="h-auto border-round shadow-2"
            style={{ 
              maxWidth: '80%', 
              maxHeight: '70vh',
              margin: '0 auto',
              objectFit: 'contain',
              imageOrientation: 'from-image'
            }}
            onLoad={(e) => {
              const img = e.target;
              const isPortrait = img.naturalHeight > img.naturalWidth;
              if (isPortrait && img.naturalWidth < img.naturalHeight) {
                // Ensure portrait images are displayed correctly
                img.style.maxWidth = '60%';
                img.style.maxHeight = '80vh';
              }
            }}
          />
        </div>
        <div className="mt-2">
          <small className="text-black-alpha-70">
            {item.title}
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className="image-carousel-container">
      <Galleria 
        value={images} 
        activeIndex={activeIndex}
        onItemChange={(e) => setActiveIndex(e.index)}
        item={itemTemplate}
        numVisible={1}
        circular
        showItemNavigators
        showThumbnails={false}
        style={{ maxWidth: '100%' }}
      />
      {images.length > 1 && (
        <div className="text-center mt-2">
          <small className="text-black-alpha-70">
            ↔ Deslize para o lado para ver a próxima imagem
          </small>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;

