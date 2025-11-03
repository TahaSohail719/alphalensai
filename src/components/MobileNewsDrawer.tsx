import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileNewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileNewsDrawer({ isOpen, onClose, children }: MobileNewsDrawerProps) {
  const { t } = useTranslation();

  // Keyboard support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - slight dim, no blur for performance */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-screen z-50 bg-background",
          "w-[90%] max-w-lg border-l shadow-2xl",
          "transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('dashboard:news.marketNews')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">{t('dashboard:news.marketNews')}</h2>
          <button 
            onClick={onClose}
            aria-label={t('dashboard:news.closeNews')}
            className="p-2 hover:bg-accent rounded-md transition-colors touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - scrollable */}
        <div className="h-[calc(100vh-64px)] overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}
