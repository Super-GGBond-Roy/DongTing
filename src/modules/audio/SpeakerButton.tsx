import { useState, useCallback } from 'react';
import { Play, Square } from 'lucide-react';
import { playAudio, stopAudio } from './audioPlayer';
import { resolveResourceUrl } from '../archive/archiveApi';

interface SpeakerButtonProps {
  audioPath: string;
  label: string;
  className?: string;
}

export function SpeakerButton({ audioPath, label, className = '' }: SpeakerButtonProps) {
  const [playing, setPlaying] = useState(false);

  const handleClick = useCallback(async () => {
    if (playing) {
      stopAudio();
      setPlaying(false);
      return;
    }

    try {
      setPlaying(true);
      const url = await resolveResourceUrl(audioPath);
      await playAudio(url, () => setPlaying(false));
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlaying(false);
    }
  }, [audioPath, playing]);

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        playing
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      } ${className}`}
    >
      {playing ? (
        <Square className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span>{playing ? '播放中...' : label}</span>
    </button>
  );
}
