import React, { useState, useCallback } from 'react';
import BookGeneratorForm, { BookConfig } from './components/BookGeneratorForm';
import BookDisplay from './components/BookDisplay';
import AuthForm from './components/AuthForm';
import PricingPage from './components/PricingPage';
import SuccessPage from './components/SuccessPage';
import Loader from './components/Loader';
import { Book, Chapter, GenerationStatus } from './types';
import { generateBookOutline, generateChapterText, generateChapterImage } from './services/geminiService';
import { useAuth } from './hooks/useAuth';
import { getUserSubscription, getUserOrders } from './services/stripeService';

type AppStatus = 'IDLE' | 'GENERATING' | 'COMPLETE' | 'ERROR' | 'PRICING' | 'SUCCESS';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [appStatus, setAppStatus] = useState<AppStatus>('IDLE');
  const [book, setBook] = useState<Book | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Check URL for success page
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setAppStatus('SUCCESS');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load user subscription and orders when user is authenticated
  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [subscriptionData, ordersData] = await Promise.all([
        getUserSubscription(),
        getUserOrders()
      ]);
      setSubscription(subscriptionData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
    setBook(null);

    const { title, genre, chapterCount, artStyle, totalPages, language } = config;

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
      setError(err.message || "An unknown error occurred during book generation.");
      setAppStatus('ERROR');
    }
  }, []);

  const handleRestart = () => {
    setBook(null);
    setError(null);
    setAppStatus('IDLE');
  };

  const handleShowPricing = () => {
    setAppStatus('PRICING');
  };

  const handleBackFromPricing = () => {
    setAppStatus('IDLE');
  };

  const handleSuccessContinue = () => {
    setAppStatus('IDLE');
    loadUserData(); // Refresh user data after successful payment
  };

  const handleAuthSuccess = () => {
    // Auth state will be handled by useAuth hook
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  const renderContent = () => {
    if (appStatus === 'SUCCESS') {
      return <SuccessPage onContinue={handleSuccessContinue} />;
    }

    if (appStatus === 'PRICING') {
      return <PricingPage onBack={handleBackFromPricing} />;
    }

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

    return (
      <BookGeneratorForm
        onGenerate={generateBook}
        onShowPricing={handleShowPricing}
        onSignOut={signOut}
        isLoading={appStatus === 'GENERATING'}
        loadingMessage={appStatus === 'GENERATING' ? loadingMessage : undefined}
        user={user}
        subscription={subscription}
        orders={orders}
      />
    );
  };

  return <>{renderContent()}</>;
};

export default App;