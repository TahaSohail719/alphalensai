import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Copy,
  Save,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const sampleAssets = [
  "EUR/USD", "GBP/USD", "USD/JPY", "Gold", "Silver", "Crude Oil", "Bitcoin", "Ethereum"
];

interface WebhookResponse {
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    date?: string;
    last_updated?: string;
  }>;
}

export function MacroCommentary() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentary, setCommentary] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://dorian68.app.n8n.cloud/webhook/4572387f-700e-4987-b768-d98b347bd7f1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "RAG",
          question: query.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);
      
      if (!text.trim()) {
        throw new Error('Empty response from webhook');
      }
      
      const rawData = JSON.parse(text);
      console.log('Parsed JSON:', rawData);
      
      // The response is directly an object, not an array
      if (!rawData.content || !rawData.content.content) {
        console.log('Response data structure:', rawData);
        throw new Error('Invalid response structure - missing content');
      }
      
      const content = rawData.content.content;
      const sources = rawData.citations?.map((url: string) => ({
        title: url.split('/').pop() || url,
        url: url
      }));

      const data: WebhookResponse = {
        content,
        sources
      };
      
      setCommentary(data);
      
      toast({
        title: "Analysis Generated",
        description: "Successfully generated macro commentary",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate commentary';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (asset: string) => {
    setQuery(`Give me a macro view on ${asset} this week`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Macro Commentary Generator</h2>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive market analysis and macro insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Live Data
          </Badge>
        </div>
      </div>

      {/* Query Interface */}
      <Card className="gradient-card border-border-light shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Query Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Give me a macro view on EUR/USD this week"
              className="flex-1 bg-background/50 border-border-light"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </form>

          {/* Quick Queries */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick queries:</p>
            <div className="flex flex-wrap gap-2">
              {sampleAssets.map((asset) => (
                <Button
                  key={asset}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuery(asset)}
                  className="text-xs"
                >
                  {asset}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-danger/20 bg-danger/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Error generating commentary</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Commentary Display */}
      {commentary && (
        <div className="space-y-4">
          <Card className="gradient-card border-border-light shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Macro Commentary
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(commentary.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Content */}
              <div className="space-y-6">
                {commentary.content.split('\n\n').map((section, index) => {
                  // Check if this is a title/heading
                  if (section.includes('Weekly Outlook') || section.includes('Executive Summary') || 
                      section.includes('Fundamental Analysis') || section.includes('Directional Bias') ||
                      section.includes('Key Levels') || section.includes('AI Insights Breakdown') ||
                      section.includes('Toggle GPT') || section.includes('Toggle Curated')) {
                    return (
                      <div key={index} className="space-y-3">
                        {section.split('\n').map((line, lineIndex) => {
                          if (lineIndex === 0 && (line.includes('Weekly Outlook') || 
                              line.includes('Executive Summary') || 
                              line.includes('Fundamental Analysis') ||
                              line.includes('Directional Bias') ||
                              line.includes('Key Levels') ||
                              line.includes('AI Insights Breakdown') ||
                              line.includes('Toggle GPT') ||
                              line.includes('Toggle Curated'))) {
                            return (
                              <h3 key={lineIndex} className="text-lg font-bold text-primary border-b border-border pb-2">
                                {line}
                              </h3>
                            );
                          }
                          
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={lineIndex} className="font-semibold text-foreground text-base leading-relaxed">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          
                          if (line.startsWith('- **')) {
                            const boldText = line.match(/\*\*(.*?)\*\*/)?.[1] || '';
                            const remainingText = line.replace(/- \*\*(.*?)\*\*:?/, '').trim();
                            return (
                              <div key={lineIndex} className="flex gap-3 text-sm leading-relaxed">
                                <span className="text-primary mt-1">•</span>
                                <div>
                                  <span className="font-semibold text-foreground">{boldText}</span>
                                  {remainingText && <span className="text-muted-foreground">: {remainingText}</span>}
                                </div>
                              </div>
                            );
                          }
                          
                          if (line.startsWith('Support') || line.startsWith('Resistance')) {
                            return (
                              <h4 key={lineIndex} className="font-semibold text-foreground text-sm mt-3 mb-1">
                                {line}
                              </h4>
                            );
                          }
                          
                          if (line.startsWith('- **$') || line.startsWith('- **€') || line.startsWith('- **£')) {
                            const levelText = line.replace(/- \*\*(.*?)\*\*/, '$1');
                            const description = line.includes('(') ? line.match(/\((.*?)\)/)?.[1] : '';
                            return (
                              <div key={lineIndex} className="flex items-center gap-2 text-sm ml-4">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                <span className="font-mono font-semibold text-primary">{levelText.split('**')[0]}</span>
                                {description && <span className="text-muted-foreground">({description})</span>}
                              </div>
                            );
                          }
                          
                          if (line.includes('Bullish') || line.includes('Bearish') || line.includes('Neutral')) {
                            return (
                              <div key={lineIndex} className="flex items-center gap-2 text-sm">
                                <Badge variant={line.includes('Bullish') ? 'default' : line.includes('Bearish') ? 'destructive' : 'secondary'} className="text-xs">
                                  {line.trim()}
                                </Badge>
                              </div>
                            );
                          }
                          
                          if (line.includes('Confidence:')) {
                            return (
                              <div key={lineIndex} className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className="font-semibold text-primary">{line.replace('Confidence:', '').trim()}</span>
                              </div>
                            );
                          }
                          
                          return (
                            <p key={lineIndex} className="text-sm text-muted-foreground leading-relaxed">
                              {line.replace(/\[(\d+)\]/g, (match, num) => `[${num}]`)}
                            </p>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  return (
                    <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                      {section.replace(/\[(\d+)\]/g, (match, num) => `[${num}]`)}
                    </p>
                  );
                })}
              </div>

              {/* Sources */}
              {commentary.sources && commentary.sources.length > 0 && (
                <>
                  <Separator className="bg-border-light" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      Sources
                    </h4>
                    <div className="space-y-2">
                      {commentary.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}