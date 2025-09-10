import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import alphalensLogo from '@/assets/alphalens-logo.png';

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get current user email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        
        // Check if email is already confirmed
        if (user.email_confirmed_at) {
          navigate('/dashboard');
        }
      } else {
        // No user session, redirect to auth
        navigate('/auth');
      }
    };

    getUser();

    // Listen for auth changes to detect confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
          // Email confirmed, redirect to dashboard
          navigate('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendConfirmation = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Un nouvel email de confirmation vous a été envoyé."
      });
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={alphalensLogo} 
              alt="Alphalens" 
              className="h-12 w-auto"
            />
          </div>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Confirmez votre adresse email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Nous avons envoyé un email de confirmation à <strong>{userEmail}</strong>. 
            Veuillez cliquer sur le lien dans cet email pour activer votre compte.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Vérifiez également votre dossier spam si vous ne trouvez pas l'email.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleResendConfirmation} 
              disabled={loading}
              variant="outline" 
              className="w-full"
            >
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Renvoyer l'email de confirmation
            </Button>
            
            <Button variant="ghost" onClick={handleSignOut} className="w-full">
              Se déconnecter
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            Une fois votre email confirmé, votre compte sera soumis pour approbation par notre équipe.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}