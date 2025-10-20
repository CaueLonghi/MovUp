import React from 'react';
import { Button } from 'primereact/button';

/**
 * Reusable page header component
 */
const PageHeader = ({ 
  title, 
  onBack, 
  backLabel = 'Voltar',
  showBackButton = true,
  rightContent = null,
  className = ''
}) => {
  return (
    <div className={`flex justify-content-between align-items-center mb-4 ${className}`}>
      {showBackButton ? (
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-rounded"
          onClick={onBack}
          tooltip={backLabel}
        />
      ) : (
        <div style={{ width: '40px' }}></div>
      )}
      
      <h1 className="text-xl font-bold text-black">
        {title}
      </h1>
      
      {rightContent || <div style={{ width: '40px' }}></div>}
    </div>
  );
};

export default PageHeader;
