import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getOAuthRedirectUrl = () => `${window.location.origin}/auth`;

  const validateOAuthUrl = (url: string) => {
    const oauthUrl = new URL(url, window.location.origin);
    const authHost = new URL(import.meta.env.VITE_SUPABASE_URL).hostname;
    const isSecure = oauthUrl.protocol === "https:";
    const isTrustedHost =
      oauthUrl.hostname === authHost ||
      oauthUrl.hostname === "accounts.google.com" ||
      oauthUrl.hostname.endsWith(".google.com");

    if (!isSecure || !isTrustedHost) {
      throw new Error("URL de autenticação inválida.");
    }

    return oauthUrl.toString();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthRedirectUrl(),
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Não foi possível iniciar o login com Google.");

      window.location.assign(validateOAuthUrl(data.url));
      return;
    } catch (primaryError: any) {
      try {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: getOAuthRedirectUrl(),
        });
        if (result.error) throw result.error;
      } catch (fallbackError: any) {
        toast({
          title: "Erro",
          description: fallbackError?.message || primaryError?.message || "Falha no login com Google.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-purple"
          >
            <Swords size={36} className="text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-glow-purple text-primary tracking-wider">
            SOLO LIFE
          </h1>
          <p className="text-muted-foreground font-body mt-2">Sistema de Evolução Pessoal</p>
        </div>

        <div className="bg-card border-glow rounded-xl p-6 space-y-5">
          <h2 className="font-display text-center text-lg text-foreground">
            {isLogin ? "ENTRAR NO SISTEMA" : "CRIAR CONTA"}
          </h2>

          {/* Social logins */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-secondary text-foreground font-body font-semibold border border-border hover:border-primary/50 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </motion.button>

          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-body">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold glow-purple disabled:opacity-50"
            >
              {loading ? "Carregando..." : isLogin ? "ENTRAR" : "CRIAR CONTA"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-semibold"
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          Arise, Hunter — Sua jornada começa agora
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
