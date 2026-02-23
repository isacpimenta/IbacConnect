"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, User, Loader2, Instagram, Camera } from "lucide-react"; // Importei Instagram e Camera
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomeIgreja() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fotosFlickr, setFotosFlickr] = useState<any[]>([]);
  const [loadingFlickr, setLoadingFlickr] = useState(true);
  const [mounted, setMounted] = useState(false);

  const FLICKR_API_KEY = process.env.NEXT_PUBLIC_FLICKR_API_KEY;
  const FLICKR_USER_ID = process.env.NEXT_PUBLIC_FLICKR_USER_ID;

  useEffect(() => {
    setMounted(true);
    async function fetchFlickr() {
      if (!FLICKR_API_KEY || !FLICKR_USER_ID) {
        setLoadingFlickr(false);
        return;
      }
      const cacheKey = "flickr_photos_cache";
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { photos, timestamp } = JSON.parse(cachedData);
        setFotosFlickr(photos);
        setLoadingFlickr(false);
        if (Date.now() - timestamp < 3600000) return;
      }
      try {
        const url = `https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.photosets?.photoset) {
          const formatados = data.photosets.photoset.slice(0, 3).map((album: any, index: number) => ({
            id: album.id,
            titulo: album.title._content.toUpperCase(),
            img: `https://live.staticflickr.com/${album.server}/${album.primary}_${album.secret}_b.jpg`,
            info: `${album.photos} fotos`,
            destaque: index === 1 
          }));
          setFotosFlickr(formatados);
          localStorage.setItem(cacheKey, JSON.stringify({ photos: formatados, timestamp: Date.now() }));
        }
      } catch (err) {
        console.error("Erro Flickr:", err);
      } finally {
        setLoadingFlickr(false);
      }
    }
    fetchFlickr();
  }, [FLICKR_API_KEY, FLICKR_USER_ID]);

  const handleAcessarComunidade = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }
    const { data: perfil } = await supabase.from('perfis').select('interesses').eq('id', user.id).single();
    if (!perfil?.interesses || perfil.interesses.length === 0) {
      router.push("/interesses");
    } else {
      router.push("/mural");
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/fundo-igreja.jpg')" }} />

      <div className="relative z-10 w-full max-w-[400px] flex flex-col min-h-screen">
        <header className="flex justify-center pt-10 mb-6">
          <img src="/logo.png" alt="IBAC" className="w-20" />
        </header>

        {/* Galeria Flickr */}
        <div className="flex items-center justify-center gap-2 px-4 mb-4 h-64">
          {!mounted || (loadingFlickr && fotosFlickr.length === 0) ? (
            <div className="flex items-center justify-center gap-2 w-full">
               <div className="w-24 h-32 bg-gray-200/50 rounded-lg animate-pulse" />
               <div className="w-32 h-44 bg-gray-300/50 rounded-lg animate-pulse border-2 border-white/50" />
               <div className="w-24 h-32 bg-gray-200/50 rounded-lg animate-pulse" />
            </div>
          ) : (
            fotosFlickr.map((foto) => (
              <motion.div 
                key={foto.id} 
                layoutId={foto.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative rounded-lg overflow-hidden shadow-2xl transition-all duration-500 ${foto.destaque ? "z-20 w-48 h-56 border-2 border-white" : "z-10 w-32 h-44 opacity-80"}`}
              >
                <img src={foto.img} className="w-full h-full object-cover" alt="" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <p className="text-[7px] font-black text-white uppercase leading-tight line-clamp-2">{foto.titulo}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* NOVOS BOTÕES: Ações Rápidas */}
        <div className="flex justify-center gap-3 px-6 mb-8">
          <a 
            href="https://www.instagram.com/batista_acolher" // Altere para o seu @
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm active:scale-95 transition-all"
          >
            <Instagram size={16} className="text-pink-600" />
            <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">Instagram</span>
          </a>
          <a 
            href={`https://www.flickr.com/photos/${FLICKR_USER_ID}`}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm active:scale-95 transition-all"
          >
            <Camera size={16} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">Ver Fotos</span>
          </a>
        </div>

        <div className="text-center space-y-1 mb-8 px-4">
          <h2 className="text-xl font-medium uppercase tracking-tighter text-gray-700">UMA IGREJA <span className="text-ibac-orange font-black">ACOLHEDORA</span></h2>
          <h3 className="text-xl font-medium uppercase tracking-tighter text-gray-700">UMA FAMÍLIA PARA <span className="text-ibac-orange font-black">PERTENCER</span></h3>
        </div>

        <div className="flex justify-center mb-20">
            <motion.button 
              onClick={handleAcessarComunidade}
              whileTap={{ scale: 0.9 }} 
              className="w-16 h-16 bg-ibac-orange rounded-full flex items-center justify-center text-white shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={35} strokeWidth={3} />}
            </motion.button>
        </div>

        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-ibac-dark rounded-full py-3 px-10 flex justify-between items-center shadow-2xl z-50">
          <button onClick={handleAcessarComunidade} className="text-white/40 flex flex-col cursor-pointer items-center outline-none">
            <Users size={22} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Mural</span>
          </button>

          <Link href="/home" className="relative">
            <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center -mt-14 border-[6px] border-white shadow-lg">
                <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </div>
          </Link>

          <Link href="/perfil" className="text-white/40 flex flex-col items-center">
            <User size={22} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Perfil</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}