"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Camera, Users, User, Video, ExternalLink, 
  Loader2, Grid, Heart, Calendar as CalendarIcon, Plus 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FotosPage() {
  const [albuns, setAlbuns] = useState<any[]>([]);
  const [visiveis, setVisiveis] = useState(10);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const FLICKR_API_KEY = process.env.NEXT_PUBLIC_FLICKR_API_KEY;
  const FLICKR_USER_ID = process.env.NEXT_PUBLIC_FLICKR_USER_ID;

  useEffect(() => {
    setMounted(true);
    async function fetchFlickrData() {
      if (!FLICKR_API_KEY || !FLICKR_USER_ID) return;
      try {
        // Buscamos apenas o essencial da lista (IDs e Títulos são leves)
        const url = `https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;
        const res = await fetch(url, { next: { revalidate: 3600 } } as any); // Cache de 1 hora
        const data = await res.json();

        if (data.photosets?.photoset) {
          const formatados = data.photosets.photoset.map((album: any) => ({
            id: album.id,
            titulo: album.title._content,
            fotosCount: album.photos,
            // Usamos 'q' (quadrado 150px) ou 'm' (240px) para thumbnails ultra rápidas
            capa: `https://live.staticflickr.com/${album.server}/${album.primary}_${album.secret}_m.jpg`, 
            link: `https://www.flickr.com/photos/${FLICKR_USER_ID}/albums/${album.id}`
          }));
          setAlbuns(formatados);
        }
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlickrData();
  }, [FLICKR_API_KEY, FLICKR_USER_ID]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-white pb-40">
      {/* Header Fixo */}
      <div className="w-full max-w-[400px] bg-white/90 backdrop-blur-xl p-6 flex items-center gap-4 border-b sticky top-0 z-40">
        <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">
          Galeria <span className="text-[#F47920] text-2xl">.</span>
        </h1>
      </div>

      <div className="w-full max-w-[400px] p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative">
              <Loader2 className="animate-spin text-[#F47920]" size={40} />
              <div className="absolute inset-0 blur-xl bg-[#F47920]/20 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Destaque Otimizado */}
            {albuns.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Destaque</h2>
                  <span className="w-12 h-[1px] bg-gray-100"></span>
                </div>
                <div className="relative h-64 rounded-[32px] overflow-hidden shadow-xl bg-gray-100">
                   <img 
                    src={albuns[0].capa.replace('_m.jpg', '_z.jpg')} 
                    loading="eager" // O destaque carrega primeiro
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-white text-lg font-bold leading-tight mb-2">{albuns[0].titulo}</h3>
                    <a href={albuns[0].link} target="_blank" className="bg-white text-black w-fit px-5 py-2 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                      Ver Fotos <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Grid com Lazy Loading Nativo */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Coleções</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {albuns.slice(1, visiveis).map((album, index) => (
                  <motion.a
                    key={album.id}
                    href={album.link}
                    target="_blank"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }} // Só anima quando entra na tela
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="relative h-40 rounded-3xl overflow-hidden bg-gray-50 mb-2 border border-gray-100">
                      <img 
                        src={album.capa} 
                        loading="lazy" // SEGREDINHO: Navegador só baixa quando chega perto
                        decoding="async" // Não trava a renderização do texto
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="" 
                      />
                      <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] text-white font-bold">
                        {album.fotosCount}
                      </div>
                    </div>
                    <h4 className="text-[9px] font-black text-gray-700 uppercase line-clamp-2 px-1">{album.titulo}</h4>
                  </motion.a>
                ))}
              </div>

              {visiveis < albuns.length && (
                <button
                  onClick={() => setVisiveis(prev => prev + 12)}
                  className="w-full mt-10 py-4 bg-gray-50 rounded-3xl border border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  Carregar Mais Registros
                </button>
              )}
            </section>
          </div>
        )}
      </div>

      {/* RODAPÉ PADRONIZADO (3 + HOME + 3) */}
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
            <Link href="/doar" className={`flex flex-col items-center ${pathname === '/doar' ? 'text-[#F47920]' : ''}`}>
              <Heart size={18} /><span className="text-[6px] font-bold uppercase mt-1">Doar</span>
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