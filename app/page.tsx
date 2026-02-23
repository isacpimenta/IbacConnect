"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Limpeza preventiva de sessões corrompidas
  useEffect(() => {
    const checkSession = async () => {
      try {
        await supabase.auth.getSession();
      } catch (e) {
        console.warn("Limpando vestígios de sessão corrompida...");
        localStorage.clear();
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        let errorMsg = "Erro ao entrar. Verifique seus dados.";
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "E-mail ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "Por favor, confirme seu e-mail antes de entrar.";
        }
        setMessage({ type: 'error', text: errorMsg });
      } else if (data?.user) {
        router.push("/home");
        router.refresh(); 
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "Erro crítico no login. Limpe o cache do navegador." });
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Digite seu e-mail para recuperar a senha." });
      return;
    }
    setLoading(true);
    setMessage(null);

    // SOLUÇÃO DO REDIRECIONAMENTO:
    // O link agora passa pelo callback para validar o código PKCE no servidor antes de ir para a página final
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    if (error) {
      setMessage({ type: 'error', text: "Erro: " + error.message });
    } else {
      setMessage({ type: 'success', text: "Link de recuperação enviado ao seu e-mail!" });
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12"
      >
        <img src="/logo.png" alt="IBAC Logo" className="w-32" />
      </motion.div>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-5">
        
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight leading-tight ${
                message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}
            >
              {message.type === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">E-mail Corporativo :</label>
          <input 
            required 
            type="email" 
            placeholder="exemplo@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/20 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="font-black text-[10px] uppercase text-gray-400">Senha Segura :</label>
            <button 
              type="button"
              onClick={handleRecuperarSenha}
              className="text-[9px] font-black uppercase text-[#F47920] hover:opacity-70 transition-opacity"
            >
              Esqueceu?
            </button>
          </div>
          <input 
            required 
            type="password" 
            placeholder="••••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/20 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
          />
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-tight text-gray-400 pt-2">
          Novo por aqui?{" "}
          <Link href="/cadastro" className="text-[#F47920] font-black hover:underline">
            Criar conta
          </Link>
        </p>

        <div className="flex justify-center pt-6"> 
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-20 h-20 bg-[#F47920] rounded-[28px] shadow-2xl shadow-orange-200 text-white disabled:opacity-50 disabled:grayscale transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={32} strokeWidth={3} />}
          </motion.button>
        </div>
      </form>

      <footer className="mt-16 flex flex-col items-center gap-2 opacity-30">
        <ShieldCheck size={18} className="text-gray-400" />
        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 text-center">
          Igreja Batista Acolher <br/> Sistema de Autenticação Segura
        </p>
      </footer>
    </main>
  );
}