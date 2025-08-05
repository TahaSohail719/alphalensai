import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  total_value: number;
  created_at: string;
}

interface ApplyToPortfolioButtonProps {
  analysisContent: string;
  analysisType: 'macro' | 'asset' | 'report';
  assetSymbol?: string;
  className?: string;
}

export default function ApplyToPortfolioButton({ 
  analysisContent, 
  analysisType, 
  assetSymbol,
  className 
}: ApplyToPortfolioButtonProps) {
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && dialogOpen) {
      fetchPortfolios();
    }
  }, [user, dialogOpen]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      });
    }
  };

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to access personalized recommendations",
        variant: "destructive"
      });
      return;
    }
    
    setDialogOpen(true);
  };

  const handleApply = async () => {
    if (!selectedPortfolio) {
      toast({
        title: "Sélectionner un portefeuille",
        description: "Veuillez sélectionner un portefeuille pour ajouter cette recommandation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Determine recommendation type based on analysis content
      let recommendationType = 'HOLD';
      const analysisLower = analysisContent.toLowerCase();
      
      if (analysisLower.includes('buy') || analysisLower.includes('achat') || analysisLower.includes('acheter')) {
        recommendationType = 'BUY';
      } else if (analysisLower.includes('sell') || analysisLower.includes('vente') || analysisLower.includes('vendre')) {
        recommendationType = 'SELL';
      }

      const { error } = await supabase
        .from('ai_recommendations')
        .insert([
          {
            portfolio_id: selectedPortfolio,
            symbol: assetSymbol || 'GENERAL',
            recommendation_type: recommendationType,
            confidence_score: 0.8,
            reasoning: `Analyse ${analysisType}: ${analysisContent.substring(0, 500)}${analysisContent.length > 500 ? '...' : ''}`,
            is_applied: false,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Recommandation ajoutée à votre portefeuille`,
      });
      
      setDialogOpen(false);
      setSelectedPortfolio('');
    } catch (error) {
      console.error('Error adding recommendation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recommandation au portefeuille",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleClick} className={className}>
        <TrendingUp className="h-4 w-4 mr-2" />
        Apply to Portfolio
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter au Portefeuille</DialogTitle>
            <DialogDescription>
              Ajouter cette analyse {analysisType} à l'un de vos portefeuilles
              {assetSymbol && ` pour ${assetSymbol}`}
            </DialogDescription>
          </DialogHeader>
          
          {portfolios.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Vous n'avez encore aucun portefeuille. Créez-en un d'abord pour ajouter des recommandations.
              </p>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Aller aux Portefeuilles
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sélectionner un Portefeuille</label>
                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un portefeuille" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            {portfolios.length > 0 && (
              <Button onClick={handleApply} disabled={loading || !selectedPortfolio}>
                {loading ? "Ajout..." : "Ajouter Recommandation"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}