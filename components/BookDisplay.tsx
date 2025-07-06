
import React, { useState } from 'react';
import { Book, GenerationStatus } from '../types';
import { SpinnerIcon, DownloadIcon } from './icons';

interface BookDisplayProps {
  book: Book;
  onRestart: () => void;
}

const StatusIndicator: React.FC<{ status: GenerationStatus }> = ({ status }) => {
  switch (status) {
    case GenerationStatus.GeneratingText:
    case GenerationStatus.GeneratingImage:
      return <SpinnerIcon className="w-4 h-4 text-indigo-400 animate-spin" />;
    case GenerationStatus.Complete:
      return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    case GenerationStatus.Error:
      return <div className="w-3 h-3 bg-red-500 rounded-full" />;
    default:
      return <div className="w-3 h-3 bg-slate-500 rounded-full" />;
  }
};

const BookDisplay: React.FC<BookDisplayProps> = ({ book, onRestart }) => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentChapter = book.chapters[activeChapter];

  const isGenerationComplete = book.chapters.every(
    c => c.status === GenerationStatus.Complete || c.status === GenerationStatus.Error
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const page_width = doc.internal.pageSize.getWidth();
        const page_height = doc.internal.pageSize.getHeight();
        const margin = 40;
        const max_width = page_width - margin * 2;

        // --- Title Page ---
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(book.title, max_width);
        doc.text(titleLines, page_width / 2, 80, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.text('An AI-Generated Story', page_width / 2, 80 + (titleLines.length * 28), { align: 'center' });

        // --- Chapters ---
        for (let i = 0; i < book.chapters.length; i++) {
            const chapter = book.chapters[i];
            if (chapter.status !== GenerationStatus.Complete) continue;

            doc.addPage();
            let y = margin;

            // Chapter Title
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            const chapterTitle = `Chapter ${i + 1}: ${chapter.title}`;
            const titleTextLines = doc.splitTextToSize(chapterTitle, max_width);
            doc.text(titleTextLines, margin, y);
            y += titleTextLines.length * 20 + 20;

            // Chapter Image
            if (chapter.imageUrl) {
                const img = new Image();
                img.src = chapter.imageUrl;
                await new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if one image fails
                });
                
                if (img.width > 0 && img.height > 0) {
                    const aspectRatio = img.height / img.width;
                    const imgWidth = max_width;
                    const imgHeight = imgWidth * aspectRatio;

                    if (y + imgHeight > page_height - margin) {
                        doc.addPage();
                        y = margin;
                    }

                    doc.addImage(img, 'JPEG', margin, y, imgWidth, imgHeight);
                    y += imgHeight + 20;
                }
            }

            // Chapter Content
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            const contentLines = doc.splitTextToSize(chapter.content, max_width);
            
            for (const line of contentLines) {
                 const lineHeight = 12 * 1.15;
                 if (y + lineHeight > page_height - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += lineHeight;
            }
        }
        
        const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ai_generated_book';
        doc.save(`${safeTitle}.pdf`);

    } catch (e) {
        console.error("PDF generation failed:", e);
        alert("Sorry, there was an error creating the PDF file.");
    } finally {
        setIsDownloading(false);
    }
};


  return (
    <div className="flex h-screen bg-slate-900 text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-1/4 max-w-sm flex-shrink-0 bg-slate-800 p-6 flex flex-col border-r border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2 truncate" title={book.title}>{book.title}</h1>
        <p className="text-sm text-slate-400 mb-6">Your Generated Book</p>
        <nav className="flex-grow overflow-y-auto pr-2">
          <ul>
            {book.chapters.map((chapter, index) => (
              <li key={index} className="mb-2">
                <button
                  onClick={() => setActiveChapter(index)}
                  className={`w-full text-left p-3 rounded-md flex items-center justify-between transition-colors duration-200 ${
                    activeChapter === index
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">{`Chapter ${index + 1}: ${chapter.title}`}</span>
                  <StatusIndicator status={chapter.status} />
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 space-y-3">
            <button
              onClick={handleDownload}
              disabled={!isGenerationComplete || isDownloading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 transition duration-300 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <SpinnerIcon className="w-5 h-5 animate-spin" />
              ) : (
                <DownloadIcon className="w-5 h-5" />
              )}
              {isDownloading ? 'Generating PDF...' : 'Download Book'}
            </button>
            <button
              onClick={onRestart}
              className="w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-500 transition duration-300"
            >
              Create Another Book
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentChapter.status === GenerationStatus.Complete && (
            <>
              {currentChapter.imageUrl && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-2xl shadow-black/50 aspect-video">
                  <img src={currentChapter.imageUrl} alt={currentChapter.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="text-4xl font-extrabold text-white mb-6">{currentChapter.title}</h2>
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentChapter.content}
              </div>
            </>
          )}

          {(currentChapter.status === GenerationStatus.GeneratingText || currentChapter.status === GenerationStatus.GeneratingImage) && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SpinnerIcon className="w-16 h-16 text-indigo-400 animate-spin mb-6" />
              <h2 className="text-3xl font-bold text-white">
                {currentChapter.status === GenerationStatus.GeneratingText ? "Writing Chapter..." : "Creating Illustration..."}
              </h2>
              <p className="text-slate-400 mt-2 text-lg">{currentChapter.title}</p>
            </div>
          )}

           {currentChapter.status === GenerationStatus.Error && (
             <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 p-8 rounded-lg">
                <p className="text-2xl font-bold text-red-400">Generation Failed</p>
                <p className="text-slate-400 mt-2">Could not generate content for this chapter. Please try creating a new book.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default BookDisplay;