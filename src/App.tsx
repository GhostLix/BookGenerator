import React, { useState, useCallback, useEffect } from 'react';
import BookGeneratorForm, { BookConfig } from './components/BookGeneratorForm';
import BookDisplay from './components/BookDisplay';
import Loader from './components/Loader';
import { Book, Chapter, GenerationStatus } from './types';
import { generateBookOutline, generateChapterText, generateChapterImage } from './services/geminiService';
import { createGuestCheckoutSession, getSessionFromUrl, verifyPayment } from './services/stripeService';

type AppStatus = 'IDLE' | 'GENERATING' | 'COMPLETE' | 'ERROR' | 'PAYMENT_SUCCESS';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('IDLE');
  const [book, setBook] = useState<Book | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [pendingBookConfig, setPendingBookConfig] = useState<BookConfig | null>(null);

  // Check for payment success on app load
  useEffect(() => {
    const sessionId = getSessionFromUrl();
    if (sessionId) {
      handlePaymentReturn(sessionId);
    }
  }, []);

  const handlePaymentReturn = async (sessionId: string) => {
    try {
      const isValid = await verifyPayment(sessionId);
      if (isValid) {
        setPaymentVerified(true);
        setAppStatus('PAYMENT_SUCCESS');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError('Verifica del pagamento fallita');
        setAppStatus('ERROR');
      }
    } catch (err) {
      setError('Errore nella verifica del pagamento');
      setAppStatus('ERROR');
    }
  };

  const calculatePrice = (config: BookConfig): { total: number; breakdown: string } => {
    const chapterPrice = config.chapterCount * 0.10;
    const pagePrice = (config.totalPages / 100) * 0.10;
    const total = chapterPrice + pagePrice;
    
    const breakdown = `${config.chapterCount} capitoli (€${chapterPrice.toFixed(2)}) + ${config.totalPages} pagine (€${pagePrice.toFixed(2)})`;
    
    return { total: Math.max(0.50, total), breakdown };
  };

  const updateChapterStatus = (chapterIndex: number, status: GenerationStatus, data?: Partial<Chapter>) => {
    setBook(prevBook => {
      if (!prevBook) return null;
      const newChapters = [...prevBook.chapters];
      newChapters[chapterIndex] = { ...newChapters[chapterIndex], status, ...data };
      return { ...prevBook, chapters: newChapters };
    });
  };

  const handlePayment = useCallback(async (config: BookConfig) => {
    try {
      const successUrl = `${window.location.origin}${window.location.pathname}`;
      const cancelUrl = window.location.href;

      const { url } = await createGuestCheckoutSession({
        chapters: config.chapterCount,
        pages: config.totalPages,
        bookConfig: config,
        successUrl,
        cancelUrl,
      });

      // Store config for after payment
      setPendingBookConfig(config);
      
      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Impossibile creare la sessione di pagamento');
      setAppStatus('ERROR');
    }
  }, []);

  const generateBook = useCallback(async (config: BookConfig) => {
    setAppStatus('GENERATING');
    setLoadingMessage('Creazione della struttura del libro...');
    setError(null);
    setBook(null);

    const { title, genre, chapterCount, artStyle, totalPages, language } = config;

    const pagesPerChapter = totalPages > 0 && chapterCount > 0 ? totalPages / chapterCount : 1;
    const wordsPerPageEstimate = 574;
    const wordsPerChapter = Math.round(pagesPerChapter * wordsPerPageEstimate);

    try {
      const outline = await generateBookOutline(title, genre, chapterCount, artStyle, language);
      if (!outline || outline.length !== chapterCount) {
        throw new Error("Impossibile generare la struttura del libro. Prova a modificare i parametri.");
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
      setAppStatus('COMPLETE');
      setLoadingMessage('');

      for (let i = 0; i < chapterCount; i++) {
        updateChapterStatus(i, GenerationStatus.GeneratingText);
        const chapterText = await generateChapterText(title, outline[i].chapter_title, outline, i, wordsPerChapter, language);
        if (!chapterText) {
          updateChapterStatus(i, GenerationStatus.Error);
          continue;
        }
        updateChapterStatus(i, GenerationStatus.GeneratingImage, { content: chapterText });

        const imageUrl = await generateChapterImage(outline[i].image_prompt);
        updateChapterStatus(i, GenerationStatus.Complete, { imageUrl: imageUrl || '' });
      }
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante la generazione del libro.");
      setAppStatus('ERROR');
    }
  }, []);

  const handleRestart = () => {
    setBook(null);
    setError(null);
    setAppStatus('IDLE');
    setPaymentVerified(false);
    setPendingBookConfig(null);
  };

  const handleStartGeneration = () => {
    if (pendingBookConfig) {
      generateBook(pendingBookConfig);
    }
  };

  const renderContent = () => {
    if (appStatus === 'PAYMENT_SUCCESS') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-900/20 p-8 border border-slate-700 max-w-md">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Pagamento Completato!</h1>
            <p className="text-slate-400 mb-6">Il tuo pagamento è stato elaborato con successo. Ora puoi generare il tuo libro personalizzato.</p>
            <button
              onClick={handleStartGeneration}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition duration-300"
            >
              Genera il Libro
            </button>
          </div>
        </div>
      );
    }

    if (appStatus === 'COMPLETE' && book) {
      return <BookDisplay book={book} onRestart={handleRestart} />;
    }

    if (appStatus === 'ERROR') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-center">
          <p className="text-2xl font-bold text-red-400 mb-4">Si è verificato un errore</p>
          <p className="text-slate-400 max-w-md mb-8">{error}</p>
          <button
            onClick={handleRestart}
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition duration-300"
          >
            Riprova
          </button>
        </div>
      );
    }

    return (
      <BookGeneratorForm
        onGenerate={handlePayment}
        calculatePrice={calculatePrice}
        isLoading={appStatus === 'GENERATING'}
        loadingMessage={appStatus === 'GENERATING' ? loadingMessage : undefined}
      />
    );
  };

  return <>{renderContent()}</>;
};

export default App;