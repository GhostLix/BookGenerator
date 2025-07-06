import React, { useState } from 'react';
import { ArtStyle } from '../types';
import { ART_STYLES, MIN_CHAPTERS, LANGUAGES } from '../constants';
import { BookOpenIcon } from './icons';

export interface BookConfig {
  title: string;
  genre: string;
  chapterCount: number;
  artStyle: ArtStyle;
  totalPages: number;
  language: string;
}

interface BookGeneratorFormProps {
  onGenerate: (config: BookConfig) => void;
  isLoading: boolean;
  loadingMessage?: string;
}

const BookGeneratorForm: React.FC<BookGeneratorFormProps> = ({ onGenerate, isLoading, loadingMessage }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [chapterCount, setChapterCount] = useState(5);
  const [totalPages, setTotalPages] = useState(25);
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.Fantasy);
  const [language, setLanguage] = useState<string>('English');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && genre && language) {
      onGenerate({ title, genre, chapterCount, artStyle, totalPages, language });
    }
  };

  const handleChapterCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChapterCount = Math.max(MIN_CHAPTERS, Number(e.target.value));
    setChapterCount(newChapterCount);
    if (totalPages < newChapterCount) {
      setTotalPages(newChapterCount);
    }
  };

  const handleTotalPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalPages = Math.max(chapterCount, Number(e.target.value));
    setTotalPages(newTotalPages);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-indigo-900/20 p-8 border border-slate-700">
        <div className="text-center mb-8">
          <BookOpenIcon className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Story Weaver</h1>
          <div className="mt-2 min-h-[24px]">
            {loadingMessage ? (
              <p className="text-indigo-300 animate-pulse">{loadingMessage}</p>
            ) : (
              <p className="text-slate-400">Bring your imagination to life. Create an entire book with a few clicks.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Book Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Last Starlight"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre / Core Idea</label>
            <input
              id="genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., A sci-fi adventure about a lost spaceship"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chapters" className="block text-sm font-medium text-slate-300 mb-2">Number of Chapters</label>
              <input
                id="chapters"
                type="number"
                min={MIN_CHAPTERS}
                value={chapterCount}
                onChange={handleChapterCountChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              />
            </div>
             <div>
              <label htmlFor="pages" className="block text-sm font-medium text-slate-300 mb-2">Total PDF Pages (approx.)</label>
              <input
                id="pages"
                type="number"
                min={chapterCount}
                value={totalPages}
                onChange={handleTotalPagesChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <input
              id="language"
              type="text"
              list="languages-datalist"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g., English or type your own"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
            <datalist id="languages-datalist">
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Illustration Style</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ART_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setArtStyle(style)}
                  className={`px-4 py-3 rounded-lg text-sm text-center transition duration-200 ${
                    artStyle === style
                      ? 'bg-indigo-600 text-white font-semibold ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-500'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !title || !genre || !language}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 transition duration-300 flex items-center justify-center text-lg"
          >
            {isLoading ? 'Generating...' : 'Generate Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookGeneratorForm;