"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, User as UserIcon, Loader2, 
  CheckCircle2, EyeOff, Eye, Heart, ChevronLeft,
  Sparkles, Users, Video, Camera, Trash2,
  Calendar as CalendarIcon, Check
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PaginaOracao() {
  const router = useRouter();
  const pathname = usePathname();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [novoPedido, setNovoPedido] = useState("");
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [meusVotos, setMeusVotos] = useState<string[]>([]);

  useEffect(() => {
    checkUser();
    fetchPedidos();
    
    const salvos = localStorage.getItem('ibac_oracoes_votos');
    if (salvos) setMeusVotos(JSON.parse(salvos));

    const channel = supabase.channel('oracao_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_oracao' }, () => fetchPedidos())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push("/");
    setUser(user);
  }

  async function fetchPedidos() {
    const { data } = await supabase.from('pedidos_oracao').select('*').order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  }

  async function postarPedido(e: React.FormEvent) {
    e.preventDefault();
    if (!novoPedido || !user) return;
    setEnviando(true);
    
    const { data: perfil } = await supabase.from('perfis').select('nome_completo').eq('id', user.id).single();
    const nomeExibicao = perfil?.nome_completo || user.email?.split('@')[0] || "Membro";

    const { error } = await supabase.from('pedidos_oracao').insert([
      { 
        nome_membro: nomeExibicao, 
        pedido: novoPedido,
        is_anonimo: isAnonimo,
        usuario_id: user.id
      }
    ]);

    if (!error) {
        setNovoPedido("");
        setIsAnonimo(false);
    }
    setEnviando(false);
  }

  async function excluirPedido(id: string) {
    if (!confirm("Deseja remover seu pedido de oração?")) return;
    
    const { error } = await supabase
      .from('pedidos_oracao')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id); // Segurança extra: só deleta se for o dono

    if (error) alert("Erro ao excluir");
    else fetchPedidos();
  }

  async function clicarEmOrar(id: string, atual: number) {
    if (meusVotos.includes(id)) return; 

    const novosVotos = [...meusVotos, id];
    setMeusVotos(novosVotos);
    localStorage.setItem('ibac_oracoes_votos', JSON.stringify(novosVotos));

    await supabase.from('pedidos_oracao').update({ orando_contagem: atual + 1 }).eq('id', id);
  }

  if (loading && !pedidos.length) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#F47920]" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-[#F8F9FA] pb-40 font-sans">
      
      {/* Header Fixo */}
      <div className="w-full bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">Mural de Oração</h1>
        </div>
        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F47920]">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="max-w-[440px] mx-auto p-6 space-y-6">
        
        {/* Card de Envio */}
        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Fazer um pedido</h3>
             <button 
              type="button"
              onClick={() => setIsAnonimo(!isAnonimo)}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all border ${
                isAnonimo ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
             >
               {isAnonimo ? <EyeOff size={14}/> : <Eye size={14}/>}
               <span className="text-[9px] font-black uppercase">{isAnonimo ? "Anônimo" : "Público"}</span>
             </button>
          </div>

          <textarea 
            placeholder="No que podemos orar por você?" 
            className="w-full p-5 bg-gray-50 rounded-[24px] text-sm font-bold outline-none border-2 border-transparent focus:border-orange-100 resize-none placeholder:text-gray-300"
            rows={3}
            value={novoPedido}
            onChange={(e) => setNovoPedido(e.target.value)}
          />
          
          <button 
            disabled={enviando || !novoPedido}
            onClick={postarPedido}
            className="w-full py-4 bg-[#F47920] text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-orange-500/20"
          >
            {enviando ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16}/> Publicar no Mural</>}
          </button>
        </section>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          <AnimatePresence>
            {pedidos.map((p) => {
              const jaVotou = meusVotos.includes(p.id);
              const souDono = user?.id === p.usuario_id;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p.id} 
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative"
                >
                  {/* Botão de Deletar (Só aparece para o dono) */}
                  {souDono && (
                    <button 
                      onClick={() => excluirPedido(p.id)}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${p.is_anonimo ? 'bg-gray-100' : 'bg-orange-50'}`}>
                      {p.is_anonimo ? <EyeOff size={18} className="text-gray-400" /> : <UserIcon size={18} className="text-[#F47920]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-tight text-gray-900">
                        {p.is_anonimo ? "Membro Anônimo" : p.nome_membro}
                      </span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed font-bold mb-6 pr-6">
                    "{p.pedido}"
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="h-6">
                        {p.orando_contagem > 0 && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#F47920] uppercase">
                                <Heart size={12} fill="currentColor" />
                                {p.orando_contagem} orando
                            </div>
                        )}
                    </div>
                    
                    <button 
                      disabled={jaVotou}
                      onClick={() => clicarEmOrar(p.id, p.orando_contagem)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 ${
                        jaVotou 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-[#1A1A1A] text-white'
                      }`}
                    >
                      {jaVotou ? <><Check size={14}/> Eu orei</> : "Vou Orar"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Rodapé Simétrico */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
        <nav className="w-full max-w-[440px] bg-[#1A1A1A] rounded-[35px] py-3 px-2 flex justify-between items-center shadow-2xl border border-white/10">
          <div className="flex flex-1 justify-around items-center">
            <Link href="/mural" className={`flex flex-col items-center ${pathname === '/mural' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <Users size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Mural</span>
            </Link>
            <Link href="/aulas" className={`flex flex-col items-center ${pathname === '/aulas' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <Video size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Aulas</span>
            </Link>
            <Link href="/agenda" className={`flex flex-col items-center ${pathname === '/agenda' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <CalendarIcon size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Agenda</span>
            </Link>
          </div>

          <div className="relative -mt-14 px-2">
            <Link href="/home" className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center border-[6px] border-[#F8F9FA] shadow-xl active:scale-90 transition-transform">
                <img src="/logo-white.png" alt="Home" className="w-8 h-8 object-contain" />
            </Link>
          </div>

          <div className="flex flex-1 justify-around items-center">
            <Link href="/fotos" className={`flex flex-col items-center ${pathname === '/fotos' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <Camera size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Fotos</span>
            </Link>
            <Link href="/doar" className={`flex flex-col items-center ${pathname === '/doar' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <Heart size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Doar</span>
            </Link>
            <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <UserIcon size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Perfil</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}