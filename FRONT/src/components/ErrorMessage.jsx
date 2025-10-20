import React from 'react';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';

/**
 * Reusable error message component
 */
const ErrorMessage = ({ 
  error, 
  title = 'Erro', 
  showIcon = true, 
  onRetry = null,
  className = '' 
}) => {
  if (!error) return null;

  return (
    <Card className={`bg-red-50 border-round ${className}`}>
      <div className="text-center">
        {showIcon && (
          <div className="text-red-600 text-4xl mb-2">⚠️</div>
        )}
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          {title}
        </h3>
        <Message 
          severity="error" 
          text={error}
          className="w-full"
        />
        {onRetry && (
          <div className="mt-3">
            <button 
              onClick={onRetry}
              className="p-button p-button-outlined p-button-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ErrorMessage;
