"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const games = [
  // FPS & BATTLE ROYALE
  { id: "Valorant", logo: "/vava.svg", color: "hover:shadow-[#FF4655]/20" },
  { id: "CS2", logo: "/cs-2.png", color: "hover:shadow-[#F7931E]/20" },
  { id: "Fortnite", logo: "/fortnite.png", color: "hover:shadow-[#9C27B0]/20" },
  { id: "Call of Duty", logo: "/cod.png", color: "hover:shadow-[#000]/10" },
  { id: "Apex Legends", logo: "/apex.png", color: "hover:shadow-[#FF0000]/20" },
  { id: "Overwatch 2", logo: "/overwatch.png", color: "hover:shadow-[#F99E1A]/20" },

  // MOBILE & CASUAL
  { id: "Free Fire", logo: "/ff.png", color: "hover:shadow-[#FFA500]/20" },
  { id: "Wild Rift", logo: "/wild-rift.png", color: "hover:shadow-[#05D3F8]/20" },
  { id: "Roblox", logo: "/roblox.png", color: "hover:shadow-[#000]/10" },
  { id: "Stumble Guys", logo: "/stumble.png", color: "hover:shadow-[#00AEEF]/20" },
  { id: "Clash Royale", logo: "/clash.png", color: "hover:shadow-[#54A3FF]/20" },
  { id: "Brawl Stars", logo: "/brawl.png", color: "hover:shadow-[#FFC107]/20" },

  // ESPORTES
  { id: "EA FC", logo: "/eafc.png", color: "hover:shadow-[#00FF00]/20" },
  { id: "Rocket League", logo: "/rocket.png", color: "hover:shadow-[#0088FF]/20" },
  { id: "NBA 2K", logo: "/nba.png", color: "hover:shadow-[#EB1923]/20" },

  // MOBA, RPG & SANDBOX
  { id: "League of Legends", logo: "/lol.png", color: "hover:shadow-[#0066FF]/20" },
  { id: "Minecraft", logo: "/Minecraft.png", color: "hover:shadow-[#388E3C]/20" },
  { id: "Genshin Impact", logo: "/genshin.png", color: "hover:shadow-[#4DBEAB]/20" },
  { id: "Dota 2", logo: "/dota.png", color: "hover:shadow-[#F44336]/20" },
  { id: "Terraria", logo: "/terraria.png", color: "hover:shadow-[#4CAF50]/20" },
];

export default function TelaJogos() {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGame = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const finalizarJogos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase.from('perfis').select('interesses').eq('id', user.id).single();
      const novosInteresses = Array.from(new Set([...(perfil?.interesses || []), ...selecionados]));
      await supabase.from('perfis').update({ interesses: novosInteresses }).eq('id', user.id);

      if (novosInteresses.includes("musica")) {
        router.push("/instrumentos");
      } else {
        router.push("/mural");
      }
    }
    setLoading(false);
  };

  return (
    <main className="relative h-screen w-full flex flex-col items-center bg-white overflow-hidden">
      {/* Backgrounds - Agora Claros */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/fundo-igreja.png')" }} />
      <div className="fixed inset-0 z-10 bg-white/90 backdrop-blur-md" />

      <div className="relative z-20 w-full max-w-[400px] flex flex-col h-full">
        
        <header className="mt-12 mb-6 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/interesses" className="p-2 bg-ibac-dark/5 rounded-full text-ibac-dark">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase text-ibac-dark leading-tight">Área <span className="text-ibac-orange">Gamer</span></h1>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Escolha seus favoritos</p>
            </div>
          </div>
          <div className="bg-ibac-orange/10 px-3 py-1 rounded-full border border-ibac-orange/20">
            <span className="text-[10px] font-black text-ibac-orange">{selecionados.length}</span>
            <span className="text-[7px] text-ibac-orange font-bold uppercase ml-1">Pts.</span>
          </div>
        </header>

        {/* Grid de Jogos com visual Light */}
        <div className="flex-1 overflow-y-auto px-4 pb-44 no-scrollbar">
          <div className="grid grid-cols-3 gap-2">
            {games.map((game) => {
              const active = selecionados.includes(game.id);
              return (
                <motion.div
                  key={game.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleGame(game.id)}
                  className={`relative h-28 rounded-[24px] flex flex-col items-center justify-center p-2 border-2 transition-all duration-300 cursor-pointer ${
                    active 
                      ? `bg-ibac-orange border-white shadow-xl shadow-ibac-orange/20 scale-105 z-10` 
                      : `bg-ibac-dark border-transparent opacity-95`
                  }`}
                >
                  <div className={`w-10 h-10 mb-2 transition-all duration-500 ${active ? "scale-110" : "grayscale opacity-40"}`}>
                    <img src={game.logo} className="w-full h-full object-contain" alt={game.id} />
                  </div>
                  
                  <span className={`text-[8px] font-black uppercase tracking-tight text-center leading-none px-1 text-white`}>
                    {game.id}
                  </span>

                  {active && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 size={10} className="text-ibac-orange" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Fixo Light */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-30 flex items-center justify-center pointer-events-none">
          <motion.button 
            disabled={loading}
            onClick={finalizarJogos} 
            whileTap={{ scale: 0.9 }} 
            className="w-full max-w-[280px] py-5 bg-ibac-orange rounded-3xl text-white font-black uppercase text-[10px] shadow-[0_10px_30px_rgba(242,102,34,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 pointer-events-auto"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>Finalizar Setup <ArrowRight size={18} strokeWidth={3} /></>
            )}
          </motion.button>
        </div>

      </div>
    </main>
  );
}