"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Instagram, MessageCircle, 
  User, Users, Sparkles, ArrowLeft, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importar router
import { supabase } from "@/lib/supabase";

export default function MuralMembros() {
  const router = useRouter(); // Instanciar router
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");

  const categorias = ["Todos", "Música", "Jogos", "Mídia", "Social", "Esporte", "Educação"];

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    setLoading(true);
    
    // Lógica idêntica à do seu Perfil para garantir segurança
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Se não tem usuário, manda para a tela inicial (login)
      router.push("/"); 
      return;
    }

    // Se tem usuário, busca os membros
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

  // Tela de carregamento igual à que você usa no perfil
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-ibac-orange" size={40} />
    </div>
  );

  return (
    <main className="relative min-h-screen w-full bg-[#F2F2F2] pb-32 overflow-x-hidden">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-b from-ibac-orange/10 to-transparent -z-10 blur-3xl opacity-50" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F2F2F2]/80 backdrop-blur-xl px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/home" className="p-2.5 bg-white rounded-2xl text-ibac-dark shadow-sm border border-gray-100 active:scale-95 transition-all">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-xl font-black uppercase text-ibac-dark tracking-tighter">
                Mural <span className="text-ibac-orange italic">!</span>
              </h1>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {membros.length} Membros na Família
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-ibac-dark rounded-2xl flex items-center justify-center shadow-lg">
             <Sparkles className="text-ibac-orange" size={18} />
          </div>
        </div>

        {/* Busca */}
        <div className="relative group">
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-100 p-1 shadow-sm transition-all group-focus-within:border-ibac-orange/40">
            <Search className="ml-4 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Quem você está procurando?" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 bg-transparent outline-none text-sm font-bold text-ibac-dark"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto mt-6 no-scrollbar py-1">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all duration-300 ${
                filtro === cat ? "bg-ibac-dark text-white scale-105" : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Lista de Membros */}
      <section className="px-6 mt-4">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4">
            {membrosFiltrados.map((membro, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={membro.id} 
                className="bg-white rounded-[32px] p-4 shadow-sm border border-gray-100 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-[24px] bg-gray-100 overflow-hidden shrink-0">
                  {membro.foto_url ? (
                    <img src={membro.foto_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={30} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm uppercase text-ibac-dark truncate">{membro.nome_completo}</h3>
                  <p className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase mb-2">
                    <MapPin size={10} className="text-ibac-orange" /> {membro.cidade || "IBAC CENTRAL"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {membro.interesses?.slice(0, 2).map((int: string) => (
                      <span key={int} className="px-2 py-0.5 bg-gray-50 text-[7px] font-black uppercase rounded-md border border-gray-100 text-ibac-orange">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {membro.instagram && (
                    <a href={`https://instagram.com/${membro.instagram.replace('@','')}`} target="_blank" className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                      <Instagram size={16} />
                    </a>
                  )}
                  {membro.whatsapp && (
                    <a href={`https://wa.me/55${membro.whatsapp.replace(/\D/g, '')}`} target="_blank" className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                      <MessageCircle size={16} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </section>

      {/* Menu Inferior Estilizado (Igual ao seu Perfil) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-ibac-dark rounded-full py-3 px-10 flex justify-between items-center shadow-2xl z-50">
        <Link href="/home">
          <div className="opacity-40 flex flex-col items-center">
            <img src="/logo-white.png" alt="Home" className="w-5 h-5 object-contain" />
            <span className="text-[7px] font-black uppercase mt-1 text-white italic">Home</span>
          </div>
        </Link>
        
        <Link href="/mural">
          <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center -mt-14 border-[6px] border-[#F2F2F2] shadow-lg">
            <Users className="text-white" size={24} />
          </div>
        </Link>
        
        <Link href="/perfil">
          <div className="opacity-40 flex flex-col items-center">
            <User size={22} className="text-white" />
            <span className="text-[7px] font-black uppercase mt-1 text-white italic">Perfil</span>
          </div>
        </Link>
      </nav>
    </main>
  );
}