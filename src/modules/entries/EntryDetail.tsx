import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, BookOpen, Globe } from 'lucide-react';
import { getEntryDetail, resolveResourceUrl } from '../archive/archiveApi';
import { SpeakerButton } from '../audio/SpeakerButton';
import type { Entry } from '../archive/types';

export function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  const loadEntry = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const detail = await getEntryDetail(id);
      setEntry(detail);

      const urls = await Promise.all(
        detail.images.map((img) => resolveResourceUrl(img.image_path).catch(() => ''))
      );
      setImageUrls(urls.filter(Boolean));
    } catch (err) {
      console.error('Failed to load entry:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="aspect-[16/9] bg-gray-100 rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <p className="text-gray-500">词条未找到</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          返回首页
        </button>
      </div>
    );
  }

  const tags = entry.tags
    ? entry.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">返回</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {entry.text_original}
        </h1>
        {entry.text_transcription && (
          <p className="text-xl text-gray-500 mb-2">
            {entry.text_transcription}
          </p>
        )}
        {entry.text_translation && (
          <p className="text-lg text-gray-700">
            {entry.text_translation}
          </p>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="mb-8">
          <div className="rounded-xl overflow-hidden bg-gray-50 mb-3">
            <img
              src={imageUrls[selectedImage]}
              alt={entry.images[selectedImage]?.alt_text || entry.text_original}
              className="w-full max-h-[500px] object-contain"
            />
          </div>
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={url}
                    alt={`缩略图 ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {entry.audio.length > 0 && (
        <div className="mb-8 p-5 bg-gray-50 rounded-xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Globe className="w-5 h-5" />
            发音资料
          </h2>
          <div className="space-y-3">
            {entry.audio.map((audio) => (
              <div key={audio.id} className="flex items-center gap-4">
                <SpeakerButton
                  audioPath={audio.audio_path}
                  label={audio.source_name}
                />
                <div className="text-sm text-gray-600">
                  {audio.speaker_name && (
                    <span className="mr-3">录音人：{audio.speaker_name}</span>
                  )}
                  {audio.dialect_name && (
                    <span className="mr-3">方言：{audio.dialect_name}</span>
                  )}
                  {audio.speed_label && (
                    <span>语速：{audio.speed_label}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.example_sentence && (
        <div className="mb-8 p-5 bg-blue-50 rounded-xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
            <BookOpen className="w-5 h-5" />
            例句
          </h2>
          <p className="text-gray-900 text-lg mb-2">{entry.example_sentence}</p>
          {entry.example_translation && (
            <p className="text-gray-600">{entry.example_translation}</p>
          )}
        </div>
      )}

      {entry.cultural_note && (
        <div className="mb-8 p-5 bg-amber-50 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            文化说明
          </h2>
          <p className="text-gray-700 leading-relaxed">{entry.cultural_note}</p>
        </div>
      )}

      {(entry.category_name || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
          {entry.category_name && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {entry.category_name}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
