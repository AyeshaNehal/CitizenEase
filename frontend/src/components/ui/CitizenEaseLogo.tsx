import React from 'react';
import { LOGO_EMBLEM_BASE64, LOGO_FULL_BASE64 } from './logoData';

interface CitizenEaseLogoProps {
  className?: string;
  variant?: 'emblem' | 'full';
  alt?: string;
}

/**
 * CitizenEase Official Brand Logo Component
 * Uses self-contained inline data for guaranteed 100% visibility across all environments.
 */
export const CitizenEaseLogo: React.FC<CitizenEaseLogoProps> = ({
  className = 'w-8 h-8 sm:w-9 sm:h-9',
  variant = 'emblem',
  alt = 'CitizenEase Logo'
}) => {
  return (
    <img
      src={variant === 'full' ? LOGO_FULL_BASE64 : LOGO_EMBLEM_BASE64}
      alt={alt}
      className={`object-contain select-none shrink-0 ${className}`}
      loading="eager"
      decoding="sync"
    />
  );
};
