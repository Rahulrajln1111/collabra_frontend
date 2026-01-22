import React, { useState } from 'react';
import { Eye, EyeOff, Code, Zap, Users, ArrowRight } from 'lucide-react';

// Logo Component
const CollabraLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
        <Code className={`${sizeClasses[size]} text-white`} />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold text-white`}>Collabra AI</h1>
          <p className="text-cyan-400 text-sm">Collaborative Coding Platform</p>
        </div>
      )}
    </div>
  );
};

export default CollabraLogo;