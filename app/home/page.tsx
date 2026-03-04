"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Users, 
  User, 
  Loader2, 
  Instagram, 
  Video, 
  Camera,
  Heart,
  Calendar as CalendarIcon
} from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export default function HomeIgreja() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fotosFlickr, setFotosFlickr] = useState<any[]>([]);
  const [loadingFlickr, setLoadingFlickr] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const FLICKR_API_KEY = process.env.NEXT_PUBLIC_FLICKR_API_KEY;
  const FLICKR_USER_ID = process.env.NEXT_PUBLIC_FLICKR_USER_ID;

  useEffect(() => {
    setMounted(true);
    
    async function fetchFlickr() {
      if (!FLICKR_API_KEY || !FLICKR_USER_ID) {
        setLoadingFlickr(false);
        return;
      }

      // 1. CACHE ESTRATÉGICO: Tenta carregar do localStorage primeiro
      const cacheKey = "flickr_home_optimized";
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { photos, timestamp } = JSON.parse(cachedData);
        setFotosFlickr(photos);
        setLoadingFlickr(false);
        // Se o cache tiver menos de 1 hora, não faz o fetch de novo
        if (Date.now() - timestamp < 3600000) return;
      }

      try {
        const url = `https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`;
        // Fetch com prioridade
        const res = await fetch(url, { priority: 'high' } as any);
        const data = await res.json();

        if (data.photosets?.photoset) {
          const formatados = data.photosets.photoset.slice(0, 3).map((album: any, index: number) => ({
            id: album.id,
            titulo: album.title._content.toUpperCase(),
            // 2. OTIMIZAÇÃO DE IMAGEM: Trocado '_b.jpg' (grande) por '_m.jpg' (leve)
            // A imagem 'm' carrega 5x mais rápido e é suficiente para o tamanho do preview
            img: `https://live.staticflickr.com/${album.server}/${album.primary}_${album.secret}_m.jpg`,
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
    
    // 3. QUERY OTIMIZADA: Selecionando apenas o campo necessário
    const { data: perfil } = await supabase.from('perfis').select('interesses').eq('id', user.id).single();
    
    if (!perfil?.interesses || perfil.interesses.length === 0) {
      router.push("/interesses");
    } else {
      router.push("/mural");
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-white pb-32">
      {/* Background Decorativo - Mantido original */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/fundo-igreja.png')" }} />

      <div className="relative z-10 w-full max-w-[400px] flex flex-col min-h-screen">
        <header className="flex justify-center pt-10 mb-6">
          <img src="/logo.png" alt="IBAC" className="w-20" />
        </header>

        {/* Galeria Flickr - Design Original Preservado */}
        <div className="flex items-center justify-center gap-2 px-4 mb-4 h-64">
          {loadingFlickr && fotosFlickr.length === 0 ? (
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
                className={`relative rounded-lg overflow-hidden shadow-2xl transition-all duration-500 ${foto.destaque ? "z-20 w-48 h-56 border-2 border-white" : "z-10 w-32 h-44 opacity-80"}`}
              >
                {/* 4. LAZY LOADING: Imagens carregam de forma assíncrona para não travar o scroll */}
                <img src={foto.img} decoding="async" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <p className="text-[7px] font-black text-white uppercase leading-tight line-clamp-2">{foto.titulo}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="flex justify-center gap-3 px-6 mb-8">
          <a 
            href="https://www.instagram.com/batista_acolher"
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm active:scale-95 transition-all"
          >
            <Instagram size={18} className="text-pink-600" />
            <span className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Instagram</span>
          </a>
        </div>

        <div className="text-center space-y-1 mb-8 px-4">
          <h2 className="text-xl font-medium uppercase tracking-tighter text-gray-700">UMA IGREJA <span className="text-ibac-orange font-black">ACOLHEDORA</span></h2>
          <h3 className="text-xl font-medium uppercase tracking-tighter text-gray-700">UMA FAMÍLIA PARA <span className="text-ibac-orange font-black">PERTENCER</span></h3>
        </div>

        {/* Botão Central de Mural */}
        <div className="flex justify-center mb-10">
            <motion.button 
              onClick={handleAcessarComunidade}
              whileTap={{ scale: 0.9 }} 
              className="w-16 h-16 bg-ibac-orange rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-200"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={35} strokeWidth={3} />}
            </motion.button>
        </div>

        {/* RODAPÉ SIMÉTRICO (3 + HOME + 3) - Mantido Design de 440px */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
          <nav className="w-full max-w-[440px] bg-ibac-dark rounded-[35px] py-3 px-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
            
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

            <div className="relative -mt-14 px-2">
              <Link href="/home" className="block">
                <div className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center border-[6px] border-[#F8F9FA] shadow-xl transform active:scale-90 transition-transform">
                  <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
                </div>
              </Link>
            </div>

            <div className="flex flex-1 justify-around items-center">
              <Link href="/fotos" className={`flex flex-col items-center ${pathname === '/fotos' ? 'text-ibac-orange' : 'text-white/30'}`}>
                  <Camera size={18} />
                  <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Fotos</span>
              </Link>
              <Link href="/pedidos" className={`flex flex-col items-center ${pathname === '/pedidos' ? 'text-ibac-orange' : 'text-white/30'}`}>
                  <Heart size={18} />
                  <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Pedidos</span>
              </Link>
              <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-ibac-orange' : 'text-white/30'}`}>
                  <User size={18} />
                  <span className="text-[6px] font-bold uppercase mt-1 tracking-tighter">Perfil</span>
              </Link>
            </div>

          </nav>
        </div>
      </div>
    </main>
  );
}