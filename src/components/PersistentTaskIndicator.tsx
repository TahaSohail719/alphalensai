import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalLoading } from './GlobalLoadingProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PersistentTaskIndicatorProps {
  className?: string;
  onHistoryClick?: () => void;
}

export function PersistentTaskIndicator({ className, onHistoryClick }: PersistentTaskIndicatorProps) {
  const { getActiveRequests } = useGlobalLoading();
  const activeRequests = getActiveRequests();
  const activeCount = activeRequests.length;

  if (activeCount === 0) return null;

  const handleClick = () => {
    if (onHistoryClick) {
      onHistoryClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "fixed top-16 sm:top-20 right-4 z-50",
              "transition-all duration-300 ease-in-out",
              "cursor-pointer",
              className
            )}
            onClick={handleClick}
          >
            <Badge 
              variant="outline" 
              className="bg-primary/10 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200 shadow-lg"
            >
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              <span className="text-xs font-medium">
                {activeCount}
              </span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">
              {activeCount === 1 
                ? 'AI task processing...' 
                : `${activeCount} AI tasks running...`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Click to view history
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}