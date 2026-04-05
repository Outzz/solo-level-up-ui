import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

const STEPS = ["intro", "name", "hashtag", "confirm"] as const;
type Step = (typeof STEPS)[number];

const Onboarding = () => {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setShowGlow(true), 500);
    return () => clearTimeout(t);
  }, []);

  const hunterName = `${name} #${hashtag}`;

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hunter_name: hunterName })
        .eq("user_id", user.id);
      if (error) throw error;
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canProceedName = name.trim().length >= 2 && name.trim().length <= 16;
  const canProceedHashtag = /^\d{3,5}$/.test(hashtag);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP: INTRO */}
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
                className="w-28 h-28 mx-auto"
              >
                <img
                  src={logoImg}
                  alt="Level Up"
                  className={`w-full h-full object-contain transition-all duration-1000 ${showGlow ? "drop-shadow-[0_0_30px_hsl(260,80%,55%,0.7)]" : ""}`}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-wider">
                  SISTEMA DETECTADO
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="space-y-2"
              >
                <p className="text-muted-foreground font-body text-lg">
                  Um novo Hunter foi detectado.
                </p>
                <p className="text-muted-foreground font-body">
                  Antes de iniciar sua jornada, precisamos registrar sua identidade.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("name")}
                  className="px-10 py-4 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg tracking-wide shadow-[0_0_20px_hsl(260,80%,55%,0.4)] hover:shadow-[0_0_30px_hsl(260,80%,55%,0.6)] transition-shadow"
                >
                  INICIAR REGISTRO
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP: NAME */}
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-display text-primary tracking-[0.3em] uppercase"
                >
                  Registro de Hunter — Etapa 1/2
                </motion.p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  QUAL É O SEU NOME, HUNTER?
                </h2>
                <p className="text-muted-foreground font-body text-sm">
                  Escolha o nome que será conhecido em toda a arena.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <label className="block text-xs font-display text-muted-foreground tracking-wider uppercase">
                  Nome do Hunter
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9À-ÿ\s_]/g, ""))}
                  maxLength={16}
                  placeholder="Ex: ShadowSlayer"
                  autoFocus
                  className="w-full bg-input border border-border rounded-lg px-4 py-4 text-xl text-center font-display text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <p className="text-xs text-muted-foreground font-body text-center">
                  {name.length}/16 caracteres • Mínimo 2
                </p>
              </div>

              <div className="flex justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("intro")}
                  className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-display text-sm"
                >
                  VOLTAR
                </motion.button>
                <motion.button
                  whileHover={canProceedName ? { scale: 1.05 } : {}}
                  whileTap={canProceedName ? { scale: 0.95 } : {}}
                  onClick={() => canProceedName && setStep("hashtag")}
                  disabled={!canProceedName}
                  className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_hsl(260,80%,55%,0.3)]"
                >
                  CONTINUAR →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP: HASHTAG */}
          {step === "hashtag" && (
            <motion.div
              key="hashtag"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-display text-primary tracking-[0.3em] uppercase"
                >
                  Registro de Hunter — Etapa 2/2
                </motion.p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  DEFINA SUA HASHTAG
                </h2>
                <p className="text-muted-foreground font-body text-sm">
                  Sua tag numérica única para identificação.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <label className="block text-xs font-display text-muted-foreground tracking-wider uppercase">
                  Tag Numérica
                </label>
                <div className="flex items-center gap-3 justify-center">
                  <span className="text-2xl font-display text-primary font-bold">{name}</span>
                  <span className="text-2xl font-display text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="0000"
                    autoFocus
                    className="w-24 bg-input border border-border rounded-lg px-3 py-4 text-2xl text-center font-display text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-body text-center">
                  De 3 a 5 dígitos numéricos
                </p>
              </div>

              <div className="flex justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("name")}
                  className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-display text-sm"
                >
                  VOLTAR
                </motion.button>
                <motion.button
                  whileHover={canProceedHashtag ? { scale: 1.05 } : {}}
                  whileTap={canProceedHashtag ? { scale: 0.95 } : {}}
                  onClick={() => canProceedHashtag && setStep("confirm")}
                  disabled={!canProceedHashtag}
                  className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_hsl(260,80%,55%,0.3)]"
                >
                  CONTINUAR →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP: CONFIRM */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 mx-auto"
              >
                <img
                  src={logoImg}
                  alt="Level Up"
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_hsl(260,80%,55%,0.6)]"
                />
              </motion.div>

              <div className="space-y-3">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs font-display text-primary tracking-[0.3em] uppercase"
                >
                  Registro Completo
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-display text-muted-foreground"
                >
                  Bem-vindo ao sistema, Hunter
                </motion.h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-card border border-primary/30 rounded-xl p-8 shadow-[0_0_30px_hsl(260,80%,55%,0.15)]"
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-wide">
                  {name}
                  <span className="text-primary ml-2">#{hashtag}</span>
                </p>
                <p className="text-sm text-muted-foreground font-body mt-3">
                  Nível 1 — Caçador Iniciante
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col gap-3 items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-12 py-4 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg tracking-wide shadow-[0_0_25px_hsl(260,80%,55%,0.5)] hover:shadow-[0_0_35px_hsl(260,80%,55%,0.7)] transition-shadow disabled:opacity-50"
                >
                  {loading ? "REGISTRANDO..." : "ARISE, HUNTER"}
                </motion.button>
                <button
                  onClick={() => setStep("name")}
                  className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
                >
                  Alterar nome
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
