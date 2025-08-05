import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, TrendingUp, TrendingDown, Trash2, Edit } from 'lucide-react';
import AddPositionDialog from './AddPositionDialog';

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  market_value: number;
}

interface PositionsListProps {
  portfolioId: string;
  onValuationChange: (totalValue: number, totalPnL: number, totalPnLPercent: number) => void;
}

export default function PositionsList({ portfolioId, onValuationChange }: PositionsListProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (portfolioId) {
      fetchPositions();
    }
  }, [portfolioId]);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      const positionsWithPrices = await Promise.all(
        (data || []).map(async (position) => {
          // Get latest price for this symbol
          const { data: priceData } = await supabase
            .from('prices')
            .select('close')
            .eq('symbol', position.symbol)
            .order('date', { ascending: false })
            .limit(1)
            .single();

          const currentPrice = priceData?.close || position.average_price;
          const marketValue = position.quantity * currentPrice;

          return {
            ...position,
            current_price: currentPrice,
            market_value: marketValue,
          };
        })
      );

      setPositions(positionsWithPrices);
      
      // Calculate total valuation
      const totalValue = positionsWithPrices.reduce((sum, pos) => sum + pos.market_value, 0);
      const totalCost = positionsWithPrices.reduce((sum, pos) => sum + (pos.quantity * pos.average_price), 0);
      const totalPnL = totalValue - totalCost;
      const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

      onValuationChange(totalValue, totalPnL, totalPnLPercent);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePosition = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', positionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Position supprimée",
      });

      fetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la position",
        variant: "destructive",
      });
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
        <div className="flex items-center justify-between">
          <CardTitle>Positions</CardTitle>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Position
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune position</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre première position
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Position
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbole</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix Moyen</TableHead>
                  <TableHead className="text-right">Prix Actuel</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const pnl = position.market_value - (position.quantity * position.average_price);
                  const pnlPercent = position.average_price > 0 ? 
                    ((position.current_price - position.average_price) / position.average_price) * 100 : 0;

                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell className="text-right">{position.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${position.average_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${position.current_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${position.market_value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${pnl.toLocaleString()}
                          </span>
                          <Badge variant={pnl >= 0 ? 'default' : 'destructive'} className="text-xs">
                            {pnl >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {pnlPercent.toFixed(2)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePosition(position.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AddPositionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        portfolioId={portfolioId}
        onPositionAdded={fetchPositions}
      />
    </Card>
  );
}