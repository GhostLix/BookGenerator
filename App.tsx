
import React, { useState, useCallback } from 'react';
import BookGeneratorForm, { BookConfig } from './components/BookGeneratorForm';
import BookDisplay from './components/BookDisplay';
import Loader from './components/Loader';
import { Book, Chapter, GenerationStatus } from './types';
import { generateBookOutline, generateChapterText, generateChapterImage } from './services/geminiService';

type AppStatus = 'IDLE' | 'GENERATING' | 'COMPLETE' | 'ERROR';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('IDLE');
  const [book, setBook] = useState<Book | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateChapterStatus = (chapterIndex: number, status: GenerationStatus, data?: Partial<Chapter>) => {
    setBook(prevBook => {
      if (!prevBook) return null;
      const newChapters = [...prevBook.chapters];
      newChapters[chapterIndex] = { ...newChapters[chapterIndex], status, ...data };
      return { ...prevBook, chapters: newChapters };
    });
  };

  const generateBook = useCallback(async (config: BookConfig) => {
    setAppStatus('GENERATING');
    setLoadingMessage('Crafting your book outline...');
    setError(null);
    setBook(null); // Reset previous book if any

    const { title, genre, chapterCount, artStyle, totalPages, language } = config;

    // Estimate words per chapter based on total pages.
    // A standard page is ~574 words, based on the user-provided sample text.
    // This value is used to calculate the target word count for each chapter's text generation.
    const pagesPerChapter = totalPages > 0 && chapterCount > 0 ? totalPages / chapterCount : 1;
    const wordsPerPageEstimate = 574;
    const wordsPerChapter = Math.round(pagesPerChapter * wordsPerPageEstimate);


    try {
      const outline = await generateBookOutline(title, genre, chapterCount, artStyle, language);
      if (!outline || outline.length !== chapterCount) {
        throw new Error("Failed to generate a valid book outline. Please try adjusting your prompt.");
      }

      const initialChapters: Chapter[] = outline.map(o => ({
        title: o.chapter_title,
        imagePrompt: o.image_prompt,
        content: '',
        imageUrl: '',
        status: GenerationStatus.Pending,
      }));

      const initialBook: Book = { title, chapters: initialChapters };
      setBook(initialBook);
      setAppStatus('COMPLETE'); // Switch to BookDisplay view
      setLoadingMessage('');

      // This part runs in the background while BookDisplay is already shown
      for (let i = 0; i < chapterCount; i++) {
        updateChapterStatus(i, GenerationStatus.GeneratingText);
        const chapterText = await generateChapterText(title, outline[i].chapter_title, outline, i, wordsPerChapter, language);
        if (!chapterText) {
          updateChapterStatus(i, GenerationStatus.Error);
          continue; // Skip to next chapter on error
        }
        updateChapterStatus(i, GenerationStatus.GeneratingImage, { content: chapterText });

        const imageUrl = await generateChapterImage(outline[i].image_prompt);
        updateChapterStatus(i, GenerationStatus.Complete, { imageUrl: imageUrl || '' });
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during book generation.");
      setAppStatus('ERROR');
    }
  }, []);

  const handleRestart = () => {
    setBook(null);
    setError(null);
    setAppStatus('IDLE');
  };
  
  const renderContent = () => {
    if (appStatus === 'COMPLETE' && book) {
        return <BookDisplay book={book} onRestart={handleRestart} />;
    }

    if (appStatus === 'ERROR') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-center">
                <p className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</p>
                <p className="text-slate-400 max-w-md mb-8">{error}</p>
                <button
                    onClick={handleRestart}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition duration-300"
                >
                    Start Over
                </button>
            </div>
        );
    }
    
    // Render form for IDLE and GENERATING states
    return (
        <BookGeneratorForm
          onGenerate={generateBook}
          isLoading={appStatus === 'GENERATING'}
          loadingMessage={appStatus === 'GENERATING' ? loadingMessage : undefined}
        />
    );
  };

  return <>{renderContent()}</>;
};

export default App;
