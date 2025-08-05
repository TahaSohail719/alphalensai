import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Info } from 'lucide-react';

interface ApplyToPortfolioButtonTempProps {
  analysisContent: string;
  analysisType: 'macro' | 'asset' | 'report';
  assetSymbol?: string;
  className?: string;
}

export default function ApplyToPortfolioButtonTemp({ 
  analysisContent, 
  analysisType, 
  assetSymbol,
  className 
}: ApplyToPortfolioButtonTempProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour accéder aux recommandations personnalisées",
        variant: "destructive"
      });
      return;
    }
    
    setOpen(true);
    toast({
      title: "Information",
      description: "Veuillez d'abord exécuter la migration de la base de données pour activer les recommandations personnalisées."
    });
  };

  return (
    <>
      <Button variant="outline" onClick={handleClick} className={className}>
        <TrendingUp className="h-4 w-4 mr-2" />
        Apply to Portfolio
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recommandations Personnalisées
            </DialogTitle>
            <DialogDescription>
              Fonctionnalité en attente de migration de base de données
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle>Migration requise</CardTitle>
              <CardDescription>
                Les recommandations IA personnalisées seront disponibles après l'exécution de la migration de base de données.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fonctionnalités à venir :</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Recommandations macro-économiques personnalisées</li>
                  <li>• Actions ciblées sur vos positions</li>
                  <li>• Ajustements contextuels selon le marché</li>
                  <li>• Analyse de risque et allocation optimale</li>
                </ul>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Analyse actuelle :</strong> {analysisType}
                {assetSymbol && (
                  <>
                    <br />
                    <strong>Actif :</strong> {assetSymbol}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}