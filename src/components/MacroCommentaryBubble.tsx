import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  X, 
  Minimize2,
  Search,
  Globe,
  TrendingUp,
  Calendar,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MacroCommentaryBubbleProps {
  instrument: string;
  timeframe?: string;
  onClose: () => void;
}

interface AnalysisSection {
  title: string;
  content: string;
  type: "overview" | "technical" | "fundamental" | "outlook";
  expanded: boolean;
}

interface MacroAnalysis {
  query: string;
  timestamp: Date;
  sections: AnalysisSection[];
  sources: Array<{
    title: string;
    url: string;
    type: "news" | "data" | "research";
  }>;
}

export function MacroCommentaryBubble({ instrument, timeframe, onClose }: MacroCommentaryBubbleProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyses, setAnalyses] = useState<MacroAnalysis[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Form parameters
  const [queryParams, setQueryParams] = useState({
    query: "",
    assetType: "currency",
    analysisDepth: "detailed",
    period: "weekly"
  });

  const quickQueries = [
    "Analyse macro EUR/USD pour cette semaine",
    "Impact des données NFP sur le Dollar",
    "Outlook Bitcoin macro conditions",
    "Analyse sentiment risque global"
  ];

  const generateAnalysis = async () => {
    if (!queryParams.query.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI analysis generation
    setTimeout(() => {
      const mockAnalysis: MacroAnalysis = {
        query: queryParams.query,
        timestamp: new Date(),
        sections: [
          {
            title: "Vue d'ensemble du marché",
            content: `L'analyse macro actuelle pour ${instrument} révèle un environnement complexe avec des signaux mixtes. Les banques centrales maintiennent une position prudente face aux pressions inflationnistes persistantes. Les indicateurs économiques récents suggèrent un ralentissement modéré de la croissance dans les principales économies développées.`,
            type: "overview",
            expanded: true
          },
          {
            title: "Analyse technique",
            content: `Sur le plan technique, ${instrument} évolue dans une zone de consolidation avec des niveaux de support et résistance bien définis. Les indicateurs de momentum montrent une divergence baissière à court terme, tandis que la tendance de fond reste intact. Le RSI se situe en zone neutre, laissant place à une évolution dans les deux sens.`,
            type: "technical",
            expanded: false
          },
          {
            title: "Facteurs fondamentaux",
            content: `Les facteurs fondamentaux clés incluent :\n• Politique monétaire: Attente d'un maintien des taux directeurs\n• Inflation: Stabilisation autour des objectifs centraux\n• Croissance: Ralentissement modéré mais contrôlé\n• Géopolitique: Tensions persistantes créant de la volatilité\n• Sentiment de marché: Prudence des investisseurs`,
            type: "fundamental",
            expanded: false
          },
          {
            title: "Perspectives et recommandations",
            content: `Pour la période à venir, nous anticipons une volatilité modérée avec des opportunités sur les mouvements directionnels. Recommandations:\n• Surveillance des annonces de banques centrales\n• Attention aux données d'emploi et d'inflation\n• Suivi des indicateurs de sentiment de marché\n• Opportunités sur les retracements techniques`,
            type: "outlook",
            expanded: false
          }
        ],
        sources: [
          { title: "Fed Meeting Minutes", url: "#", type: "research" },
          { title: "ECB Economic Bulletin", url: "#", type: "research" },
          { title: "US Employment Data", url: "#", type: "data" },
          { title: "Reuters Market Analysis", url: "#", type: "news" }
        ]
      };
      
      setAnalyses(prev => [mockAnalysis, ...prev]);
      setQueryParams(prev => ({ ...prev, query: "" }));
      setIsGenerating(false);
      
      toast({
        title: "Analyse générée",
        description: "Nouvelle analyse macro disponible"
      });
    }, 3000);
  };

  const toggleSection = (analysisIndex: number, sectionIndex: number) => {
    const sectionId = `${analysisIndex}-${sectionIndex}`;
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyAnalysis = (analysis: MacroAnalysis) => {
    const content = `Analyse Macro - ${analysis.query}\n\n${analysis.sections.map(s => `${s.title}:\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(content);
    toast({
      title: "Copié",
      description: "Analyse copiée dans le presse-papier"
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[480px] max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-blue-500/20 bg-background/95 backdrop-blur-lg">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Macro Commentary</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {instrument}
            </Badge>
            <Badge variant="secondary" className="text-xs border-blue-500/20">
              Live Analysis
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Query Interface */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="query">Demande d'analyse</Label>
              <Textarea
                id="query"
                value={queryParams.query}
                onChange={(e) => setQueryParams(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Ex: Analyse macro EUR/USD pour cette semaine"
                className="h-20"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select value={queryParams.assetType} onValueChange={(value) => 
                setQueryParams(prev => ({ ...prev, assetType: value }))
              }>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">Devise</SelectItem>
                  <SelectItem value="commodity">Matière 1ère</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="equity">Actions</SelectItem>
                </SelectContent>
              </Select>

              <Select value={queryParams.analysisDepth} onValueChange={(value) => 
                setQueryParams(prev => ({ ...prev, analysisDepth: value }))
              }>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Résumé</SelectItem>
                  <SelectItem value="detailed">Détaillé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={queryParams.period} onValueChange={(value) => 
                setQueryParams(prev => ({ ...prev, period: value }))
              }>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Query Buttons */}
            <div className="flex flex-wrap gap-1">
              {quickQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setQueryParams(prev => ({ ...prev, query }))}
                >
                  {query}
                </Button>
              ))}
            </div>

            <Button 
              onClick={generateAnalysis} 
              disabled={isGenerating || !queryParams.query.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Générer l'analyse
                </>
              )}
            </Button>
          </div>

          {/* Analyses Results */}
          {analyses.length > 0 && (
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-3">
                {analyses.map((analysis, analysisIndex) => (
                  <Card key={analysisIndex} className="border-blue-500/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{analysis.query}</h4>
                          <p className="text-xs text-muted-foreground">
                            {analysis.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAnalysis(analysis)}
                          className="h-7 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {/* Analysis Sections */}
                      {analysis.sections.map((section, sectionIndex) => {
                        const sectionId = `${analysisIndex}-${sectionIndex}`;
                        const isExpanded = section.expanded || expandedSections.has(sectionId);
                        
                        return (
                          <div key={sectionIndex} className="border rounded-md">
                            <button
                              onClick={() => toggleSection(analysisIndex, sectionIndex)}
                              className="w-full p-2 flex items-center justify-between text-left hover:bg-accent/50 transition-colors rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  section.type === "overview" && "bg-blue-500",
                                  section.type === "technical" && "bg-green-500",
                                  section.type === "fundamental" && "bg-orange-500",
                                  section.type === "outlook" && "bg-purple-500"
                                )} />
                                <span className="font-medium text-xs">{section.title}</span>
                              </div>
                              <ChevronDown className={cn(
                                "h-3 w-3 transition-transform",
                                isExpanded && "rotate-180"
                              )} />
                            </button>
                            
                            {isExpanded && (
                              <div className="px-2 pb-2">
                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                  {section.content}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Sources */}
                      <div className="pt-2 border-t">
                        <h5 className="text-xs font-medium mb-2">Sources</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis.sources.map((source, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => window.open(source.url, '_blank')}
                            >
                              <ExternalLink className="h-2 w-2 mr-1" />
                              {source.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {analyses.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-3 text-blue-500/30" />
              <p className="text-sm">
                Demandez une analyse macro personnalisée
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}