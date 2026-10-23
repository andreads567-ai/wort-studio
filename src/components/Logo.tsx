import React from 'react';
import logoImg from '../assets/logo.png';
import logoIconImg from '../assets/logo-icon.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  alt = 'Wort STUDIO'
}) => {
  if (variant === 'icon') {
    return (
      <img
        src={logoIconImg}
        alt={alt}
        className={`object-contain select-none ${className || 'h-8 w-auto'}`}
        loading="eager"
      />
    );
  }

  return (
    <img
      src={logoImg}
      alt={alt}
      className={`object-contain select-none ${className || 'h-8 w-auto'}`}
      loading="eager"
    />
  );
};
