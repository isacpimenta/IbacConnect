"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Camera, Loader2, ChevronLeft, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Cadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const isSubmitting = useRef(false);

  // Estados
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Campo anti-bot

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    // 1. Verificação de Honeypot (Se preenchido, é um bot)
    if (honeypot) return;

    // 2. Validações Básicas de Segurança
    if (senha.length < 6) {
      setMessage({ type: 'error', text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setLoading(true);
    isSubmitting.current = true;
    setMessage(null);

    try {
      // 3. Sanitização de Dados
      const cleanEmail = email.trim().toLowerCase();
      const cleanNome = nome.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
          data: { 
            full_name: cleanNome,
            whatsapp: whatsapp.replace(/\D/g, '') // Salva apenas números
          }
        }
      });

      if (error) {
        // Mensagem amigável para erro de rate limit ou e-mail já existente
        let errorMsg = "Não foi possível realizar o cadastro agora.";
        if (error.message.includes("already registered")) errorMsg = "Este e-mail já está em uso.";
        if (error.status === 429) errorMsg = "Muitas tentativas. Tente novamente em 1 hora.";
        
        setMessage({ type: 'error', text: errorMsg });
      } else {
        setMessage({ 
          type: 'success', 
          text: "Conta criada! Verifique sua caixa de entrada e SPAM para confirmar." 
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Erro crítico de segurança. Tente mais tarde." });
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-white p-8 pb-12 max-w-[400px] mx-auto overflow-x-hidden">
      
      <header className="w-full mb-10 flex items-center">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="ml-4 text-lg font-black uppercase tracking-tighter text-gray-800">
          Novo <span className="text-[#F47920]">Membro</span>
        </h1>
      </header>

      <div className="relative mb-12">
        <div className="w-28 h-28 bg-[#F8F9FA] rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl">
          <Camera size={32} className="text-gray-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#F47920] p-3 rounded-2xl text-white shadow-lg border-4 border-white">
           <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      </div>

      <form onSubmit={handleSignUp} className="w-full space-y-5" autoComplete="off">
        
        {/* Campo Honeypot - Invisível para humanos */}
        <input 
          type="text" 
          name="username_hp" 
          style={{ display: 'none' }} 
          tabIndex={-1} 
          value={honeypot} 
          onChange={e => setHoneypot(e.target.value)} 
        />

        <AnimatePresence mode="wait">
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight leading-tight shadow-sm ${
                message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600 border border-green-100'
              }`}
            >
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Nome Completo :</label>
          <input required type="text" placeholder="Ex: João Silva" onChange={e => setNome(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">E-mail :</label>
          <input required type="email" placeholder="email@exemplo.com" onChange={e => setEmail(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">WhatsApp :</label>
          <input required type="tel" placeholder="(21) 99999-9999" onChange={e => setWhatsapp(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Criar Senha :</label>
          <input required type="password" placeholder="Mínimo 6 caracteres" onChange={e => setSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="flex justify-center pt-8">
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-[#F47920] rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-orange-200 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={35} strokeWidth={3} />}
          </motion.button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-6 leading-relaxed">
          Ao clicar em continuar, você concorda com nossos <br/>
          <span className="text-gray-900">Termos de Uso e Privacidade</span>
        </p>
      </form>

      <footer className="mt-12 flex flex-col items-center gap-2 opacity-20">
        <ShieldCheck size={16} />
        <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-400">Security Verification</p>
      </footer>
    </main>
  );
}