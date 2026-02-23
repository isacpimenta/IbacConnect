"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Camera, 
  Users, 
  User, 
  Video, 
  ExternalLink,
  Loader2,
  Grid
} from "lucide-react";
import Link from "next/link";

export default function FotosPage() {
  const [albuns, setAlbuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const FLICKR_API_KEY = process.env.NEXT_PUBLIC_FLICKR_API_KEY;
  const FLICKR_USER_ID = process.env.NEXT_PUBLIC_FLICKR_USER_ID;

  useEffect(() => {
    setMounted(true);
    async function fetchFlickrData() {
      if (!FLICKR_API_KEY || !FLICKR_USER_ID) return;

      try {
        // Busca a lista de álbuns (Photosets)
        const url = `https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.photosets?.photoset) {
          const formatados = data.photosets.photoset.map((album: any) => ({
            id: album.id,
            titulo: album.title._content,
            descricao: album.description._content || "Registros IBAC",
            fotosCount: album.photos,
            capa: `https://live.staticflickr.com/${album.server}/${album.primary}_${album.secret}_b.jpg`,
            link: `https://www.flickr.com/photos/${FLICKR_USER_ID}/albums/${album.id}`
          }));
          setAlbuns(formatados);
        }
      } catch (err) {
        console.error("Erro ao carregar Flickr:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlickrData();
  }, [FLICKR_API_KEY, FLICKR_USER_ID]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-white pb-32">
      {/* Header Fixo */}
      <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-md p-6 flex items-center gap-4 border-b sticky top-0 z-40">
        <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">
          Galeria <span className="text-ibac-orange text-2xl">.</span>
        </h1>
      </div>

      <div className="w-full max-w-[400px] p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-ibac-orange" size={32} />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Carregando Memórias...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Álbum em Destaque (O mais recente) */}
            {albuns.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Destaque Recente</h2>
                  <span className="w-12 h-[1px] bg-gray-200"></span>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img src={albuns[0].capa} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <span className="text-ibac-orange font-black text-[9px] uppercase tracking-widest mb-1">Último Evento</span>
                    <h3 className="text-white text-xl font-bold leading-tight mb-2">{albuns[0].titulo}</h3>
                    <a 
                      href={albuns[0].link} 
                      target="_blank"
                      className="flex items-center gap-2 bg-white text-black w-fit px-4 py-2 rounded-full text-[10px] font-black uppercase"
                    >
                      Abrir Álbum <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              </section>
            )}

            {/* Grid de Outros Álbuns */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Coleções</h2>
                <Grid size={14} className="text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {albuns.slice(1).map((album, index) => (
                  <motion.a
                    key={album.id}
                    href={album.link}
                    target="_blank"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg mb-2">
                      <img src={album.capa} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
                        <span className="text-white text-[8px] font-bold">{album.fotosCount} fotos</span>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase leading-tight line-clamp-2">{album.titulo}</h4>
                  </motion.a>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* RODAPÉ DE NAVEGAÇÃO COM 4 BOTÕES (ESTILIZADO) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[380px] bg-ibac-dark rounded-full py-3 px-6 flex justify-between items-center shadow-2xl z-50 border border-white/10">
        
        {/* Mural */}
        <Link href="/mural" className="text-white/40 flex flex-col items-center flex-1">
            <Users size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Mural</span>
        </Link>

        {/* Aulas */}
        <Link href="/aulas" className="text-white/40 flex flex-col items-center flex-1">
            <Video size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Aulas</span>
        </Link>

        {/* Logo Centralizada */}
        <Link href="/home" className="relative px-2">
            <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center -mt-14 border-[6px] border-white shadow-lg">
                <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </div>
        </Link>

        {/* Fotos (Ativo) */}
        <Link href="/fotos" className="text-ibac-orange flex flex-col items-center flex-1">
            <Camera size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Fotos</span>
        </Link>

        {/* Perfil */}
        <Link href="/perfil" className="text-white/40 flex flex-col items-center flex-1">
            <User size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Perfil</span>
        </Link>
      </nav>
    </main>
  );
}