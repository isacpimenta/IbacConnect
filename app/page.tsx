"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
    } else {
      router.push("/home");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <div className="mb-16">
        <img src="/logo.png" alt="IBAC Logo" className="w-40" />
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <label className="font-black text-xs uppercase">E-mail :</label>
          <input 
            required 
            type="email" 
            onChange={e => setEmail(e.target.value)} 
            className="w-full h-12 bg-gray-100 rounded-sm px-4 outline-none focus:ring-2 focus:ring-[#F47920] transition-all" 
          />
        </div>
        <div className="space-y-1">
          <label className="font-black text-xs uppercase">Senha :</label>
          <input 
            required 
            type="password" 
            onChange={e => setSenha(e.target.value)} 
            className="w-full h-12 bg-gray-100 rounded-sm px-4 outline-none focus:ring-2 focus:ring-[#F47920] transition-all" 
          />
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-tight">
          Não tem login?{" "}
          <Link href="/cadastro" className="text-[#F47920] hover:underline cursor-pointer">
            Cadastre-se
          </Link>
        </p>

        <div className="flex justify-center pt-4"> 
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-16 h-16 bg-[#F47920] rounded-full shadow-lg text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={32} strokeWidth={3} />}
          </motion.button>
        </div>
      </form>
    </main>
  );
}