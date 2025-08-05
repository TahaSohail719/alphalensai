import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Recommendation {
  id: string;
  symbol: string;
  recommendation_type: string;
  confidence_score: number;
  reasoning: string;
  target_price: number;
  is_applied: boolean;
  created_at: string;
}

interface RecommendationsListProps {
  portfolioId: string;
}

export default function RecommendationsList({ portfolioId }: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (portfolioId) {
      fetchRecommendations();
    }
  }, [portfolioId]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsApplied = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_applied: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendation marked as applied",
      });

      fetchRecommendations();
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to update recommendation",
        variant: "destructive",
      });
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
            <p className="text-muted-foreground">
              AI recommendations will appear here when you use "Apply to Portfolio"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${rec.is_applied ? 'bg-muted/50' : 'bg-card'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getRecommendationColor(rec.recommendation_type)}`}>
                      {getRecommendationIcon(rec.recommendation_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rec.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {rec.recommendation_type}
                        </Badge>
                        {rec.is_applied && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(rec.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </p>
                    {rec.target_price && (
                      <p className="text-sm font-medium">
                        Target: ${rec.target_price}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {rec.reasoning}
                </p>

                {!rec.is_applied && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsApplied(rec.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Applied
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}