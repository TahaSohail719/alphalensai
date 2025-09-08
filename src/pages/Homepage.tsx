import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  FileText, 
  Brain, 
  LineChart,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Activity,
  AlertTriangle,
  PieChart,
  Users,
  Globe,
  Rocket
} from 'lucide-react';

export default function Homepage() {
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Add backend endpoint for demo requests
      console.warn('TODO: Implement demo request endpoint', demoFormData);
      
      toast({
        title: "Demo Request Submitted",
        description: "We'll get back to you shortly."
      });
      
      setDemoFormData({ name: '', email: '', company: '', message: '' });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit demo request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Macro & Market Commentary",
      description: "Institutional-style outlooks powered by GPT + ABCG Research"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Technical Analysis Integration", 
      description: "TradingView-like signals + indicators to validate trend/momentum/levels"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Trade Idea Cards (SL/TP/RR)",
      description: "Directional setups with stop-loss, take-profit, and risk/reward rationale"
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Report/Brief Generator",
      description: "Daily/weekly briefs, exportable PDF/HTML, research cards"
    }
  ];

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-success/15 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-chart-1/20 via-transparent to-chart-3/15" />
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-transparent via-primary/5 to-accent/10 opacity-70"
          style={{ transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.05}deg)` }}
        />
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-l from-success/25 to-chart-2/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-chart-1/30 to-chart-4/20 rounded-full blur-xl animate-pulse delay-300" />
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-tl from-accent/25 to-primary/15 rounded-full blur-2xl animate-bounce delay-1000" />
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          {/* Logo Section with New Assets */}
          <div className="flex flex-col items-center mb-12 animate-scale-in">
            <div className="relative mb-6">
              {/* Logo */}
              <img 
                src="/lovable-uploads/635272b8-b111-4fd1-ab2a-1d95c280e6b6.png" 
                alt="alphalens.ai logo" 
                className="h-24 w-auto drop-shadow-2xl hover:scale-110 transition-all duration-500 filter saturate-150"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/30 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
            {/* Brand Name */}
            <img 
              src="/lovable-uploads/4c3adeb5-400f-4ac7-9d77-160bcd8ee6ed.png" 
              alt="alphalens.ai" 
              className="h-16 w-auto drop-shadow-xl hover:scale-105 transition-all duration-300"
            />
          </div>
          
          {/* Enhanced Hero Content */}
          <div className="space-y-8 mb-16">
            <div className="flex items-center justify-center gap-3 animate-fade-in delay-200">
              <Sparkles className="h-8 w-8 text-accent animate-spin" />
              <h2 className="text-2xl md:text-3xl text-foreground font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Intelligence Financière de Nouvelle Génération
              </h2>
              <Sparkles className="h-8 w-8 text-primary animate-spin delay-500" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              Analyse macro-économique institutionnelle enrichie par l'IA et les données en temps réel. 
              Transformez la complexité des marchés en opportunités d'investissement claires et actionnables.
            </p>
          </div>
          
          {/* Enhanced CTA Section */}
          <div className="flex flex-col gap-8 justify-center items-center animate-fade-in delay-400">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-16 py-8 text-xl font-bold bg-gradient-to-r from-primary via-accent to-success hover:from-success hover:via-accent hover:to-primary shadow-2xl hover:shadow-primary/50 transition-all duration-500 group transform hover:scale-105 border-0"
                >
                  <Rocket className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Demander une Démo
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Request Demo</DialogTitle>
                  <DialogDescription className="text-center">
                    Get a personalized demo of alphalens.ai for your team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-name">Name *</Label>
                    <Input
                      id="demo-name"
                      value={demoFormData.name}
                      onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Email *</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      value={demoFormData.email}
                      onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-company">Company/Broker</Label>
                    <Input
                      id="demo-company"
                      value={demoFormData.company}
                      onChange={(e) => setDemoFormData({ ...demoFormData, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-message">Message</Label>
                    <Textarea
                      id="demo-message"
                      value={demoFormData.message}
                      onChange={(e) => setDemoFormData({ ...demoFormData, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <div className="flex gap-6">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg font-semibold border-2 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" 
                asChild
              >
                <Link to="/auth">
                  <Users className="mr-2 h-5 w-5" />
                  S'inscrire
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg font-semibold border-2 border-accent/50 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" 
                asChild
              >
                <Link to="/auth">
                  <Globe className="mr-2 h-5 w-5" />
                  Se connecter
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Problem/Solution Narrative with Enhanced Design */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-background via-background/95 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-success" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
              Révolutionnez Votre Analyse
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              De la complexité du marché à la clarté de l'action en quelques clics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Enhanced Problem */}
            <Card className="p-10 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="space-y-8">
                <div className="inline-flex items-center px-6 py-3 bg-destructive/15 text-destructive rounded-full text-base font-bold border border-destructive/30">
                  <AlertTriangle className="h-5 w-5 mr-3 animate-pulse" />
                  Le Défi Actuel
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Submergés par la Data,<br />
                  <span className="text-destructive">Affamés d'Insights</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Les marchés financiers génèrent des volumes de données écrasants. Les traders passent des heures 
                  à éplucher des informations dispersées, peinant à identifier les opportunités pendant que les conditions changent.
                </p>
                <div className="flex items-center gap-4 text-destructive">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Surcharge informationnelle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse delay-200" />
                    <span className="text-sm font-medium">Analyse dispersée</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Enhanced Solution */}
            <Card className="p-10 bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="space-y-8">
                <div className="inline-flex items-center px-6 py-3 bg-success/15 text-success rounded-full text-base font-bold border border-success/30">
                  <Sparkles className="h-5 w-5 mr-3 animate-spin" />
                  Notre Solution
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Analyse IA<br />
                  <span className="text-success">à l'Échelle Institutionnelle</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  alphalens.ai combine l'IA de pointe avec l'expertise de recherche institutionnelle, livrant 
                  des setups de trading précis et des rapports qui transforment la complexité en clarté.
                </p>
                <div className="flex items-center gap-4 text-success">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Intelligence artificielle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse delay-200" />
                    <span className="text-sm font-medium">Recherche institutionnelle</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Feature Highlights */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-background to-chart-3/5" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full text-base font-bold text-primary mb-6 border border-primary/20">
              <Zap className="h-5 w-5 mr-3 animate-pulse" />
              Fonctionnalités Avancées
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-8">
              Outils de Nouvelle Génération
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Découvrez une suite complète d'outils d'analyse conçus pour les marchés d'aujourd'hui
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-background/80 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:rotate-1 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 border border-primary/20">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center group-hover:text-primary transition-colors duration-300 font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <CardDescription className="text-center text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-6 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-500 text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6 border border-primary/20 hover:border-primary"
                      asChild
                    >
                      <Link to="/dashboard">
                        Découvrir <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="p-8 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <PieChart className="h-8 w-8 text-chart-1" />
                <h3 className="text-xl font-bold text-chart-1">Analyse Quantitative</h3>
              </div>
              <p className="text-muted-foreground">Modèles mathématiques avancés pour l'évaluation des risques et opportunités</p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-chart-3/10 to-chart-4/10 border-chart-3/20 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <Activity className="h-8 w-8 text-chart-3" />
                <h3 className="text-xl font-bold text-chart-3">Données Temps Réel</h3>
              </div>
              <p className="text-muted-foreground">Flux de données en continu pour des décisions basées sur l'actualité du marché</p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-success/10 to-chart-5/10 border-success/20 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="h-8 w-8 text-success" />
                <h3 className="text-xl font-bold text-success">Gestion des Risques</h3>
              </div>
              <p className="text-muted-foreground">Outils sophistiqués de monitoring et contrôle des expositions</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powered by Expert Collaboration
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A strategic partnership combining AI innovation with institutional research excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-glow-primary transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">OptiQuant IA</h3>
                  <p className="text-muted-foreground">Quantitative AI Specialists</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Leading experts in quantitative finance, artificial intelligence, and intelligent decision-making tools for businesses.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.optiquant-ia.com/" target="_blank" rel="noopener noreferrer">
                  Visit OptiQuant IA <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
            
            <Card className="p-8 h-full bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-glow-success transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Activity className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-accent">ABCG Research</h3>
                  <p className="text-muted-foreground">Macroeconomic Research</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Leading macroeconomic research and financial insights firm delivering institutional-grade analysis and market intelligence.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://research.albaricg.com/" target="_blank" rel="noopener noreferrer">
                  Visit ABCG Research <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
          </div>
          
          <div className="mt-16 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/5 via-background to-accent/5">
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Delivering institutional-grade macro analysis enriched with AI-driven insights and real-time data. 
                We combine OptiQuant IA's quantitative expertise with ABCG Research's market intelligence to provide 
                traders and analysts with the clarity they need to make confident decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Strip */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-success animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/70 to-success/80" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="p-16 rounded-3xl text-white shadow-2xl backdrop-blur-sm border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Rocket className="h-12 w-12 text-white animate-bounce" />
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Prêt à Révolutionner<br />Votre Analyse Financière ?
            </h2>
            <p className="text-xl md:text-2xl opacity-95 mb-12 max-w-3xl mx-auto leading-relaxed">
              Rejoignez les traders et analystes institutionnels qui font confiance à alphalens.ai 
              pour leurs insights de marché décisifs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-medium"
                  >
                    Request Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Request Demo</DialogTitle>
                    <DialogDescription className="text-center">
                      Get a personalized demo of alphalens.ai for your team.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-demo-name">Name *</Label>
                      <Input
                        id="cta-demo-name"
                        value={demoFormData.name}
                        onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-demo-email">Email *</Label>
                      <Input
                        id="cta-demo-email"
                        type="email"
                        value={demoFormData.email}
                        onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-demo-company">Company/Broker</Label>
                      <Input
                        id="cta-demo-company"
                        value={demoFormData.company}
                        onChange={(e) => setDemoFormData({ ...demoFormData, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-demo-message">Message</Label>
                      <Textarea
                        id="cta-demo-message"
                        value={demoFormData.message}
                        onChange={(e) => setDemoFormData({ ...demoFormData, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary" 
                asChild
              >
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Trusted by Financial Professionals
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Built with transparency standards and data provenance at its core, delivering institutional-grade 
            analysis that brokers, portfolio managers, and analysts trust for critical trading decisions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <div className="text-3xl font-bold text-success mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Reliability</div>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">&lt;2s</div>
              <div className="text-sm text-muted-foreground">Analysis Response Time</div>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="text-3xl font-bold text-accent mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Market Coverage</div>
            </Card>
          </div>
          
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <span className="text-foreground font-medium">
              Enterprise-grade security & compliance ready
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-background-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/4c3adeb5-400f-4ac7-9d77-160bcd8ee6ed.png" 
                  alt="alphalens.ai" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-muted-foreground text-center md:text-left max-w-md">
                Intelligent financial analysis powered by AI and institutional research expertise.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-8 text-muted-foreground">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-primary transition-fast font-medium">Request Demo</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Request Demo</DialogTitle>
                    <DialogDescription className="text-center">
                      Get a personalized demo of alphalens.ai for your team.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-demo-name">Name *</Label>
                      <Input
                        id="footer-demo-name"
                        value={demoFormData.name}
                        onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-demo-email">Email *</Label>
                      <Input
                        id="footer-demo-email"
                        type="email"
                        value={demoFormData.email}
                        onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-demo-company">Company/Broker</Label>
                      <Input
                        id="footer-demo-company"
                        value={demoFormData.company}
                        onChange={(e) => setDemoFormData({ ...demoFormData, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-demo-message">Message</Label>
                      <Textarea
                        id="footer-demo-message"
                        value={demoFormData.message}
                        onChange={(e) => setDemoFormData({ ...demoFormData, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Link to="/auth" className="hover:text-primary transition-fast font-medium">
                Sign Up
              </Link>
              <Link to="/auth" className="hover:text-primary transition-fast font-medium">
                Login
              </Link>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 alphalens.ai - A collaboration between OptiQuant IA and ABCG Research
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}