import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speechService } from '../services/speechService';

interface AudioPlayerButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rate?: number;
  label?: string;
  showWave?: boolean;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  className = '',
  size = 'md',
  rate = 0.85,
  label,
  showWave = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speechService.speak(
      text,
      () => {
        setIsPlaying(false);
      },
      rate
    );
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 shadow-sm cursor-pointer ${
        isPlaying
          ? 'bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-400 ring-offset-1 animate-pulse'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
      } ${sizeClasses[size]} ${className}`}
      title={isPlaying ? 'Hentikan Audio' : 'Dengarkan Pelafalan Fasih'}
    >
      {isPlaying ? (
        <VolumeX size={iconSizes[size]} />
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
      {label && <span>{isPlaying ? 'Memutar...' : label}</span>}
      {showWave && isPlaying && (
        <span className="flex items-center gap-0.5">
          <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
          <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
          <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
        </span>
      )}
    </button>
  );
};
