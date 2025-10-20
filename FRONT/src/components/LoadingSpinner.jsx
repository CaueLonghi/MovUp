import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'normal', 
  message = 'Carregando...', 
  showMessage = true,
  className = '' 
}) => {
  const sizeMap = {
    small: { width: '30px', height: '30px' },
    normal: { width: '50px', height: '50px' },
    large: { width: '80px', height: '80px' }
  };

  const spinnerStyle = sizeMap[size] || sizeMap.normal;

  return (
    <div className={`text-center ${className}`}>
      <ProgressSpinner 
        style={spinnerStyle} 
        strokeWidth="5"
      />
      {showMessage && (
        <p className="text-sm text-black-alpha-70 mt-2">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
