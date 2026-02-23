"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Cadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados para capturar os inputs
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { 
          full_name: nome,
          whatsapp: whatsapp 
        }
      }
    });

    if (error) {
      alert("Erro no cadastro: " + error.message);
    } else {
      alert("Sucesso! Verifique seu e-mail para confirmar a conta.");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-white p-8 max-w-[400px] mx-auto">
      <header className="w-full mb-8">
        <Link href="/" className="text-[10px] font-black uppercase text-gray-400">← Voltar</Link>
      </header>

      <div className="relative mb-10">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-50">
          <Camera size={32} className="text-gray-400" />
        </div>
        <div className="absolute bottom-0 right-0 bg-[#F47920] p-2 rounded-full text-white shadow-md">
           <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      </div>

      <form onSubmit={handleSignUp} className="w-full space-y-4">
        <div>
          <label className="font-black text-[11px] uppercase mb-1 block">Nome Completo :</label>
          <input required type="text" onChange={e => setNome(e.target.value)} className="w-full h-10 bg-gray-100 px-3 text-sm outline-none border-b-2 border-transparent focus:border-[#F47920]" />
        </div>
        <div>
          <label className="font-black text-[11px] uppercase mb-1 block">E-mail :</label>
          <input required type="email" onChange={e => setEmail(e.target.value)} className="w-full h-10 bg-gray-100 px-3 text-sm outline-none border-b-2 border-transparent focus:border-[#F47920]" />
        </div>
        <div>
          <label className="font-black text-[11px] uppercase mb-1 block">WhatsApp :</label>
          <input required type="tel" placeholder="(00) 00000-0000" onChange={e => setWhatsapp(e.target.value)} className="w-full h-10 bg-gray-100 px-3 text-sm outline-none border-b-2 border-transparent focus:border-[#F47920]" />
        </div>
        <div>
          <label className="font-black text-[11px] uppercase mb-1 block">Senha :</label>
          <input required type="password" onChange={e => setSenha(e.target.value)} className="w-full h-10 bg-gray-100 px-3 text-sm outline-none border-b-2 border-transparent focus:border-[#F47920]" />
        </div>

        <div className="flex justify-center pt-8">
          <motion.button 
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-[#F47920] rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={30} strokeWidth={3} />}
          </motion.button>
        </div>
      </form>
    </main>
  );
}