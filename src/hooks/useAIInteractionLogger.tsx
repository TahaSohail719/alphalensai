import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type FeatureName = 'trade_setup' | 'market_commentary' | 'report';

interface LogInteractionParams {
  featureName: FeatureName;
  userQuery: string;
  aiResponse: any;
}

export function useAIInteractionLogger() {
  const { user } = useAuth();
  const { toast } = useToast();

  const logInteraction = useCallback(async ({ 
    featureName, 
    userQuery, 
    aiResponse 
  }: LogInteractionParams) => {
    if (!user?.id) {
      console.warn('No authenticated user found for AI interaction logging');
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          feature_name: featureName,
          user_query: userQuery,
          ai_response: aiResponse
        });

      if (error) {
        console.error('Failed to log AI interaction:', error);
        toast({
          title: "Warning",
          description: "Failed to save interaction to history",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error logging AI interaction:', err);
    }
  }, [user?.id, toast]);

  return { logInteraction };
}