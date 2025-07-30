import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  X, 
  Minimize2,
  Plus,
  GripVertical,
  Download,
  Mail,
  FileIcon,
  Settings,
  Loader2,
  Eye,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ReportsBubbleProps {
  instrument: string;
  timeframe?: string;
  onClose: () => void;
}

interface ReportSection {
  id: string;
  title: string;
  description: string;
  included: boolean;
  order: number;
}

interface GeneratedReport {
  id: string;
  title: string;
  sections: ReportSection[];
  customNotes: string;
  exportFormat: string;
  createdAt: Date;
  status: "draft" | "generated" | "exported";
}

export function ReportsBubble({ instrument, timeframe, onClose }: ReportsBubbleProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [step, setStep] = useState<"compose" | "preview" | "generated">("compose");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  // Report composition state
  const [reportConfig, setReportConfig] = useState({
    title: `Rapport ${instrument} - ${new Date().toLocaleDateString()}`,
    customNotes: "",
    exportFormat: "pdf"
  });

  const [availableSections, setAvailableSections] = useState<ReportSection[]>([
    { id: "overview", title: "Vue d'ensemble du marché", description: "Analyse générale et contexte", included: true, order: 1 },
    { id: "technical", title: "Analyse technique", description: "Indicateurs et niveaux clés", included: true, order: 2 },
    { id: "macro", title: "Commentary macro", description: "Facteurs fondamentaux", included: true, order: 3 },
    { id: "trades", title: "Idées de trading", description: "Setups et recommandations", included: false, order: 4 },
    { id: "calendar", title: "Calendrier économique", description: "Événements à venir", included: false, order: 5 },
    { id: "risk", title: "Gestion des risques", description: "Recommandations risk management", included: false, order: 6 }
  ]);

  const exportFormats = [
    { value: "pdf", label: "PDF", icon: FileIcon },
    { value: "html", label: "HTML", icon: FileText },
    { value: "email", label: "Email", icon: Mail }
  ];

  const toggleSection = (sectionId: string) => {
    setAvailableSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, included: !section.included }
          : section
      )
    );
  };

  const moveSectionUp = (sectionId: string) => {
    setAvailableSections(prev => {
      const sections = [...prev];
      const index = sections.findIndex(s => s.id === sectionId);
      if (index > 0) {
        const temp = sections[index].order;
        sections[index].order = sections[index - 1].order;
        sections[index - 1].order = temp;
        return sections.sort((a, b) => a.order - b.order);
      }
      return sections;
    });
  };

  const moveSectionDown = (sectionId: string) => {
    setAvailableSections(prev => {
      const sections = [...prev];
      const index = sections.findIndex(s => s.id === sectionId);
      if (index < sections.length - 1) {
        const temp = sections[index].order;
        sections[index].order = sections[index + 1].order;
        sections[index + 1].order = temp;
        return sections.sort((a, b) => a.order - b.order);
      }
      return sections;
    });
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const report: GeneratedReport = {
        id: Date.now().toString(),
        title: reportConfig.title,
        sections: availableSections.filter(s => s.included),
        customNotes: reportConfig.customNotes,
        exportFormat: reportConfig.exportFormat,
        createdAt: new Date(),
        status: "generated"
      };
      
      setCurrentReport(report);
      setStep("generated");
      setIsGenerating(false);
      
      toast({
        title: "Rapport généré",
        description: "Votre rapport est prêt à être exporté"
      });
    }, 3500);
  };

  const exportReport = () => {
    if (!currentReport) return;
    
    toast({
      title: "Export en cours",
      description: `Génération du fichier ${currentReport.exportFormat.toUpperCase()}`
    });
    
    // Simulate export
    setTimeout(() => {
      toast({
        title: "Rapport exporté",
        description: "Le fichier a été téléchargé avec succès"
      });
    }, 2000);
  };

  const resetComposer = () => {
    setStep("compose");
    setCurrentReport(null);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600"
        >
          <FileText className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[500px] max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-green-500/20 bg-background/95 backdrop-blur-lg">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Report Generator</CardTitle>
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
            <Badge variant="secondary" className="text-xs border-green-500/20">
              {step === "compose" ? "Composition" : step === "preview" ? "Aperçu" : "Généré"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "compose" && (
            <>
              {/* Report Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre du rapport</Label>
                <Input
                  id="title"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nom de votre rapport"
                />
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label>Format d'export</Label>
                <div className="grid grid-cols-3 gap-2">
                  {exportFormats.map((format) => {
                    const IconComponent = format.icon;
                    return (
                      <Button
                        key={format.value}
                        variant={reportConfig.exportFormat === format.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReportConfig(prev => ({ ...prev, exportFormat: format.value }))}
                        className="flex items-center gap-2"
                      >
                        <IconComponent className="h-4 w-4" />
                        {format.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Sections Selection */}
              <div className="space-y-2">
                <Label>Sections à inclure</Label>
                <ScrollArea className="h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {availableSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent/50">
                        <Checkbox
                          id={section.id}
                          checked={section.included}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <div className="flex-1">
                          <label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                            {section.title}
                          </label>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSectionUp(section.id)}
                            className="h-6 w-6 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSectionDown(section.id)}
                            className="h-6 w-6 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Custom Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes personnalisées</Label>
                <Textarea
                  id="notes"
                  value={reportConfig.customNotes}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, customNotes: e.target.value }))}
                  placeholder="Ajoutez vos commentaires personnalisés..."
                  className="h-20"
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateReport} 
                disabled={isGenerating || availableSections.filter(s => s.included).length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </>
          )}

          {step === "generated" && currentReport && (
            <div className="space-y-4">
              {/* Report Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">{currentReport.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Généré le {currentReport.createdAt.toLocaleString()}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sections incluses:</h4>
                  <ul className="text-sm space-y-1">
                    {currentReport.sections.map((section, index) => (
                      <li key={section.id} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {section.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {currentReport.customNotes && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-1">Notes personnalisées:</h4>
                    <p className="text-sm text-muted-foreground">{currentReport.customNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={resetComposer}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter {currentReport.exportFormat.toUpperCase()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}