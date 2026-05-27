import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveResourceUrl } from '../archive/archiveApi';
import { SpeakerButton } from '../audio/SpeakerButton';
import type { EntrySummary } from '../archive/types';

interface EntryCardProps {
  entry: EntrySummary;
}

export function EntryCard({ entry }: EntryCardProps) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (entry.main_image_path) {
      resolveResourceUrl(entry.main_image_path)
        .then(setImageUrl)
        .catch(() => setImageUrl(''));
    }
  }, [entry.main_image_path]);

  const tags = entry.tags
    ? entry.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/entry/${entry.id}`)}
    >
      <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entry.text_original}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-4xl">{entry.text_original.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {entry.text_original}
        </h3>
        {entry.text_transcription && (
          <p className="text-sm text-gray-500 mb-1 truncate">
            {entry.text_transcription}
          </p>
        )}
        {entry.text_translation && (
          <p className="text-sm text-gray-700 mb-3 truncate">
            {entry.text_translation}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {entry.audio.map((audio) => (
            <SpeakerButton
              key={audio.id}
              audioPath={audio.audio_path}
              label={audio.source_name}
              className="flex-1 text-xs py-1.5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
