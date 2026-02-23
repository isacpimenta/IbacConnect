"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Play, 
  Video, 
  Users, 
  User, 
  Camera,
  FileText,
  Download,
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const CONTEUDOS = [
  {
    id: "1",
    tipo: "PREGAÇÃO",
    titulo: "O Poder da Oração no Getsêmani",
    autor: "Pr. Marcos Oliveira",
    data: "Ontem",
    capa: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=500",
    temVideo: true,
    temSlide: true,
    linkVideo: "#",
    linkSlide: "#"
  },
  {
    id: "2",
    tipo: "EBD",
    titulo: "Epístola aos Romanos: Graça e Fé",
    autor: "Prof. Ricardo Silva",
    data: "Domingo",
    capa: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=500",
    temVideo: false,
    temSlide: true,
    linkSlide: "#",
    resumo: "Estudo profundo sobre a justificação pela fé no capítulo 5."
  },
  {
    id: "3",
    tipo: "PREGAÇÃO",
    titulo: "Vivendo como Família de Deus",
    autor: "Pr. Marcos Oliveira",
    data: "12 Fev",
    capa: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=500",
    temVideo: true,
    temSlide: false,
    linkVideo: "#"
  }
];

export default function AulasPage() {
  const [abaAtiva, setAbaAtiva] = useState("TODOS");

  const conteudosFiltrados = abaAtiva === "TODOS" 
    ? CONTEUDOS 
    : CONTEUDOS.filter(c => c.tipo === abaAtiva);

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-[#F8F9FA] pb-32">
      {/* Header */}
      <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-md p-6 flex items-center gap-4 border-b sticky top-0 z-40">
        <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">
          Estudos & <span className="text-ibac-orange">Recursos</span>
        </h1>
      </div>

      <div className="w-full max-w-[400px] p-4 space-y-6">
        
        {/* Filtros Estilizados */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {["TODOS", "PREGAÇÃO", "EBD"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAbaAtiva(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                abaAtiva === tab 
                ? "bg-white text-ibac-orange shadow-sm scale-[1.02]" 
                : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lista de Conteúdos */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {conteudosFiltrados.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Área da Imagem / Preview */}
                <div className="relative h-48 w-full">
                  <img src={item.capa} className="w-full h-full object-cover" alt="" />
                  
                  {/* Badge de Tipo */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full">
                    <span className="text-[8px] font-black text-ibac-orange uppercase tracking-widest">{item.tipo}</span>
                  </div>

                  {/* Ícone Centralizado Dinâmico */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.temVideo ? (
                      <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                        <Play size={24} className="text-white fill-white ml-1" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-ibac-dark rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                        <BookOpen size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações e Botões */}
                <div className="p-5">
                  <div className="mb-4">
                    <h4 className="text-base font-black text-gray-800 leading-tight mb-1 uppercase tracking-tighter">{item.titulo}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.autor} • {item.data}</p>
                    {item.resumo && <p className="mt-2 text-xs text-gray-500 leading-relaxed italic">{item.resumo}</p>}
                  </div>

                  <div className="flex gap-2">
                    {item.temVideo && (
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-ibac-orange text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        <Video size={14} /> Assistir
                      </button>
                    )}
                    
                    {item.temSlide && (
                      <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all ${item.temVideo ? "bg-gray-100 text-gray-600" : "bg-ibac-dark text-white"}`}>
                        <FileText size={14} /> {item.tipo === "EBD" ? "Ver Slides" : "Esboço"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* RODAPÉ PADRONIZADO */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[380px] bg-ibac-dark rounded-full py-3 px-6 flex justify-between items-center shadow-2xl z-50 border border-white/10">
        <Link href="/mural" className="text-white/40 flex flex-col items-center flex-1">
            <Users size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Mural</span>
        </Link>
        <Link href="/aulas" className="text-ibac-orange flex flex-col items-center flex-1">
            <Video size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Aulas</span>
        </Link>
        <Link href="/home" className="relative px-2">
            <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center -mt-14 border-[6px] border-[#F8F9FA] shadow-lg">
                <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </div>
        </Link>
        <Link href="/fotos" className="text-white/40 flex flex-col items-center flex-1">
            <Camera size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Fotos</span>
        </Link>
        <Link href="/perfil" className="text-white/40 flex flex-col items-center flex-1">
            <User size={20} />
            <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">Perfil</span>
        </Link>
      </nav>
    </main>
  );
}