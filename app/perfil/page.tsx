"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Camera, Mail, Instagram, MessageCircle, 
  MapPin, LogOut, Check, Pencil, Loader2, 
  Users, Video, Sparkles, ChevronLeft, Heart, 
  Calendar as CalendarIcon, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin"; // Importando seu hook de admin

export default function PerfilPage() {
  const router = useRouter();
  const { isAdmin } = useAdmin(); // Verificação de nível de acesso
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchPerfil();
  }, []);

  async function fetchPerfil() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setPerfil(data);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('perfis')
      .update({
        nome_completo: perfil.nome_completo,
        whatsapp: perfil.whatsapp,
        instagram: perfil.instagram
      })
      .eq('id', perfil.id);

    if (!error) setEditMode(false);
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#F47920]" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-[#F8F9FA] pb-32 font-sans">
      {/* Header Fixo */}
      <div className="w-full bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-tighter text-gray-800">Meu Perfil</h1>
        </div>
        <button 
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
            editMode ? "bg-green-500 text-white" : "bg-[#1A1A1A] text-white"
          }`}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : editMode ? "Salvar" : "Editar"}
        </button>
      </div>

      <div className="max-w-[400px] mx-auto p-6 space-y-6">
        
        {/* Card de Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-white shadow-xl overflow-hidden border-4 border-white">
              {perfil?.foto_url ? (
                <img src={perfil.foto_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                  <User size={48} />
                </div>
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#F47920] rounded-2xl flex items-center justify-center text-white border-4 border-white cursor-pointer shadow-lg">
                <Camera size={18} />
                <input type="file" className="hidden" />
              </label>
            )}
          </div>
          <h2 className="mt-4 text-xl font-black text-gray-800 uppercase tracking-tighter text-center">
            {perfil?.nome_completo || "Usuário"}
          </h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {isAdmin ? "Administrador IBAC" : (perfil?.cidade || "Membro IBAC")}
          </span>
        </div>

        {/* Campos de Edição / Informação */}
        <div className="space-y-4">
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-[#F47920]" /> Dados Pessoais
              </h3>
            </div>

            {/* Input Nome */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Nome Completo</label>
              <input 
                disabled={!editMode}
                value={perfil?.nome_completo || ""}
                onChange={(e) => setPerfil({...perfil, nome_completo: e.target.value})}
                className={`w-full h-12 px-4 rounded-2xl text-sm font-bold transition-all ${
                  editMode ? "bg-gray-50 border-orange-100 border focus:ring-2 ring-orange-500/20 outline-none" : "bg-transparent border-transparent"
                }`}
              />
            </div>

            {/* Input WhatsApp */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1 text-green-600">WhatsApp</label>
              <div className="relative">
                <input 
                  disabled={!editMode}
                  value={perfil?.whatsapp || ""}
                  onChange={(e) => setPerfil({...perfil, whatsapp: e.target.value})}
                  className={`w-full h-12 px-4 rounded-2xl text-sm font-bold transition-all pl-10 ${
                    editMode ? "bg-gray-50 border-green-100 border outline-none" : "bg-transparent border-transparent"
                  }`}
                />
                <MessageCircle size={16} className="absolute left-4 top-4 text-green-500" />
              </div>
            </div>

            {/* Input Instagram */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1 text-pink-600">Instagram</label>
              <div className="relative">
                <input 
                  disabled={!editMode}
                  placeholder="@seuusuario"
                  value={perfil?.instagram || ""}
                  onChange={(e) => setPerfil({...perfil, instagram: e.target.value})}
                  className={`w-full h-12 px-4 rounded-2xl text-sm font-bold transition-all pl-10 ${
                    editMode ? "bg-gray-50 border-pink-100 border outline-none" : "bg-transparent border-transparent"
                  }`}
                />
                <Instagram size={16} className="absolute left-4 top-4 text-pink-500" />
              </div>
            </div>
          </section>

          {/* ÁREA DO ADMINISTRADOR - BOTÃO CMS */}
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-1 bg-gradient-to-r from-orange-400 to-[#F47920] rounded-[28px]"
            >
              <Link 
                href="/admin" 
                className="w-full py-5 bg-[#1A1A1A] text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <LayoutDashboard size={18} className="text-[#F47920]" /> 
                Gerenciar Conteúdo (CMS)
              </Link>
            </motion.div>
          )}

          {/* Botão Logout */}
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white rounded-[24px] border border-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-red-50 transition-colors shadow-sm"
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </div>
      </div>

      {/* RODAPÉ SIMÉTRICO */}
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
            <Link href="/pedidos" className={`flex flex-col items-center ${pathname === '/pedidos' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <Heart size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Pedidos</span>
            </Link>
            <Link href="/perfil" className={`flex flex-col items-center ${pathname === '/perfil' ? 'text-[#F47920]' : 'text-white/30'}`}>
                <User size={18} />
                <span className="text-[6px] font-bold uppercase mt-1">Perfil</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}