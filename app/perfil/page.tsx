"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Instagram, MapPin, Users, User, 
  Edit3, X, Save, Disc, Camera, Loader2, LogOut 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PerfilUsuario() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editNome, setEditNome] = useState("");
  const [editInsta, setEditInsta] = useState("");
  const [editDiscord, setEditDiscord] = useState("");

  useEffect(() => {
    fetchPerfil();
  }, []);

  async function fetchPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('perfis').select('*').eq('id', user.id).single();
      if (data) {
        setPerfil(data);
        setEditNome(data.nome_completo || "");
        setEditInsta(data.instagram || "");
        setEditDiscord(data.discord || "");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  const handleAcessarComunidade = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const { data: p } = await supabase.from('perfis').select('interesses').eq('id', user.id).single();

    if (!p?.interesses || p.interesses.length === 0) {
      router.push("/interesses");
    } else {
      router.push("/mural");
    }
    setLoading(false);
  };

  async function handleLogout() {
    const confirmar = confirm("Deseja realmente sair da sua conta?");
    if (confirmar) {
      await supabase.auth.signOut();
      router.push("/");
    }
  }

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('fotos_perfil')
      .upload(filePath, file);

    if (uploadError) {
      alert("Erro no upload: " + uploadError.message);
      setIsSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('fotos_perfil').getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('perfis')
      .update({ foto_url: publicUrl })
      .eq('id', user.id);

    if (!updateError) await fetchPerfil();
    setIsSaving(false);
  }

  const formatarLinkWhatsApp = (numero: string) => {
    if (!numero) return "#";
    const apenasNumeros = numero.replace(/\D/g, "");
    return `https://wa.me/${apenasNumeros.startsWith("55") ? apenasNumeros : `55${apenasNumeros}`}`;
  };

  async function handleSave() {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('perfis').update({
        nome_completo: editNome,
        instagram: editInsta,
        discord: editDiscord,
      }).eq('id', user.id);

      if (!error) {
        setIsEditing(false);
        await fetchPerfil();
      }
    }
    setIsSaving(false);
  }

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <Loader2 className="animate-spin text-ibac-orange" size={40} />
    </div>
  );

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-[#F8F8F8] pb-32">
      {/* Banner Superior */}
      <div className="relative w-full h-48 bg-cover bg-center" style={{ backgroundImage: "url('/fundo-igreja.jpg')" }}>
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Botões de topo */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-20">
            <button onClick={handleLogout} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-95 transition-all">
                <LogOut size={20} />
            </button>
            <button onClick={() => setIsEditing(true)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                <Edit3 size={20} />
            </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[400px] px-6 -mt-16 flex flex-col items-center">
        
        {/* Container da Foto com Lógica de Ícone Fallback */}
        <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
            <div className={`w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl transition-all ${isEditing && "ring-4 ring-ibac-orange"}`}>
                <div className="w-full h-full rounded-[22px] bg-gray-100 overflow-hidden relative flex items-center justify-center">
                    {perfil?.foto_url ? (
                        <img src={perfil.foto_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-300">
                            <User size={50} strokeWidth={1.5} />
                            <span className="text-[7px] font-black uppercase">Sem Foto</span>
                        </div>
                    )}
                    
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                            {isSaving ? <Loader2 className="animate-spin" /> : (
                                <>
                                    <Camera size={24} />
                                    <span className="text-[8px] font-black uppercase mt-1">Alterar</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUploadFoto} className="hidden" accept="image/*" />
        </div>

        <div className="text-center mt-4">
          <h1 className="text-2xl font-black uppercase text-ibac-dark leading-tight">{perfil?.nome_completo || "Usuário"}</h1>
          <p className="flex items-center justify-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            <MapPin size={12} className="text-ibac-orange" /> IBAC CENTRAL
          </p>
        </div>

        <div className="w-full mt-6 flex flex-wrap justify-center gap-2">
            {perfil?.interesses?.map((item: string) => (
              <span key={item} className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-[9px] font-black uppercase text-ibac-orange shadow-sm">{item}</span>
            ))}
        </div>

        {/* Links Sociais */}
        <div className="grid grid-cols-1 gap-3 w-full mt-8">
          <a href={formatarLinkWhatsApp(perfil?.whatsapp)} target="_blank" className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl shadow-lg font-black uppercase text-[10px] active:scale-95 transition-transform">
            <MessageCircle size={18} fill="white" /> WhatsApp
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a href={perfil?.instagram ? `https://instagram.com/${perfil.instagram.replace('@', '')}` : "#"} className={`flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg font-black uppercase text-[10px] ${perfil?.instagram ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <Instagram size={18} /> Instagram
            </a>
            <a href={perfil?.discord ? `https://discord.com/users/${perfil.discord}` : "#"} className={`flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg font-black uppercase text-[10px] ${perfil?.discord ? 'bg-[#5865F2] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <Disc size={18} /> Discord
            </a>
          </div>
        </div>

        {/* Modal de Edição */}
        <AnimatePresence>
          {isEditing && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 z-[70] w-full bg-white rounded-t-[40px] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black uppercase text-xl italic text-ibac-orange tracking-tighter">Editar Perfil</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase text-ibac-orange underline">Trocar Foto de Perfil</button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome Completo</label>
                    <input value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Ex: João Silva" className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 ring-ibac-orange/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Instagram (sem @)</label>
                    <input value={editInsta} onChange={(e) => setEditInsta(e.target.value)} placeholder="Ex: ibac_central" className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 ring-ibac-orange/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Discord ID</label>
                    <input value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} placeholder="Ex: joao#1234" className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 ring-ibac-orange/20 transition-all font-medium" />
                  </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="w-full mt-8 py-5 bg-ibac-orange text-white font-black uppercase rounded-full shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Salvar Alterações
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Menu Inferior */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-ibac-dark rounded-full py-3 px-10 flex justify-between items-center shadow-2xl z-50">
          <Link href="/home">
            <motion.div whileTap={{ y: -2 }} className="opacity-40 flex flex-col items-center">
              <img src="/logo-white.png" alt="Home" className="w-5 h-5 object-contain" />
              <span className="text-[7px] font-black uppercase mt-1 text-white italic">Home</span>
            </motion.div>
          </Link>
          
          <Link href="/perfil">
            <div className="w-14 h-14 bg-ibac-orange rounded-full flex items-center justify-center -mt-14 border-[6px] border-[#F8F8F8] shadow-lg">
              <User className="text-white" size={24} />
            </div>
          </Link>
          
          <button onClick={handleAcessarComunidade} className="opacity-40 flex flex-col cursor-pointer items-center text-white outline-none">
            <motion.div whileTap={{ y: -2 }} className="flex flex-col items-center">
              <Users size={22} />
              <span className="text-[7px] font-black uppercase mt-1 italic">Mural</span>
            </motion.div>
          </button>
        </nav>
      </div>
    </main>
  );
}