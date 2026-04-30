import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
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
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setMode("login");
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
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
            className="w-24 h-24 mx-auto mb-4"
          >
            <img src={logoImg} alt="Level Up" width={96} height={96} className="w-full h-full object-contain drop-shadow-[0_0_15px_hsl(260,80%,55%,0.5)]" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-glow-purple text-primary tracking-wider">
            LEVEL UP
          </h1>
          <p className="text-muted-foreground font-body mt-2">Sistema de Evolução Pessoal</p>
        </div>

        <div className="bg-card border-glow rounded-xl p-6 space-y-5">
          <h2 className="font-display text-center text-lg text-foreground">
            {mode === "login" ? "ENTRAR NO SISTEMA" : mode === "signup" ? "CRIAR CONTA" : "RECUPERAR SENHA"}
          </h2>

          {mode === "forgot" && (
            <p className="text-center text-sm text-muted-foreground font-body">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          )}

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
            {mode !== "forgot" && (
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
            )}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline font-body"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold glow-purple disabled:opacity-50"
            >
              {loading
                ? "Carregando..."
                : mode === "login"
                ? "ENTRAR"
                : mode === "signup"
                ? "CRIAR CONTA"
                : "ENVIAR LINK"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body">
            {mode === "forgot" ? (
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline font-semibold"
              >
                Voltar para o login
              </button>
            ) : (
              <>
                {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary hover:underline font-semibold"
                >
                  {mode === "login" ? "Criar conta" : "Entrar"}
                </button>
              </>
            )}
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
