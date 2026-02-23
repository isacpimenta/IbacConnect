"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Music2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const listaInstrumentos = [
  { id: "Violão", icone: "🎸" },
  { id: "Guitarra", icone: "🎸" },
  { id: "Baixo", icone: "🎸" },
  { id: "Bateria", icone: "🥁" },
  { id: "Teclado", icone: "🎹" },
  { id: "Piano", icone: "🎼" },
  { id: "Vocal", icone: "🎤" },
  { id: "Percussão", icone: "🎵" }, // Trocado para nota musical para evitar bug visual
  { id: "Sopro", icone: "🎷" },
  { id: "Mesa de Som", icone: "🎚️" },
  { id: "Violino", icone: "🎻" },
  { id: "Saxofone", icone: "🎷" },
];

export default function TelaInstrumentos() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInstrumento = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const finalizarTudo = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase.from('perfis').select('interesses').eq('id', user.id).single();
      const novosInteresses = Array.from(new Set([...(perfil?.interesses || []), ...selected]));
      
      await supabase.from('perfis').update({ interesses: novosInteresses }).eq('id', user.id);
      router.push("/mural");
    }
    setLoading(false);
  };

  return (
    <main className="relative h-screen w-full flex flex-col items-center bg-white overflow-hidden">
      {/* Backgrounds - Sem tons cinzas */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/fundo-igreja.png')" }} />
      <div className="fixed inset-0 z-10 bg-white/90 backdrop-blur-md" />

      <div className="relative z-20 w-full max-w-[400px] flex flex-col h-full">
        
        <header className="mt-12 mb-6 px-8 shrink-0">
          <div className="flex items-center gap-4 mb-4">
             <Link href="/interesses" className="p-2 bg-ibac-dark/5 rounded-full text-ibac-dark">
              <ArrowLeft size={20} />
            </Link>
            <Music2 className="text-ibac-orange" size={28} />
          </div>
          <h1 className="text-3xl font-black uppercase leading-tight text-ibac-dark">
            Qual sua <br />
            <span className="text-ibac-orange">Habilidade?</span>
          </h1>
          <div className="h-1.5 w-16 bg-ibac-orange mt-2 rounded-full" />
        </header>

        {/* Grid de Instrumentos */}
        <div className="flex-1 overflow-y-auto px-8 pb-40 no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {listaInstrumentos.map((inst) => {
              const isSelected = selected.includes(inst.id);
              return (
                <motion.div
                  key={inst.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInstrumento(inst.id)}
                  className={`relative p-6 rounded-[32px] flex flex-col items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "bg-ibac-orange border-white shadow-xl shadow-ibac-orange/20 scale-105" 
                      : "bg-ibac-dark border-transparent opacity-95"
                  }`}
                >
                  <span className={`text-4xl mb-2 transition-transform duration-500 ${isSelected ? "scale-110 rotate-6" : "grayscale opacity-40"}`}>
                    {inst.icone}
                  </span>
                  <span className="text-[10px] font-black uppercase text-center text-white">
                    {inst.id}
                  </span>

                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md"
                    >
                      <Check size={10} className="text-ibac-orange" strokeWidth={5} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-30 flex items-center justify-center pointer-events-none">
          <motion.button 
            disabled={loading}
            onClick={finalizarTudo} 
            whileTap={{ scale: 0.9 }} 
            className="w-16 h-16 bg-ibac-orange rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(242,102,34,0.3)] disabled:opacity-50 pointer-events-auto mb-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={35} strokeWidth={3} />}
          </motion.button>
        </div>

      </div>
    </main>
  );
}