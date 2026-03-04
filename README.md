# ⛪ IBAC - Sistema de Gestão Eclesiástica

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Aplicação Progressiva (PWA) desenvolvida para a **Igreja Batista Acolher**, focada na gestão de membros, agenda de eventos e repositório de aulas bíblicas (EBD).

---

## 🛡️ Segurança de Nível Profissional

O projeto foi construído com foco total na proteção de dados dos membros, implementando:

* **Proteção contra Brute Force:** Bloqueio temporário de acesso após múltiplas tentativas falhas.
* **Anti-Bot Honeypot:** Sistema de campo invisível para mitigar cadastros automatizados por robôs.
* **Protocolo PKCE:** Fluxo de autenticação seguro para troca de tokens via servidor.
* **Sanitização de Inputs:** Tratamento rigoroso de dados para evitar ataques de *XSS* e *SQL Injection*.
* **Row Level Security (RLS):** Proteção direta no banco de dados Supabase, garantindo que apenas administradores modifiquem conteúdos sensíveis.

---

## 📱 Experiência Mobile (UX)

Otimizado para ser utilizado como um aplicativo nativo diretamente no navegador do celular:

* **Navegação Inteligente:** Manipulação do histórico do navegador para evitar o fechamento acidental do app ao usar o botão "voltar" do Android/iOS.
* **Touch Friendly:** Áreas de clique expandidas (mínimo de 44px) e feedback visual instantâneo em cada interação.
* **Performance:** Interface leve construída com *Framer Motion* para transições suaves e estados de carregamento (Skeletons/Loaders).

---

## 🚀 Funcionalidades

### 👤 Área do Membro
* Cadastro e autenticação segura.
* Acesso ao mural de avisos e agenda semanal.
* Visualização de aulas, pregações e download de materiais de apoio (PDF).

### ⚡ Painel Administrativo
* **Gestão de Membros:** Controle de cargos (Membro/Admin) e busca rápida.
* **Gerenciador de Agenda:** Criação, edição e exclusão de eventos em tempo real.
* **Repositório de Mídia:** Upload de banners e integração com vídeos do YouTube.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Backend as a Service:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconografia:** [Lucide React](https://lucide.dev/)
* **Animações:** [Framer Motion](https://www.framer.com/motion/)

---

## ⚙️ Instalação Local

1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/ibac-app.git](https://github.com/seu-usuario/ibac-app.git)
