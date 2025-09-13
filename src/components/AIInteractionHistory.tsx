import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, MessageSquare, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AIInteraction {
  id: string;
  feature_name: string;
  user_query: string;
  ai_response: any;
  created_at: string;
  user_id: string;
}

const FEATURES = [
  { value: 'all', label: 'All Features' },
  { value: 'trade_setup', label: 'AI Trade Setup' },
  { value: 'market_commentary', label: 'Market Commentary' },
  { value: 'report', label: 'Reports' }
];

const FEATURE_ICONS = {
  trade_setup: TrendingUp,
  market_commentary: MessageSquare,
  report: FileText
};

const FEATURE_COLORS = {
  trade_setup: 'bg-blue-100 text-blue-800',
  market_commentary: 'bg-green-100 text-green-800',
  report: 'bg-purple-100 text-purple-800'
};

export function AIInteractionHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInteractions = async (offset = 0, limit = 20) => {
    if (!user?.id) return [];

    let query = supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (selectedFeature !== 'all') {
      query = query.eq('feature_name', selectedFeature);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AI interactions:', error);
      toast({
        title: "Error",
        description: "Failed to load interaction history",
        variant: "destructive"
      });
      return [];
    }

    return data || [];
  };

  const loadInitialData = async () => {
    setLoading(true);
    const data = await fetchInteractions(0, 20);
    setInteractions(data);
    setHasMore(data.length === 20);
    setLoading(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const newData = await fetchInteractions(interactions.length, 20);
    setInteractions(prev => [...prev, ...newData]);
    setHasMore(newData.length === 20);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id, selectedFeature]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderResponse = (response: any) => {
    if (typeof response === 'string') {
      return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{response}</p>;
    }
    
    if (typeof response === 'object' && response !== null) {
      return (
        <pre className="text-sm text-muted-foreground bg-muted p-3 rounded-md overflow-auto max-h-96">
          {JSON.stringify(response, null, 2)}
        </pre>
      );
    }
    
    return <p className="text-sm text-muted-foreground">No response data</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Interaction History</h2>
        <Select value={selectedFeature} onValueChange={setSelectedFeature}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by feature" />
          </SelectTrigger>
          <SelectContent>
            {FEATURES.map(feature => (
              <SelectItem key={feature.value} value={feature.value}>
                {feature.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {interactions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No interactions found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Start using AI features to see your interaction history here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => {
            const featureName = interaction.feature_name as keyof typeof FEATURE_ICONS;
            const Icon = FEATURE_ICONS[featureName] || MessageSquare;
            const isExpanded = expandedItems.has(interaction.id);
            return (
              <Card key={interaction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">
                          {FEATURES.find(f => f.value === interaction.feature_name)?.label}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(interaction.created_at)}
                          </span>
                          <Badge className={FEATURE_COLORS[featureName] || 'bg-gray-100 text-gray-800'}>
                            {interaction.feature_name.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(interaction.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">User Query:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {interaction.user_query}
                      </p>
                    </div>

                    <Collapsible open={isExpanded}>
                      <CollapsibleContent>
                        <div>
                          <h4 className="font-medium text-sm mb-2">AI Response:</h4>
                          {renderResponse(interaction.ai_response)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}