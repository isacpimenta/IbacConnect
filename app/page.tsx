"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    const clearZombies = async () => {
      await supabase.auth.signOut();
    };
    clearZombies();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current || isLocked) return;
    
    if (attempts >= 5) {
      setIsLocked(true);
      setMessage({ type: 'error', text: "Muitas tentativas. Aguarde 30 segundos." });
      setTimeout(() => { setAttempts(0); setIsLocked(false); }, 30000);
      return;
    }

    setLoading(true);
    isSubmitting.current = true;
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (error) {
        setAttempts(prev => prev + 1);
        setMessage({ type: 'error', text: "E-mail ou senha incorretos." });
      } else if (data?.user) {
        router.push("/home");
        router.refresh(); 
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Erro de conexão seguro." });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleRecuperarSenha = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Digite seu e-mail acima primeiro." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinirsenha`,
    });
    if (error) setMessage({ type: 'error', text: "Erro ao enviar link." });
    else setMessage({ type: 'success', text: "Link enviado! Verifique seu e-mail." });
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white overflow-hidden">
      
      {/* Bloqueio de Brute Force */}
      <AnimatePresence>
        {isLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="text-red-500 mb-4" size={48} />
            <h2 className="font-black uppercase text-sm">Acesso Bloqueado</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-2">Aguarde 30 segundos para tentar novamente.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
        <img src="/logo.png" alt="IBAC Logo" className="w-32" />
      </motion.div>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-5">
        
        <AnimatePresence mode="wait">
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT EMAIL */}
        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">E-mail Pessoal :</label>
          <input 
            required type="email" placeholder="seu@email.com" value={email}
            onChange={e => setEmail(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        {/* INPUT SENHA + ESQUECEU SENHA */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="font-black text-[10px] uppercase text-gray-400">Senha Segura :</label>
            <button type="button" onClick={handleRecuperarSenha} className="text-[9px] font-black uppercase text-[#F47920]">
              Esqueceu a senha?
            </button>
          </div>
          <input 
            required type="password" placeholder="••••••••" value={senha}
            onChange={e => setSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        {/* LINK DE CADASTRO (VOLTOU!) */}
        <div className="flex flex-col items-center gap-3 pt-2">
           <p className="text-[10px] font-bold uppercase text-gray-400">
             Ainda não tem acesso?
           </p>
           <Link href="/cadastro" className="flex items-center gap-2 px-6 py-2 bg-orange-50 text-[#F47920] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-colors">
             <UserPlus size={14} /> Criar nova conta
           </Link>
        </div>

        {/* BOTÃO ENTRAR */}
        <div className="flex justify-center pt-6"> 
          <motion.button
            type="submit" disabled={loading} whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-20 h-20 bg-[#F47920] rounded-[28px] shadow-2xl shadow-orange-200 text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={32} strokeWidth={3} />}
          </motion.button>
        </div>
      </form>

      <footer className="mt-16 flex flex-col items-center gap-2 opacity-30">
        <ShieldCheck size={18} className="text-gray-400" />
        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 text-center leading-relaxed">
          Igreja Batista Acolher <br/> Ambiente Criptografado
        </p>
      </footer>
    </main>
  );
}