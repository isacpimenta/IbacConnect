"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenha() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // O Supabase lida com o token automaticamente através da URL
  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setMessage({ type: 'error', text: "As senhas não coincidem." });
      return;
    }

    if (novaSenha.length < 6) {
      setMessage({ type: 'error', text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });

    if (error) {
      setMessage({ type: 'error', text: "Erro ao atualizar: " + error.message });
    } else {
      setMessage({ type: 'success', text: "Senha atualizada com sucesso! Redirecionando..." });
      
      // Espera 2 segundos para o usuário ler a mensagem de sucesso e redireciona
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 text-center"
      >
        <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Lock className="text-ibac-orange" size={28} />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter text-gray-800">
          Nova <span className="text-ibac-orange">Senha</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          Crie uma combinação segura
        </p>
      </motion.div>

      <form onSubmit={handleRedefinir} className="w-full max-w-xs space-y-5">
        
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
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Nova Senha :</label>
          <input 
            required 
            type="password" 
            placeholder="••••••••"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-ibac-orange/20 focus:border-ibac-orange transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Confirmar Senha :</label>
          <input 
            required 
            type="password" 
            placeholder="••••••••"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-ibac-orange/20 focus:border-ibac-orange transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="flex justify-center pt-6"> 
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-20 h-20 bg-ibac-dark rounded-[28px] shadow-2xl text-white disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
          </motion.button>
        </div>
      </form>
    </main>
  );
}