"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Play, 
  Video, 
  Users, 
  User, 
  Camera,
  FileText,
  Heart,
  Loader2,
  Calendar as CalendarIcon,
  Youtube
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AulasPage() {
  const [abaAtiva, setAbaAtiva] = useState("TODOS");
  const [conteudos, setConteudos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchAulas() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('aulas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConteudos(data || []);
      } catch (err) {
        console.error("Erro ao carregar aulas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAulas();
  }, []);

  const conteudosFiltrados = abaAtiva === "TODOS" 
    ? conteudos 
    : conteudos.filter(c => c.categoria.toUpperCase() === abaAtiva);

  // Função para pegar a thumb do YouTube
  const getYoutubeThumb = (url: string) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-[#F8F9FA] pb-32">
      {/* Header */}
      <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-md p-6 flex items-center gap-4 border-b sticky top-0 z-40">
        <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">
          Estudos & <span className="text-[#F47920]">Recursos</span>
        </h1>
      </div>

      <div className="w-full max-w-[400px] p-4 space-y-6">
        
        {/* Filtros */}
        <div className="flex bg-gray-200/50 p-1 rounded-2xl">
          {["TODOS", "PREGAÇÃO", "EBD"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAbaAtiva(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                abaAtiva === tab 
                ? "bg-white text-[#F47920] shadow-sm scale-[1.02]" 
                : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lista de Conteúdos */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#F47920]" size={32} />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carregando...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {conteudosFiltrados.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
                >
                  {/* Área da Imagem / Preview */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <img 
                      src={item.banner_url || getYoutubeThumb(item.video_url) || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=500"} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    
                    {/* Badge de Categoria */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full">
                      <span className="text-[8px] font-black text-[#F47920] uppercase tracking-widest">{item.categoria}</span>
                    </div>

                    {/* Ícone Play (Só aparece se tiver vídeo) */}
                    {item.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a 
                          href={item.video_url} 
                          target="_blank" 
                          className="w-14 h-14 bg-[#F47920] rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 active:scale-90 transition-transform"
                        >
                          <Play size={24} className="text-white fill-white ml-1" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Informações e Botões */}
                  <div className="p-5">
                    <div className="mb-4">
                      <h4 className="text-base font-black text-gray-800 leading-tight mb-1 uppercase tracking-tighter">
                        {item.titulo}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                         {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Botão Assistir - Só aparece se tiver vídeo */}
                      {item.video_url ? (
                        <a 
                          href={item.video_url}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F47920] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >
                          <Youtube size={14} /> Assistir
                        </a>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200">
                           Apenas Material
                        </div>
                      )}
                      
                      {/* Botão PDF - Abre o link do bucket se existir */}
                      {item.pdf_url ? (
                        <a 
                          href={item.pdf_url}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >
                          <FileText size={14} /> {item.categoria === "EBD" ? "Slides" : "Esboço"}
                        </a>
                      ) : (
                        <button disabled className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-300 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed">
                          <FileText size={14} /> Sem PDF
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && conteudosFiltrados.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nenhum estudo disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
        <nav className="w-full max-w-[440px] bg-[#1A1A1A] rounded-[35px] py-3 px-2 flex justify-between items-center shadow-2xl border border-white/10">
          <div className="flex flex-1 justify-around items-center text-white/30">
            <Link href="/mural" className={`flex flex-col items-center ${pathname === '/mural' ? 'text-[#F47920]' : ''}`}>
              <Users size={18} /><span className="text-[6px] font-bold uppercase mt-1">Mural</span>
            </Link>
            <Link href="/aulas" className={`flex flex-col items-center ${pathname === '/aulas' ? 'text-[#F47920]' : ''}`}>
              <Video size={18} /><span className="text-[6px] font-bold uppercase mt-1">Aulas</span>
            </Link>
            <Link href="/agenda" className={`flex flex-col items-center ${pathname === '/agenda' ? 'text-[#F47920]' : ''}`}>
              <CalendarIcon size={18} /><span className="text-[6px] font-bold uppercase mt-1">Agenda</span>
            </Link>
          </div>
          <div className="relative -mt-14 px-2">
            <Link href="/home" className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center border-[6px] border-[#F8F9FA] shadow-xl">
              <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </Link>
          </div>
          <div className="flex flex-1 justify-around items-center text-white/30">
            <Link href="/fotos" className={`flex flex-col items-center ${pathname === '/fotos' ? 'text-[#F47920]' : ''}`}>
              <Camera size={18} /><span className="text-[6px] font-bold uppercase mt-1">Fotos</span>
            </Link>
            <Link href="/pedidos" className={`flex flex-col items-center ${pathname === '/pedidos' ? 'text-[#F47920]' : ''}`}>
              <Heart size={18} /><span className="text-[6px] font-bold uppercase mt-1">Pedidos</span>
            </Link>
            <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-[#F47920]' : ''}`}>
              <User size={18} /><span className="text-[6px] font-bold uppercase mt-1">Perfil</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}