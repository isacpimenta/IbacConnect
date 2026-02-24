"use client";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, Calendar, Video, CheckCircle, Trash2, 
  Upload, FileText, Image as ImageIcon, X, MapPin, 
  Youtube
} from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const [status, setStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  
  const [eventos, setEventos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);

  // Estados Agenda
  const [agendaForm, setAgendaForm] = useState({ titulo: "", dia_semana: "Segunda", horario: "", local: "", descricao: "" });
  const [fileImagem, setFileImagem] = useState<File | null>(null);

  // Estados Aula - VIDEO_URL AGORA COMEÇA VAZIO E É OPCIONAL
  const [aulaForm, setAulaForm] = useState({ titulo: "", categoria: "Pregação", video_url: "" });
  const [filePdf, setFilePdf] = useState<File | null>(null);
  const [fileBannerAula, setFileBannerAula] = useState<File | null>(null);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  async function fetchData() {
    const { data: ag } = await supabase.from('agenda').select('*').order('created_at', { ascending: false });
    const { data: au } = await supabase.from('aulas').select('*').order('created_at', { ascending: false });
    setEventos(ag || []);
    setAulas(au || []);
  }

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const salvarAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      let urlFinal = fileImagem ? await uploadFile(fileImagem, 'imagens-agenda') : "";
      const { error } = await supabase.from('agenda').insert([{ ...agendaForm, imagem_url: urlFinal }]);
      if (error) throw error;
      setStatus("Evento salvo com sucesso!");
      setAgendaForm({ titulo: "", dia_semana: "Segunda", horario: "", local: "", descricao: "" });
      setFileImagem(null);
      fetchData();
    } catch (err: any) { alert(`Erro: ${err.message}`); } finally { setLoadingAction(false); }
  };

  const salvarAula = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      // 1. Uploads independentes (só acontecem se o arquivo existir)
      let pdfUrlFinal = filePdf ? await uploadFile(filePdf, 'arquivos-aulas') : null;
      let bannerUrlFinal = fileBannerAula ? await uploadFile(fileBannerAula, 'imagens-agenda') : null;

      // 2. Tratamento do link do YouTube (converte string vazia em null)
      const videoUrlLimpo = aulaForm.video_url.trim() === "" ? null : aulaForm.video_url.trim();

      const { error } = await supabase.from('aulas').insert([
        { 
          titulo: aulaForm.titulo,
          categoria: aulaForm.categoria,
          video_url: videoUrlLimpo,
          pdf_url: pdfUrlFinal,
          banner_url: bannerUrlFinal
        }
      ]);

      if (error) throw error;

      // 3. Sucesso: Reseta tudo
      setStatus("Conteúdo publicado com sucesso!");
      setAulaForm({ titulo: "", categoria: "Pregação", video_url: "" });
      setFilePdf(null);
      setFileBannerAula(null);
      fetchData();
    } catch (err: any) { 
      console.error(err);
      alert(`Erro ao salvar: ${err.message}`); 
    } finally { 
      setLoadingAction(false); 
    }
  };
  
  const excluirItem = async (tabela: string, id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await supabase.from(tabela).delete().eq('id', id);
    fetchData();
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!isAdmin) return <div className="p-10 text-center font-bold">Acesso negado.</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-40 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Gestão <span className="text-[#F47920]">IBAC</span></h1>
          <div className="h-1 w-12 bg-[#F47920] mt-2 rounded-full"></div>
        </header>

        {status && (
          <div className="bg-green-600 text-white p-4 rounded-2xl mb-8 flex items-center justify-between shadow-lg">
            <span className="text-xs font-bold uppercase tracking-widest">{status}</span>
            <button onClick={() => setStatus("")}><X size={18} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* COLUNA AGENDA */}
          <section className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-100 text-[#F47920] rounded-2xl"><Calendar size={24} /></div>
                <h2 className="font-black uppercase text-sm tracking-widest">Nova Agenda</h2>
              </div>

              <form onSubmit={salvarAgenda} className="space-y-4">
                <input placeholder="Título do Evento" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                       value={agendaForm.titulo} onChange={e => setAgendaForm({...agendaForm, titulo: e.target.value})} required />
                
                <div className="flex gap-2">
                  <select className="flex-1 p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                          value={agendaForm.dia_semana} onChange={e => setAgendaForm({...agendaForm, dia_semana: e.target.value})}>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input placeholder="19:30" className="w-24 p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                         value={agendaForm.horario} onChange={e => setAgendaForm({...agendaForm, horario: e.target.value})} required />
                </div>

                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input placeholder="Local" className="w-full p-4 pl-10 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                           value={agendaForm.local} onChange={e => setAgendaForm({...agendaForm, local: e.target.value})} required />
                </div>

                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setFileImagem(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${fileImagem ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                    {fileImagem ? <CheckCircle className="text-green-500" size={16}/> : <ImageIcon className="text-gray-400" size={16}/>}
                    <span className="text-[10px] font-black uppercase text-gray-500">Banner</span>
                  </div>
                </div>

                <button disabled={loadingAction} className="w-full py-5 bg-[#F47920] text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                  {loadingAction ? "Processando..." : "Confirmar Evento"}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {eventos.map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-800">{ev.titulo}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{ev.dia_semana} • {ev.horario}</span>
                  </div>
                  <button onClick={() => excluirItem('agenda', ev.id)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </section>

          {/* COLUNA AULAS */}
          <section className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-100 text-gray-800 rounded-2xl"><Video size={24} /></div>
                <h2 className="font-black uppercase text-sm tracking-widest">Novo Conteúdo</h2>
              </div>

              <form onSubmit={salvarAula} className="space-y-4">
                <input placeholder="Título" className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                       value={aulaForm.titulo} onChange={e => setAulaForm({...aulaForm, titulo: e.target.value})} required />
                
                <select className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                        value={aulaForm.categoria} onChange={e => setAulaForm({...aulaForm, categoria: e.target.value})}>
                  <option value="Pregação">Pregação</option>
                  <option value="EBD">EBD</option>
                </select>

                {/* LINK DO YOUTUBE - AGORA SEM 'REQUIRED' */}
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input placeholder="Link YouTube (Opcional)" className="w-full p-4 pl-10 bg-gray-50 rounded-2xl text-xs font-bold outline-none border-none" 
                         value={aulaForm.video_url} onChange={e => setAulaForm({...aulaForm, video_url: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => setFileBannerAula(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${fileBannerAula ? "border-orange-400 bg-orange-50" : "border-gray-200"}`}>
                      <ImageIcon className={fileBannerAula ? "text-orange-500" : "text-gray-400"} size={14}/>
                      <span className="text-[8px] font-black uppercase text-gray-500">Capa</span>
                    </div>
                  </div>

                  <div className="relative group">
                    <input type="file" accept=".pdf" onChange={(e) => setFilePdf(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${filePdf ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                      <FileText className={filePdf ? "text-blue-500" : "text-gray-400"} size={14}/>
                      <span className="text-[8px] font-black uppercase text-gray-500">PDF</span>
                    </div>
                  </div>
                </div>

                <button disabled={loadingAction} className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  {loadingAction ? "Publicando..." : "Publicar Conteúdo"}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {aulas.map(au => (
                <div key={au.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-800">{au.titulo}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{au.categoria}</span>
                      {au.video_url && <Youtube size={10} className="text-red-400" />}
                      {au.pdf_url && <FileText size={10} className="text-blue-400" />}
                    </div>
                  </div>
                  <button onClick={() => excluirItem('aulas', au.id)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}