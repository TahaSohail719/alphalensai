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
                src="/lovable-uploads/e38d6c4f-1947-43bd-ba24-1b5604dac33a.png" 
                alt="alphalens.ai logo" 
                className="h-32 w-auto drop-shadow-2xl hover:scale-110 transition-all duration-500 filter saturate-150"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-orange-500/30 rounded-full blur-3xl -z-10 animate-pulse" />
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
              <Sparkles className="h-8 w-8 text-orange-500 animate-spin" />
              <h2 className="text-2xl md:text-3xl text-foreground font-bold bg-gradient-to-r from-blue-800 to-orange-500 bg-clip-text text-transparent">
                Next-Generation Financial Intelligence
              </h2>
              <Sparkles className="h-8 w-8 text-blue-700 animate-spin delay-500" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              Institutional-grade macro analysis enriched with AI-driven insights and real-time data. 
              Transform market complexity into clear, actionable investment opportunities.
            </p>
          </div>
          
          {/* Enhanced CTA Section */}
          <div className="flex flex-col gap-8 justify-center items-center animate-fade-in delay-400">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-16 py-8 text-xl font-bold bg-gradient-to-r from-blue-800 via-orange-500 to-blue-700 hover:from-blue-700 hover:via-orange-600 hover:to-blue-800 shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 group transform hover:scale-105 border-0"
                >
                  <Rocket className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Request Demo
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
                className="px-10 py-6 text-lg font-semibold border-2 border-blue-700/50 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" 
                asChild
              >
                <Link to="/auth">
                  <Users className="mr-2 h-5 w-5" />
                  Sign Up
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg font-semibold border-2 border-orange-500/50 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm" 
                asChild
              >
                <Link to="/auth">
                  <Globe className="mr-2 h-5 w-5" />
                  Login
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
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-blue-800 to-orange-500 bg-clip-text text-transparent mb-6">
              Revolutionize Your Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From market complexity to actionable clarity in just a few clicks
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Enhanced Problem */}
            <Card className="p-10 bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="space-y-8">
                <div className="inline-flex items-center px-6 py-3 bg-red-200/80 text-red-700 rounded-full text-base font-bold border border-red-300">
                  <AlertTriangle className="h-5 w-5 mr-3 animate-pulse" />
                  The Current Challenge
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Drowning in Data,<br />
                  <span className="text-red-600">Starving for Insights</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Financial markets generate overwhelming volumes of data. Traders spend hours 
                  sifting through scattered information, struggling to identify opportunities while conditions change rapidly.
                </p>
                <div className="flex items-center gap-4 text-red-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Information overload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-200" />
                    <span className="text-sm font-medium">Scattered analysis</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Enhanced Solution */}
            <Card className="p-10 bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="space-y-8">
                <div className="inline-flex items-center px-6 py-3 bg-green-200/80 text-green-700 rounded-full text-base font-bold border border-green-300">
                  <Sparkles className="h-5 w-5 mr-3 animate-spin" />
                  Our Solution
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  AI-Powered Analysis<br />
                  <span className="text-green-600">at Institutional Scale</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  alphalens.ai combines cutting-edge AI with institutional research expertise, delivering 
                  precise trading setups and reports that transform complexity into clarity.
                </p>
                <div className="flex items-center gap-4 text-green-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Artificial intelligence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200" />
                    <span className="text-sm font-medium">Institutional research</span>
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
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full text-base font-bold text-blue-800 mb-6 border border-blue-200">
              <Zap className="h-5 w-5 mr-3 animate-pulse" />
              Advanced Features
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-blue-800 to-orange-500 bg-clip-text text-transparent mb-8">
              Next-Generation Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Discover a complete suite of analysis tools designed for today's markets
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-background/80 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:rotate-1 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-orange-50/50 to-blue-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-800 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 border border-blue-200">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center group-hover:text-blue-800 transition-colors duration-300 font-bold">
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
                      className="opacity-0 group-hover:opacity-100 transition-all duration-500 text-blue-800 hover:bg-blue-800 hover:text-white rounded-full px-6 border border-blue-200 hover:border-blue-800"
                      asChild
                    >
                      <Link to="/dashboard">
                        Discover <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <PieChart className="h-8 w-8 text-blue-700" />
                <h3 className="text-xl font-bold text-blue-800">Quantitative Analysis</h3>
              </div>
              <p className="text-muted-foreground">Advanced mathematical models for risk assessment and opportunity evaluation</p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <Activity className="h-8 w-8 text-orange-600" />
                <h3 className="text-xl font-bold text-orange-700">Real-Time Data</h3>
              </div>
              <p className="text-muted-foreground">Continuous data feeds for decisions based on current market conditions</p>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Risk Management</h3>
              </div>
              <p className="text-muted-foreground">Sophisticated tools for monitoring and controlling exposures</p>
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
            <Card className="p-8 h-full bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Brain className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-800">OptiQuant IA</h3>
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
            
            <Card className="p-8 h-full bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-700">ABCG Research</h3>
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
            <Card className="p-8 bg-gradient-to-r from-blue-50 via-background to-orange-50">
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-orange-500 to-blue-700 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/80 via-orange-500/70 to-blue-700/80" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="p-16 rounded-3xl text-white shadow-2xl backdrop-blur-sm border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Rocket className="h-12 w-12 text-white animate-bounce" />
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to Transform<br />Your Financial Analysis?
            </h2>
            <p className="text-xl md:text-2xl opacity-95 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join institutional traders and analysts who trust alphalens.ai 
              for their decisive market insights.
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