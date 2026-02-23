"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const categorias = [
  { id: "musica", nome: "Música", icone: "🎸" },
  { id: "midia", nome: "Mídia/Design", icone: "📸" },
  { id: "social", nome: "Social/Ação", icone: "🤝" },
  { id: "educacao", nome: "Educação", icone: "📚" },
  { id: "reformas", nome: "Reformas", icone: "🛠️" },
  { id: "teatro", nome: "Teatro/Arte", icone: "🎭" },
  { id: "infantil", nome: "Infantil", icone: "🧒" },
  { id: "intercessao", nome: "Oração", icone: "🙏" },
  { id: "acolhimento", nome: "Recepção", icone: "🚪" },
  { id: "jogos", nome: "Games", icone: "🎮" },
  { id: "esporte", nome: "Esportes", icone: "⚽" },
  { id: "culinaria", nome: "Culinária", icone: "🍳" },
  { id: "saude", nome: "Saúde", icone: "🩺" },
  { id: "tecnologia", nome: "Tecnologia", icone: "💻" },
  { id: "leitura", nome: "Leitura", icone: "📖" },
  { id: "viagem", nome: "Viagens", icone: "✈️" },
  { id: "cinema", nome: "Cinema", icone: "🍿" },
  { id: "financas", nome: "Finanças", icone: "💰" },
  { id: "pets", nome: "Pets", icone: "🐾" },
  { id: "fotografia", nome: "Foto", icone: "📷" },
  { id: "idiomas", nome: "Idiomas", icone: "🌎" },
];

export default function TelaInteresses() {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelecao = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAvancar = async () => {
    if (selecionados.length === 0) return alert("Selecione ao menos um!");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('perfis').update({ interesses: selecionados }).eq('id', user.id);
      if (selecionados.includes("jogos")) router.push("/jogos");
      else if (selecionados.includes("musica")) router.push("/instrumentos");
      else router.push("/mural");
    }
    setLoading(false);
  };

  return (
    <main className="relative h-screen w-full flex flex-col items-center bg-[#F8F8F8] overflow-hidden">
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/fundo-igreja.png')" }} />
      <div className="fixed inset-0 z-10 bg-white/90 backdrop-blur-md" />

      <div className="relative z-20 w-full max-w-[400px] flex flex-col h-full">
        
        {/* Header - Padding Lateral aplicado aqui */}
        <header className="mt-12 mb-6 px-8 shrink-0">
          <h1 className="text-3xl font-black uppercase text-ibac-dark leading-tight">
            Selecione seus <br />
            <span className="text-ibac-orange">Interesses</span>
          </h1>
          <div className="h-1.5 w-16 bg-ibac-orange mt-2 rounded-full" />
        </header>

        {/* Área de Grid com Scroll */}
        <div className="flex-1 overflow-y-auto px-8 no-scrollbar pb-40">
          <div className="grid grid-cols-3 gap-3 w-full">
            {categorias.map((cat) => {
              const isSelected = selecionados.includes(cat.id);
              return (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelecao(cat.id)}
                  className={`relative aspect-square rounded-[24px] flex flex-col items-center justify-center p-2 cursor-pointer transition-all border-2 ${
                    isSelected 
                      ? "bg-ibac-orange border-white shadow-xl scale-105 z-10" 
                      : "bg-ibac-dark border-transparent opacity-95"
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icone}</span>
                  <span className="text-[9px] font-black text-white uppercase text-center leading-tight">
                    {cat.nome}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                      <Check size={8} className="text-ibac-orange" strokeWidth={5} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Fixo com Gradiente para não sobrepor bruscamente */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-30 flex items-center justify-center pointer-events-none">
          <motion.button 
            disabled={loading}
            onClick={handleAvancar} 
            whileTap={{ scale: 0.9 }} 
            className="w-16 h-16 bg-ibac-orange rounded-full flex items-center justify-center text-white shadow-2xl disabled:opacity-50 pointer-events-auto mb-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={32} strokeWidth={3} />}
          </motion.button>
        </div>

      </div>
    </main>
  );
}