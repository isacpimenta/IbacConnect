"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Instagram, MessageCircle, 
  User, Users, Sparkles, ChevronLeft, Loader2, Video, Camera, Heart, Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export default function MuralMembros() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const pathname = usePathname();

  const categorias = ["Todos", "Música", "Jogos", "Mídia", "Social", "Esporte", "Educação"];

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/"); 
      return;
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('nome_completo', { ascending: true });

    if (!error && data) {
      setMembros(data);
    }
    setLoading(false);
  }

  const membrosFiltrados = membros.filter(membro => {
    const nome = membro.nome_completo?.toLowerCase() || "";
    const matchesBusca = nome.includes(busca.toLowerCase());
    const interesses = Array.isArray(membro.interesses) 
      ? membro.interesses.join(" ").toLowerCase() 
      : "";
    const matchesFiltro = filtro === "Todos" || interesses.includes(filtro.toLowerCase());
    return matchesBusca && matchesFiltro;
  });

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-ibac-orange" size={40} />
    </div>
  );

  return (
    <main className="relative min-h-screen w-full bg-[#F8F9FA] pb-32 overflow-x-hidden">
      
      {/* Header Fixo Padronizado */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 pt-10 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black uppercase text-gray-800 tracking-tighter">
                Mural <span className="text-ibac-orange italic">!</span>
              </h1>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                {membros.length} Pessoas na Família
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-ibac-dark rounded-2xl flex items-center justify-center shadow-lg">
             <Sparkles className="text-ibac-orange" size={18} />
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="relative flex items-center bg-gray-100 rounded-2xl px-4 py-3 border border-transparent focus-within:border-ibac-orange/20 focus-within:bg-white transition-all">
          <Search className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-3 bg-transparent outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Filtros de Categoria */}
        <div className="flex gap-2 overflow-x-auto mt-6 no-scrollbar py-1">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all ${
                filtro === cat ? "bg-ibac-orange text-white shadow-md shadow-orange-100" : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid de Membros */}
      <section className="px-6 mt-6">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4">
            {membrosFiltrados.map((membro) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={membro.id} 
                className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex items-center gap-4"
              >
                {/* Foto do Membro */}
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  {membro.foto_url ? (
                    <img src={membro.foto_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={24} />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm uppercase text-gray-800 truncate">{membro.nome_completo}</h3>
                  <p className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase mb-2">
                    <MapPin size={10} className="text-ibac-orange" /> {membro.cidade || "IBAC CENTRAL"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {membro.interesses?.slice(0, 2).map((int: string) => (
                      <span key={int} className="px-2 py-0.5 bg-orange-50 text-[7px] font-black uppercase rounded-md text-ibac-orange">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                {/* BOTÕES RESTAURADOS: Instagram e WhatsApp */}
                <div className="flex gap-2 items-center">
                  {membro.instagram && (
                    <a 
                      href={`https://instagram.com/${membro.instagram.replace('@','')}`} 
                      target="_blank" 
                      className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Instagram size={18} />
                    </a>
                  )}

                  {membro.whatsapp && (
                    <a 
                      href={`https://wa.me/55${membro.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </section>

      {/* RODAPÉ SIMÉTRICO (3 + HOME + 3) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
        <nav className="w-full max-w-[440px] bg-ibac-dark rounded-[35px] py-3 px-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
          
          {/* GRUPO ESQUERDA */}
          <div className="flex flex-1 justify-around items-center">
            <Link href="/mural" className={`flex flex-col items-center ${pathname === '/mural' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <Users size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Mural</span>
            </Link>
            <Link href="/aulas" className={`flex flex-col items-center ${pathname === '/aulas' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <Video size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Aulas</span>
            </Link>
            <Link href="/agenda" className={`flex flex-col items-center ${pathname === '/agenda' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <CalendarIcon size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Agenda</span>
            </Link>
          </div>

          {/* HOME CENTRAL ELEVADO */}
          <div className="relative -mt-14 px-2">
            <Link href="/home" className="block">
              <div className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center border-[6px] border-[#F8F9FA] shadow-xl transform active:scale-90 transition-transform">
                <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
              </div>
            </Link>
          </div>

          {/* GRUPO DIREITA */}
          <div className="flex flex-1 justify-around items-center">
            <Link href="/fotos" className={`flex flex-col items-center ${pathname === '/fotos' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <Camera size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Fotos</span>
            </Link>
            <Link href="/doar" className={`flex flex-col items-center ${pathname === '/doar' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <Heart size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Doar</span>
            </Link>
            <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-ibac-orange' : 'text-white/30'}`}>
                <User size={18} />
                <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Perfil</span>
            </Link>
          </div>

        </nav>
      </div>
    </main>
  );
}