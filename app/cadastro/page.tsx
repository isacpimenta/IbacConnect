"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Camera, Loader2, ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Cadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Estados para os inputs
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { 
          full_name: nome,
          whatsapp: whatsapp 
        }
      }
    });

    if (error) {
      setMessage({ type: 'error', text: "Erro no cadastro: " + error.message });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: "Sucesso! Verifique seu e-mail para confirmar a conta." });
      // Não redirecionamos imediatamente para o usuário ler a mensagem do e-mail
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-white p-8 pb-12 max-w-[400px] mx-auto overflow-x-hidden">
      
      {/* Header com Voltar */}
      <header className="w-full mb-10 flex items-center">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="ml-4 text-lg font-black uppercase tracking-tighter text-gray-800">
          Novo <span className="text-ibac-orange">Membro</span>
        </h1>
      </header>

      {/* Preview de Foto (Estilizado) */}
      <div className="relative mb-12">
        <div className="w-28 h-28 bg-[#F8F9FA] rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl">
          <Camera size={32} className="text-gray-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-ibac-orange p-3 rounded-2xl text-white shadow-lg border-4 border-white">
           <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      <form onSubmit={handleSignUp} className="w-full space-y-5">
        
        {/* Alertas de Feedback */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight leading-tight shadow-sm ${
                message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600 border border-green-100'
              }`}
            >
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs com novo estilo padronizado */}
        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Nome Completo :</label>
          <input 
            required 
            type="text" 
            placeholder="Como quer ser chamado?"
            onChange={e => setNome(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/10 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Seu melhor E-mail :</label>
          <input 
            required 
            type="email" 
            placeholder="exemplo@gmail.com"
            onChange={e => setEmail(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/10 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">WhatsApp :</label>
          <input 
            required 
            type="tel" 
            placeholder="21 99999-9999"
            onChange={e => setWhatsapp(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/10 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="space-y-1">
          <label className="font-black text-[10px] uppercase text-gray-400 ml-1">Criar Senha :</label>
          <input 
            required 
            type="password" 
            placeholder="No mínimo 6 caracteres"
            onChange={e => setSenha(e.target.value)} 
            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-[#F47920]/10 focus:border-[#F47920] transition-all text-sm font-bold text-gray-700" 
          />
        </div>

        <div className="flex justify-center pt-8">
          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-[#F47920] rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-orange-200 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={35} strokeWidth={3} />}
          </motion.button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-6">
          Já faz parte da família?{" "}
          <Link href="/" className="text-ibac-orange font-black hover:underline">
            Faça Login
          </Link>
        </p>
      </form>
    </main>
  );
}