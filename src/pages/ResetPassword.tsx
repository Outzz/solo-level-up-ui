import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auto-processes the recovery token from the URL hash and fires a PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also allow if a session already exists (token already exchanged)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Senha redefinida!", description: "Você já pode entrar com sua nova senha." });
      await supabase.auth.signOut();
      navigate("/auth");
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
          <div className="w-24 h-24 mx-auto mb-4">
            <img src={logoImg} alt="Level Up" width={96} height={96} className="w-full h-full object-contain drop-shadow-[0_0_15px_hsl(260,80%,55%,0.5)]" />
          </div>
          <h1 className="text-4xl font-display font-bold text-glow-purple text-primary tracking-wider">
            LEVEL UP
          </h1>
          <p className="text-muted-foreground font-body mt-2">Redefinir Senha</p>
        </div>

        <div className="bg-card border-glow rounded-xl p-6 space-y-5">
          <h2 className="font-display text-center text-lg text-foreground">NOVA SENHA</h2>

          {!ready ? (
            <p className="text-center text-sm text-muted-foreground font-body">
              Validando link de recuperação...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
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
                {loading ? "Salvando..." : "REDEFINIR SENHA"}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
