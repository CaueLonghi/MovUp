import React from 'react'
import movup_logo from '../assets/movup_logo.png';

export const Header = () => {
  return (
    <div className="bg-white p-3 border-round">
              <div className="flex justify-content-between align-items-center">
                <div>
                  <img 
                    src={movup_logo} 
                    alt="MOVUP Logo" 
                    className="logo-image mb-2"
                  />
                </div>
                <p className="pi pi-bell"></p>
              </div>
            </div>
  )
}
