import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileNewsBadgeProps {
  onClick: () => void;
  hasNewItems?: boolean;
}

export function MobileNewsBadge({ onClick, hasNewItems = false }: MobileNewsBadgeProps) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={onClick}
      aria-label={t('dashboard:news.openNews')}
      className={cn(
        "fixed lg:hidden right-4 top-1/2 -translate-y-1/2 z-40",
        "flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-[rgba(26,26,26,0.8)] border border-primary/50",
        "shadow-lg backdrop-blur-sm",
        "hover:scale-105 transition-transform duration-200",
        "touch-manipulation"
      )}
    >
      <div className="relative">
        <Newspaper className="h-5 w-5 text-primary" />
        {hasNewItems && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </div>
      <span className="text-sm font-medium text-foreground hidden xs:inline">
        {t('dashboard:news.newsLabel')}
      </span>
    </button>
  );
}
