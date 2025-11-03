import { useState, useEffect } from 'react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, MessageCircle, Share, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MarketNewsCollapsibleProps {
  className?: string;
  defaultOpen?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  forex: "bg-green-500/10 text-green-500 border-green-500/20",
  crypto: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  merger: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const highlightKeywords = (text: string) => {
  const keywords = ['POWELL', 'INFLATION', 'FED', 'LABOR', 'DOWNSIDE', 'RISK', 'RATE', 'ECONOMY', 'MARKET'];
  let highlighted = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="text-purple-500 font-bold">$1</span>');
  });
  
  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const formatTime = (datetime: string) => {
  const now = Date.now();
  const itemTime = new Date(datetime).getTime();
  const diff = now - itemTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

export function MarketNewsCollapsible({ defaultOpen = false }: MarketNewsCollapsibleProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedTab, setSelectedTab] = useState<'all' | 'trending'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { news, isLoading } = useNewsFeed();

  // Calculate unread count
  useEffect(() => {
    const lastReadTime = localStorage.getItem('lastNewsReadTime');
    if (lastReadTime && news.length > 0) {
      const unread = news.filter(item => 
        item.datetime && new Date(item.datetime).getTime() > parseInt(lastReadTime)
      ).length;
      setUnreadCount(unread);
    }
  }, [news]);

  // Update last read time when opening
  const handleToggle = () => {
    if (!isOpen) {
      localStorage.setItem('lastNewsReadTime', Date.now().toString());
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  // Filter news based on tab
  const filteredNews = selectedTab === 'trending' 
    ? news.filter(item => {
        const hoursSincePublished = (Date.now() - new Date(item.datetime).getTime()) / (1000 * 60 * 60);
        return hoursSincePublished < 2;
      })
    : news;

  return (
    <div className="fixed top-4 right-4 z-50 w-[380px] max-sm:w-[320px] max-sm:bottom-4 max-sm:top-auto">
      <Card className="shadow-2xl border-primary/20 backdrop-blur-sm bg-background/95">
        {/* Header - Always visible, clickable to toggle */}
        <CardHeader 
          className="cursor-pointer hover:bg-accent/50 transition-colors pb-3"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <CardTitle className="text-base">{t('dashboard:news.liveNews')}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!isOpen && unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {t('dashboard:news.newItems', { count: unreadCount })}
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Tabs - Only visible when open */}
          {isOpen && (
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'all' | 'trending')} className="mt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">{t('dashboard:news.all')}</TabsTrigger>
                <TabsTrigger value="trending">{t('dashboard:news.trending')}</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </CardHeader>

        {/* Content - Only visible when open */}
        {isOpen && (
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t('dashboard:loading')}
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t('dashboard:noDataAvailable')}
              </div>
            ) : (
              <ScrollArea className="h-[600px] max-sm:h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredNews.map((item) => (
                    <Card 
                      key={item.id}
                      className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-md"
                      onClick={() => item.url && window.open(item.url, '_blank')}
                    >
                      <CardContent className="p-4">
                        {/* Timestamp + HOT badge */}
                        <div className="flex items-center gap-2 mb-2">
                          {item.datetime && (Date.now() - new Date(item.datetime).getTime()) < 2 * 60 * 60 * 1000 && (
                            <Badge variant="destructive" className="text-xs">HOT 🔥</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {item.datetime ? formatTime(item.datetime) : t('dashboard:news.justNow')}
                          </span>
                        </div>

                        {/* Title with highlighted keywords */}
                        <h3 className="font-semibold mb-2 text-sm leading-tight">
                          {highlightKeywords(item.headline || '')}
                        </h3>

                        {/* Summary if available */}
                        {item.summary && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {item.summary}
                          </p>
                        )}

                        {/* Category badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.category && (
                            <Badge 
                              variant="outline" 
                              className={CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}
                            >
                              {item.category}
                            </Badge>
                          )}
                        </div>

                        {/* Action icons */}
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Source */}
                        {item.source && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              Source: {item.source}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
