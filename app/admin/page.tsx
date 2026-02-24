"use client";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, Calendar, Video, Trash2, Edit3,
  FileText, Image as ImageIcon, X, MapPin, 
  Users, PlayCircle, ShieldCheck, ShieldAlert, Search, User, Link as LinkIcon,
  AlignLeft, Check
} from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const [status, setStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [eventos, setEventos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [perfilLogado, setPerfilLogado] = useState<any>(null);

  // Estados para Edição
  const [editandoAgenda, setEditandoAgenda] = useState<string | null>(null);
  const [editandoAula, setEditandoAula] = useState<string | null>(null);

  // Estados dos Formulários
  const [agendaForm, setAgendaForm] = useState({ titulo: "", dia_semana: "Segunda", horario: "", local: "", descricao: "" });
  const [fileImagem, setFileImagem] = useState<File | null>(null);
  
  const [aulaForm, setAulaForm] = useState({ titulo: "", categoria: "Pregação", video_url: "" });
  const [filePdf, setFilePdf] = useState<File | null>(null);
  const [fileBannerAula, setFileBannerAula] = useState<File | null>(null);

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => { 
    if (isAdmin) fetchData(); 
  }, [isAdmin]);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setPerfilLogado(user);
      const { data: ag } = await supabase.from('agenda').select('*').order('created_at', { ascending: false });
      const { data: au } = await supabase.from('aulas').select('*').order('created_at', { ascending: false });
      const { data: mb } = await supabase.from('perfis').select('*').order('role', { ascending: true }).order('nome_completo', { ascending: true });
      setEventos(ag || []);
      setAulas(au || []);
      setMembros(mb || []);
    } catch (err: any) { console.error("Erro ao carregar dados:", err.message); }
  }

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- FUNÇÕES AGENDA ---
  const salvarAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      let urlFinal = fileImagem ? await uploadFile(fileImagem, 'imagens-agenda') : (editandoAgenda ? eventos.find(ev => ev.id === editandoAgenda)?.imagem_url : "");
      
      const payload = { ...agendaForm, imagem_url: urlFinal };

      if (editandoAgenda) {
        await supabase.from('agenda').update(payload).eq('id', editandoAgenda);
        setStatus("Evento atualizado!");
      } else {
        await supabase.from('agenda').insert([payload]);
        setStatus("Evento criado!");
      }

      setEditandoAgenda(null);
      setAgendaForm({ titulo: "", dia_semana: "Segunda", horario: "", local: "", descricao: "" });
      setFileImagem(null);
      setFileInputKey(Date.now());
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoadingAction(false); }
  };

  const prepararEdicaoAgenda = (ev: any) => {
    setEditandoAgenda(ev.id);
    setAgendaForm({ titulo: ev.titulo, dia_semana: ev.dia_semana, horario: ev.horario, local: ev.local || "", descricao: ev.descricao || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FUNÇÕES AULAS / EBD ---
  const salvarAula = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      let pdfUrlFinal = filePdf ? await uploadFile(filePdf, 'arquivos-aulas') : (editandoAula ? aulas.find(a => a.id === editandoAula)?.pdf_url : null);
      let bannerUrlFinal = fileBannerAula ? await uploadFile(fileBannerAula, 'imagens-agenda') : (editandoAula ? aulas.find(a => a.id === editandoAula)?.banner_url : null);
      
      const payload = { 
        ...aulaForm, 
        video_url: aulaForm.video_url.trim() || null, 
        pdf_url: pdfUrlFinal, 
        banner_url: bannerUrlFinal 
      };

      if (editandoAula) {
        await supabase.from('aulas').update(payload).eq('id', editandoAula);
        setStatus("Postagem atualizada!");
      } else {
        await supabase.from('aulas').insert([payload]);
        setStatus("Conteúdo publicado!");
      }

      setEditandoAula(null);
      setAulaForm({ titulo: "", categoria: "Pregação", video_url: "" });
      setFilePdf(null); setFileBannerAula(null);
      setFileInputKey(Date.now());
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoadingAction(false); }
  };

  const prepararEdicaoAula = (au: any) => {
    setEditandoAula(au.id);
    setAulaForm({ titulo: au.titulo, categoria: au.categoria, video_url: au.video_url || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- GERAL ---
  const excluirItem = async (tabela: string, id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente?")) return;
    const { error } = await supabase.from(tabela).delete().eq('id', id);
    if (error) alert(error.message);
    fetchData();
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (perfilLogado?.id === userId) return;
    setLoadingAction(true);
    const novoRole = currentRole === 'admin' ? 'membro' : 'admin';
    try {
      await supabase.from('perfis').update({ role: novoRole }).eq('id', userId);
      setStatus(`Cargo alterado!`);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoadingAction(false); }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!isAdmin) return <div className="p-10 text-center font-black uppercase">Acesso Negado</div>;

  return (
    <main className="min-h-screen bg-[#FBFBFB] p-6 pb-40 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-[900] uppercase tracking-tighter text-gray-900 leading-none">
              Gestão <span className="text-[#F47920]">IBAC</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Painel Administrativo v2.0</p>
          </div>
          <div className="px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Sistema Ativo</span>
          </div>
        </header>

        {status && (
          <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-widest">{status}</span>
            <button onClick={() => setStatus("")} className="bg-white/10 p-1 rounded-lg"><X size={14} /></button>
          </div>
        )}

        {/* GESTÃO DE MEMBROS */}
        <section className="mb-12 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
              <Users className="text-blue-600" size={20} /> Controle de Membros
            </h2>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input placeholder="Buscar membro..." className="w-full p-4 pl-12 bg-gray-50 rounded-2xl text-[10px] font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50">
                  <th className="pb-4 px-4">Nome</th>
                  <th className="pb-4 px-4">Cidade</th>
                  <th className="pb-4 px-4">Cargo</th>
                  <th className="pb-4 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {membros.filter(m => m.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                  <tr key={m.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                          {m.foto_url ? <img src={m.foto_url} className="w-full h-full object-cover" /> : <User className="text-gray-300 m-auto" size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">{m.nome_completo} {perfilLogado?.id === m.id && "(Você)"}</span>
                          <span className="text-[8px] text-gray-400 font-medium">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase">{m.cidade || 'IBAC'}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[8px] font-black uppercase ${m.role === 'admin' ? 'text-green-600' : 'text-gray-300'}`}>
                        {m.role === 'admin' ? 'Administrador' : 'Membro'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {perfilLogado?.id !== m.id && (
                        <button onClick={() => toggleAdmin(m.id, m.role)} className="p-2 text-gray-400 hover:text-blue-600">
                          {m.role === 'admin' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* COLUNA AGENDA */}
          <section className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                <Calendar className="text-orange-500" size={18} /> {editandoAgenda ? 'Editar Evento' : 'Nova Agenda'}
              </h2>
              <form onSubmit={salvarAgenda} className="space-y-4">
                <input placeholder="Título do Evento" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={agendaForm.titulo} onChange={e => setAgendaForm({...agendaForm, titulo: e.target.value})} required />
                <div className="flex gap-2">
                  <select className="flex-1 p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={agendaForm.dia_semana} onChange={e => setAgendaForm({...agendaForm, dia_semana: e.target.value})}>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input placeholder="19:30" className="w-24 p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={agendaForm.horario} onChange={e => setAgendaForm({...agendaForm, horario: e.target.value})} required />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input placeholder="Local" className="w-full p-4 pl-12 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={agendaForm.local} onChange={e => setAgendaForm({...agendaForm, local: e.target.value})} />
                </div>
                <textarea placeholder="Descrição" rows={2} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none resize-none" value={agendaForm.descricao} onChange={e => setAgendaForm({...agendaForm, descricao: e.target.value})} />
                
                <div className="relative group">
                  <input key={fileInputKey} type="file" accept="image/*" onChange={(e) => setFileImagem(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 ${fileImagem ? "border-green-400 bg-green-50 text-green-600" : "border-gray-200 text-gray-400"}`}>
                    <ImageIcon size={16}/>
                    <span className="text-[10px] font-black uppercase">{fileImagem ? "Nova Imagem" : editandoAgenda ? "Alterar Banner" : "Banner do Evento"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editandoAgenda && (
                    <button type="button" onClick={() => {setEditandoAgenda(null); setAgendaForm({titulo:"", dia_semana:"Segunda", horario:"", local:"", descricao:""})}} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                  )}
                  <button disabled={loadingAction} className="flex-[2] py-4 bg-[#F47920] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center">
                    {loadingAction ? <Loader2 className="animate-spin" /> : editandoAgenda ? 'Atualizar Evento' : 'Salvar Evento'}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-gray-400 ml-4">Eventos Ativos</h3>
              {eventos.map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group">
                  <div className="flex flex-col px-2">
                    <span className="text-[10px] font-black text-gray-800">{ev.titulo}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{ev.dia_semana} às {ev.horario} {ev.local && `• ${ev.local}`}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicaoAgenda(ev)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
                    <button onClick={() => excluirItem('agenda', ev.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUNA POSTAGENS */}
          <section className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                <Video className="text-gray-900" size={18} /> {editandoAula ? 'Editar Postagem' : 'Nova Postagem'}
              </h2>
              <form onSubmit={salvarAula} className="space-y-4">
                <input placeholder="Título" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={aulaForm.titulo} onChange={e => setAulaForm({...aulaForm, titulo: e.target.value})} required />
                <input placeholder="Link do vídeo (opcional)" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={aulaForm.video_url} onChange={e => setAulaForm({...aulaForm, video_url: e.target.value})} />
                <select className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none" value={aulaForm.categoria} onChange={e => setAulaForm({...aulaForm, categoria: e.target.value})}>
                  <option value="Pregação">Pregação</option>
                  <option value="EBD">EBD</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative group">
                    <input key={`pdf-${fileInputKey}`} type="file" accept=".pdf" onChange={(e) => setFilePdf(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${filePdf ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-400"}`}>
                      <FileText size={14}/>
                      <span className="text-[8px] font-black uppercase mt-1">{filePdf ? "Novo PDF" : "Esboço PDF"}</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <input key={`capa-${fileInputKey}`} type="file" accept="image/*" onChange={(e) => setFileBannerAula(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${fileBannerAula ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-400"}`}>
                      <ImageIcon size={14}/>
                      <span className="text-[8px] font-black uppercase mt-1">{fileBannerAula ? "Nova Capa" : "Imagem Capa"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editandoAula && (
                    <button type="button" onClick={() => {setEditandoAula(null); setAulaForm({titulo:"", categoria:"Pregação", video_url:""})}} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                  )}
                  <button disabled={loadingAction} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center">
                    {loadingAction ? <Loader2 className="animate-spin" /> : editandoAula ? 'Atualizar Post' : 'Publicar Conteúdo'}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-gray-400 ml-4">Últimas Postagens</h3>
              {aulas.map(au => (
                <div key={au.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group">
                  <div className="flex flex-col px-2">
                    <span className="text-[10px] font-black text-gray-800">{au.titulo}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{au.categoria}</span>
                      {au.pdf_url && <FileText size={10} className="text-blue-500" />}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicaoAula(au)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
                    <button onClick={() => excluirItem('aulas', au.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className={`w-10 h-10 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}