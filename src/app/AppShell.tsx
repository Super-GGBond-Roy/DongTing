import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Info } from 'lucide-react';
import { SearchBox } from '../modules/search/SearchBox';
import { CategorySidebar } from '../modules/categories/CategorySidebar';
import { EntryList } from '../modules/entries/EntryList';
import { getLanguages, listEntries, searchEntries } from '../modules/archive/archiveApi';
import type { EntrySummary, Language } from '../modules/archive/types';

export function AppShell() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language | null>(null);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLanguages = useCallback(async () => {
    try {
      const langs = await getLanguages();
      if (langs.length > 0) {
        setLanguage(langs[0]);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  }, []);

  const loadEntries = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      const data = await listEntries(categoryId);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    if (!searchQuery) {
      loadEntries(selectedCategoryId || undefined);
    }
  }, [selectedCategoryId, searchQuery, loadEntries]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        loadEntries(selectedCategoryId || undefined);
        return;
      }
      try {
        setLoading(true);
        const results = await searchEntries(query);
        setEntries(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategoryId, loadEntries]
  );

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="shrink-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Library className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">
            {language?.name || '语言文化资料库'}
          </h1>
        </div>

        <SearchBox
          onSearch={handleSearch}
          className="flex-1 max-w-xl mx-auto"
        />

        <button
          onClick={() => navigate('/about')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Info className="w-4 h-4" />
          <span>关于</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {language && (
          <CategorySidebar
            languageId={language.id}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          {searchQuery && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm text-gray-500">
                搜索 "{searchQuery}" 找到 {entries.length} 个结果
              </p>
            </div>
          )}
          <EntryList entries={entries} loading={loading} />
        </main>
      </div>
    </div>
  );
}
