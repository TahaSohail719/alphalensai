import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

export function SideDrawer({ 
  isOpen, 
  onClose, 
  children, 
  width = 'w-[480px]' 
}: SideDrawerProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    const handleN = (e: KeyboardEvent) => {
      // Toggle with "N" (only if not in an input)
      if (
        e.key === 'n' && 
        !e.ctrlKey && 
        !e.metaKey && 
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        if (isOpen) onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('keydown', handleN);
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('keydown', handleN);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Transparent clickable overlay - NO DIMMING */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-screen z-50 bg-background border-l shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          width,
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
}
