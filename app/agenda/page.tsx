"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Filter, 
  Users, 
  Video, 
  Camera, 
  User, 
  Heart,
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const diasDaSemana = ["Todos", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const CORES_DIAS: Record<string, string> = {
  Segunda: "bg-blue-500",
  Terça: "bg-purple-500",
  Quarta: "bg-yellow-500",
  Quinta: "bg-green-500",
  Sexta: "bg-red-500",
  Sábado: "bg-orange-500",
  Domingo: "bg-indigo-500",
};

export default function Agenda() {
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchAgenda() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agenda')
          .select('*')
          .order('horario', { ascending: true });

        if (error) throw error;
        setEventos(data || []);
      } catch (err) {
        console.error("Erro ao carregar agenda:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgenda();
  }, []);

  const eventosFiltrados = filtroAtivo === "Todos" 
    ? eventos 
    : eventos.filter(item => item.dia_semana === filtroAtivo);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-40">
      <header className="bg-white p-6 sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/home" className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
            <ChevronLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Agenda <span className="text-[#F47920]">IBAC</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nossa programação semanal</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {diasDaSemana.map((dia) => (
            <button
              key={dia}
              onClick={() => setFiltroAtivo(dia)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filtroAtivo === dia 
                ? "bg-[#F47920] text-white shadow-lg shadow-orange-200" 
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {dia}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#F47920]" size={32} />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sincronizando agenda...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row group h-full"
                >
                  {/* Banner / Imagem com Upload Real */}
                  <div className="relative w-full sm:w-40 h-40 sm:h-auto overflow-hidden bg-gray-100 shrink-0">
                    {item.imagem_url ? (
                      <img 
                        src={item.imagem_url} 
                        alt={item.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${CORES_DIAS[item.dia_semana] || 'bg-gray-400'}`}>
                        <CalendarIcon size={32} className="text-white opacity-40" />
                      </div>
                    )}
                    
                    {/* Badge do Dia da Semana */}
                    <div className={`absolute top-3 left-3 ${CORES_DIAS[item.dia_semana] || 'bg-gray-800'} text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg z-10`}>
                      {item.dia_semana}
                    </div>
                  </div>

                  {/* Detalhes do Evento */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4 leading-tight group-hover:text-[#F47920] transition-colors">
                      {item.titulo}
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#F47920] shrink-0">
                          <Clock size={14} />
                        </div>
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wide">{item.horario}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#F47920] shrink-0">
                          <MapPin size={14} />
                        </div>
                        {/* Exibe o LOCAL cadastrado ou um padrão */}
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-wide">
                          {item.local || "Templo Central"}
                        </span>
                      </div>
                    </div>

                    {item.descricao && (
                      <p className="mt-4 text-[10px] text-gray-400 font-medium leading-relaxed italic">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-20 text-center"
              >
                <Filter className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Nenhum evento para {filtroAtivo}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
        <nav className="w-full max-w-[440px] bg-[#1A1A1A] rounded-[35px] py-3 px-2 flex justify-between items-center shadow-2xl border border-white/10">
          <div className="flex flex-1 justify-around items-center">
            <Link href="/mural" className={`flex flex-col items-center ${pathname === '/mural' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <Users size={18} /><span className="text-[6px] font-bold uppercase mt-1">Mural</span>
            </Link>
            <Link href="/aulas" className={`flex flex-col items-center ${pathname === '/aulas' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <Video size={18} /><span className="text-[6px] font-bold uppercase mt-1">Aulas</span>
            </Link>
            <Link href="/agenda" className={`flex flex-col items-center ${pathname === '/agenda' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <CalendarIcon size={18} /><span className="text-[6px] font-bold uppercase mt-1">Agenda</span>
            </Link>
          </div>
          <div className="relative -mt-14 px-2">
            <Link href="/home" className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center border-[6px] border-[#F8F9FA] shadow-xl transform active:scale-90 transition-transform">
              <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </Link>
          </div>
          <div className="flex flex-1 justify-around items-center">
            <Link href="/fotos" className={`flex flex-col items-center ${pathname === '/fotos' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <Camera size={18} /><span className="text-[6px] font-bold uppercase mt-1">Fotos</span>
            </Link>
            <Link href="/pedidos" className={`flex flex-col items-center ${pathname === '/pedidos' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <Heart size={18} /><span className="text-[6px] font-bold uppercase mt-1">Pedidos</span>
            </Link>
            <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-[#F47920]' : 'text-white/30'}`}>
              <User size={18} /><span className="text-[6px] font-bold uppercase mt-1">Perfil</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}