"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronLeft, Calendar as CalendarIcon, Filter, Users, Video, Camera, User, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const diasDaSemana = ["Todos", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const agendaSemanal = [
  { dia: "Segunda", evento: "Ginástica | Segunda", horario: "07:00", local: "3° Andar", imagem: "/Ginastica.png", cor: "bg-blue-500" },
  { dia: "Segunda", evento: "Jiu Jitsu", horario: "19:00", local: "Quadra", imagem: "/jiujitsu.png", cor: "bg-blue-500" },
  { dia: "Segunda", evento: "Capoeira", horario: "19:00", local: "4° Andar", imagem: "/capoeira.png", cor: "bg-blue-500" },
  { dia: "Segunda", evento: "Ballet", horario: "19:00", local: "3° Andar", imagem: "/ballet.png", cor: "bg-blue-500" },
  { dia: "Terça", evento: "Culto de Intercessão", horario: "08:00", local: "Templo", imagem: "/intercessao.png", cor: "bg-purple-500" },
  { dia: "Terça", evento: "Futebol | Terça", horario: "16:00", local: "Quadra", imagem: "/futebol.png", cor: "bg-purple-500" },
  { dia: "Quarta", evento: "Ginástica | Quarta", horario: "08:00", local: "3° Andar", imagem: "/Ginastica.png", cor: "bg-yellow-500" },
  { dia: "Quarta", evento: "Quarta com Deus", horario: "19:30", local: "Templo", imagem: "/quarta.png", cor: "bg-yellow-500" },
  { dia: "Quinta", evento: "Futebol | Quinta", horario: "17:00", local: "Quadra", imagem: "/futebol.png", cor: "bg-green-500" },
  { dia: "Quinta", evento: "Ginástica | Quinta", horario: "19:00", local: "3° Andar", imagem: "/Ginastica.png", cor: "bg-green-500" },
  { dia: "Quinta", evento: "Kingdom", horario: "19:00", local: "4° Andar", imagem: "/kdm.png", cor: "bg-green-500" },
  { dia: "Sexta", evento: "Embaixadores do Rei", horario: "19:00", local: "Sala da Embaixada", imagem: "/embaixadores.png", cor: "bg-red-500" },
  { dia: "Sexta", evento: "Mensageiras do Rei", horario: "19:00", local: "Sala 03", imagem: "/mensageiras.png", cor: "bg-red-500" },
  { dia: "Sexta", evento: "Homens de Valor", horario: "19:00", local: "3° Andar", imagem: "/homens.png", cor: "bg-red-500" },
  { dia: "Sábado", evento: "Louvorzão", horario: "19:00", local: "Templo", imagem: "/louvorzao.png", cor: "bg-orange-500" }
];

export default function Agenda() {
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const pathname = usePathname();

  const eventosFiltrados = filtroAtivo === "Todos" 
    ? agendaSemanal 
    : agendaSemanal.filter(item => item.dia === filtroAtivo);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-40">
      {/* HEADER ESTILIZADO */}
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

        {/* FILTRO DE DIAS (SCROLL HORIZONTAL) */}
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

      {/* LISTA DE EVENTOS */}
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <AnimatePresence mode="popLayout">
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((item, index) => (
              <motion.div
                key={`${item.dia}-${item.evento}-${item.horario}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row group"
              >
                {/* Imagem do Banner */}
                <div className="relative w-full sm:w-40 h-40 sm:h-auto overflow-hidden">
                  <img 
                    src={item.imagem} 
                    alt={item.evento} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className={`absolute top-3 left-3 ${item.cor} text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg`}>
                    {item.dia}
                  </div>
                </div>

                {/* Detalhes do Evento */}
                <div className="p-5 flex-1">
                  <h2 className="text-md font-black uppercase tracking-tight text-gray-800 mb-3 leading-tight">
                    {item.evento}
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="p-1.5 bg-orange-50 rounded-lg text-[#F47920]">
                        <Clock size={12} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide">{item.horario}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="p-1.5 bg-orange-50 rounded-lg text-[#F47920]">
                        <MapPin size={12} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide">{item.local}</span>
                    </div>
                  </div>
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
                Nenhum evento encontrado
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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