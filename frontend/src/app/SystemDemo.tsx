'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Star,
    LayoutDashboard,
    Package,
    ShieldCheck,
    Bell,
    FileSignature,
    HeartPulse,
    Image as ImageIcon,
    Play,
    Pause,
    RotateCcw,
    Settings,
    User,
    ClipboardList,
    Camera,
    Mail as MailIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'appointments', icon: ClipboardList, label: 'Agendamentos' },
    { id: 'clients', icon: Users, label: 'Clientes CRM' },
    { id: 'budgets', icon: BarChart3Icon, label: 'Orçamentos' },
    { id: 'finance', icon: DollarSign, label: 'Financeiro' },
    { id: 'inventory', icon: Package, label: 'Estoque' },
    { id: 'users', icon: User, label: 'Equipe' },
    { id: 'anamnesis', icon: HeartPulse, label: 'Anamnese' },
    { id: 'consent', icon: FileSignature, label: 'Consentimento' },
    { id: 'portfolio', icon: ImageIcon, label: 'Portfólio' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
];

function BarChart3Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    );
}

export default function SystemDemo() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAutopilot, setIsAutopilot] = useState(true);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const cycleItems = MENU_ITEMS.map(item => item.id);

    useEffect(() => {
        if (isAutopilot) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setActiveTab(current => {
                            const currentIndex = cycleItems.indexOf(current);
                            const nextIndex = (currentIndex + 1) % cycleItems.length;
                            return cycleItems[nextIndex];
                        });
                        return 0;
                    }
                    return prev + 1.2; // Slightly faster for 13 pages
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isAutopilot, cycleItems]);

    // Ensure active tab is visible in sidebar
    useEffect(() => {
        const activeElement = document.getElementById(`nav-${activeTab}`);
        if (activeElement && scrollRef.current) {
            scrollRef.current.scrollTo({
                top: activeElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'agenda': return <AgendaView />;
            case 'appointments': return <AppointmentsView />;
            case 'clients': return <ClientsView />;
            case 'budgets': return <BudgetsView />;
            case 'finance': return <FinanceView />;
            case 'inventory': return <InventoryView />;
            case 'users': return <UsersView />;
            case 'anamnesis': return <AnamneseView />;
            case 'consent': return <ConsentView />;
            case 'portfolio': return <PortfolioView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto premium-card bg-[#0A0A0A] border-gold-polished/20 shadow-2xl overflow-hidden animate-premium-fade relative group/demo">
            {/* WINDOW TOP BAR */}
            <div className="bg-[#1A1A1A] px-6 py-3 border-b border-premium-border flex items-center justify-between z-30 relative">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1 bg-black/40 rounded-lg border border-white/5 text-[12px] text-zinc-500 font-mono tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    PLATAFORMA.INKFLOW.APP
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAutopilot(!isAutopilot)}
                        className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-gold-polished hover:text-white transition-colors"
                    >
                        {isAutopilot ? <Pause className="w-4 h-4 text-gold-polished" /> : <Play className="w-4 h-4 text-emerald-500" />}
                        {isAutopilot ? 'Stop Video' : 'Start Video'}
                    </button>
                    <div className="w-1.5 h-6 bg-white/10 hidden md:block" />
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gold-polished/20 border border-gold-polished/20" />
                    </div>
                </div>
            </div>

            {/* PROGRESS BAR (Video style) */}
            {isAutopilot && (
                <div className="absolute top-[44px] left-0 right-0 h-0.5 bg-white/5 z-40">
                    <div
                        className="h-full bg-gold-polished shadow-[0_0_8px_var(--accent-secondary)] transition-all duration-75 linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex h-[600px]">
                {/* SIDEBAR MOCK */}
                <aside className="w-48 border-r border-premium-border bg-[#0D0D0D] hidden md:flex flex-col z-20 relative">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 sidebar-scroll-demo">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                id={`nav-${item.id}`}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsAutopilot(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest text-left w-full",
                                    activeTab === item.id
                                        ? "bg-gold-polished/10 text-gold-polished border border-gold-polished/20"
                                        : "text-zinc-600 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                <span className="truncate">{item.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-premium-border bg-[#0A0A0A]">
                        <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-xl border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-gold-polished text-black flex items-center justify-center text-[10px] font-black">A</div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[12px] font-bold truncate text-white">Administrador</p>
                                <p className="text-[10px] text-gold-polished truncate uppercase tracking-tighter">Plano Pro</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CONTENT AREA */}
                <main className="flex-1 overflow-hidden relative bg-[#050505]">
                    <div className="w-full h-full p-8 overflow-y-auto scrollbar-hide animate-premium-fade" key={activeTab}>
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* OVERLAY HINT */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="px-6 py-2 bg-black/80 backdrop-blur-xl border border-gold-polished/30 rounded-full flex items-center gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    <div className="w-2 h-2 rounded-full bg-gold-polished animate-pulse shadow-[0_0_10px_var(--accent-secondary)]" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                        {isAutopilot ? 'Tour Automático Ativo' : 'Navegação Manual'}
                    </span>
                    <span className="text-[12px] text-zinc-500 font-bold border-l border-white/20 pl-4">
                        {MENU_ITEMS.findIndex(m => m.id === activeTab) + 1} / {MENU_ITEMS.length}
                    </span>
                </div>
            </div>

            <style jsx global>{`
                .sidebar-scroll-demo::-webkit-scrollbar { width: 3px; }
                .sidebar-scroll-demo::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll-demo::-webkit-scrollbar-thumb { background: var(--accent-secondary); border-radius: 10px; }
                .sidebar-scroll-demo:hover::-webkit-scrollbar-thumb { background: var(--accent-primary); }
            `}</style>
        </div>
    );
}

/* --- ALL 13 VIEW COMPONENTS --- */

function DashboardView() {
    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase border-b border-gold-polished/20 pb-4">Centro de Comando InkFlow</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Faturamento Hoje</p>
                    <h4 className="text-3xl font-black text-white">R$ 8.450</h4>
                    <p className="text-[11px] text-emerald-500 mt-2 font-bold">+22% vs ontem</p>
                </div>
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Leads (E-mail)</p>
                    <h4 className="text-3xl font-black text-white">24</h4>
                    <p className="text-[11px] text-gold-polished mt-2 font-bold">12 confirmados via link</p>
                </div>
            </div>
            <div className="premium-card p-6">
                <h4 className="text-xs font-black uppercase text-gold-polished mb-4 tracking-widest">Performance da Equipe</h4>
                <div className="space-y-4">
                    {[
                        { name: 'Gabriel Tatu', perf: 95, color: 'bg-emerald-500' },
                        { name: 'Letícia Ink', perf: 78, color: 'bg-gold-polished' },
                        { name: 'Marcus Black', perf: 45, color: 'bg-rose-500' },
                    ].map(st => (
                        <div key={st.name} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                                <span>{st.name}</span>
                                <span>{st.perf}% Meta</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", st.color)} style={{ width: `${st.perf}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AgendaView() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-white">
                <h3 className="text-xl font-black uppercase border-l-4 border-gold-polished pl-4">Agenda Inteligente</h3>
                <div className="text-[12px] font-black px-2 py-1 bg-zinc-900 rounded border border-white/5 uppercase">Fevereiro 23, 2026</div>
            </div>
            <div className="grid grid-cols-7 gap-1 border border-white/5 rounded-xl overflow-hidden bg-zinc-900/20">
                {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={cn("aspect-square flex flex-col items-center justify-center border-[0.5px] border-white/5", i === 5 ? 'bg-gold-polished/20 text-gold-polished' : 'text-zinc-600')}>
                        <span className="text-[12px] font-black">{i + 15}</span>
                        {i % 4 === 0 && <div className="w-1.5 h-1.5 rounded-full bg-current mt-1" />}
                    </div>
                ))}
            </div>
            <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-2xl border-l-2 border-gold-polished">
                    <p className="text-[11px] font-black text-gold-polished uppercase mb-1">Próxima Sessão - 15:00</p>
                    <p className="text-sm font-bold text-white">André Rossi {'//'} Fechamento de Costas</p>
                </div>
            </div>
        </div>
    );
}

function AppointmentsView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase">Lista de Agendamentos</h3>
            <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 premium-card bg-[#0D0D0D] border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-900 rounded-lg"><Clock className="w-4 h-4 text-zinc-500" /></div>
                            <div>
                                <p className="text-sm font-bold text-white">Cliente #{1024 + i}</p>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Confirmado via E-mail</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] font-black text-white">R$ 450,00</p>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Confirmado</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ClientsView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase">CRM de Clientes</h3>
            <div className="grid grid-cols-1 gap-3">
                {[
                    { n: 'Mariana Silva', t: 'VIP Platinum', v: 'R$ 12.400' },
                    { n: 'Carlos Eduardo', t: 'Frequente', v: 'R$ 2.100' },
                    { n: 'Amanda Costa', t: 'Novo', v: 'R$ 600' },
                ].map((c, i) => (
                    <div key={i} className="p-4 premium-card flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold-polished/10 flex items-center justify-center text-gold-polished border border-gold-polished/20">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white group-hover:text-gold-polished transition-colors">{c.n}</h4>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{c.t}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-white">{c.v}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">Lifetime Value</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BudgetsView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gestão de Orçamentos</h3>
            <div className="grid grid-cols-1 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="p-5 premium-card bg-zinc-900/30 border-white/5 space-y-4">
                        <div className="flex justify-between">
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase">Aguardando Aprovação</span>
                            <span className="text-[10px] text-zinc-500 font-mono">#ORC-2026-00{i}</span>
                        </div>
                        <div>
                            <p className="text-base font-bold text-white uppercase">Projeto Realismo Dark {'//'} Braço Completo</p>
                            <p className="text-[11px] text-zinc-500 mt-1 italic">Estimativa: 04 sessões de 06 horas</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <p className="text-xl font-black text-gold-polished">R$ 5.800</p>
                            <button className="px-3 py-1.5 bg-white text-black text-[11px] font-black uppercase rounded hover:bg-gold-polished transition-colors">Detalhes</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FinanceView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gestão Financeira</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Entradas (Mes)</p>
                    <p className="text-2xl font-black text-white">R$ 31.250</p>
                </div>
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                    <p className="text-[11px] font-black text-rose-500 uppercase mb-1">Custos Fixos</p>
                    <p className="text-2xl font-black text-white">R$ 8.900</p>
                </div>
            </div>
            <div className="premium-card p-6 min-h-[150px] flex items-end justify-between gap-1 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-gold-polished/40 rounded-t animate-grow" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
        </div>
    );
}

function InventoryView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Inventário de Produtos</h3>
            <div className="space-y-3">
                {[
                    { item: 'Tintas Dynamic Black', q: 12, s: 'OK', c: 'text-emerald-500' },
                    { item: 'Agulhas 3RL RL Precision', q: 0, s: 'ESGOTADO', c: 'text-rose-500' },
                    { item: 'Grip Descartável 25mm', q: 5, s: 'BAIXO', c: 'text-amber-500' },
                ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-4 premium-card bg-zinc-900/40">
                        <div>
                            <p className="text-sm font-bold text-white">{inv.item}</p>
                            <p className="text-[9px] text-zinc-500 font-black uppercase">Qtd em Estoque: {inv.q}</p>
                        </div>
                        <span className={cn("text-[8px] font-black uppercase", inv.c)}>{inv.s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Equipe & Colaboradores</h3>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { name: 'Lucas "Gabriel" Tatu', role: 'Artist Lead', clients: 85 },
                    { name: 'Fernanda Ink', role: 'Artist Junior', clients: 32 },
                ].map((user, i) => (
                    <div key={i} className="p-4 premium-card flex items-center gap-6 border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-zinc-500 border border-white/5">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-tighter">{user.name}</h4>
                            <p className="text-[10px] text-gold-polished uppercase font-black">{user.role}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-white">{user.clients}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">Atendimentos</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnamneseView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Protocolo de Anamnese</h3>
            <div className="premium-card p-6 bg-emerald-500/5 border-emerald-500/20">
                <div className="flex items-center gap-4 mb-6">
                    <HeartPulse className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-black text-white uppercase">Checkout de biossegurança Ativo</p>
                </div>
                <div className="space-y-4">
                    {['Histórico Alérgico', 'Condições de Pele', 'Doenças Crônicas', 'Medicamentos'].map(label => (
                        <div key={label} className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-zinc-400">{label}</span>
                            <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center"><ShieldCheck className="w-3 h-3 text-emerald-500" /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ConsentView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Termos & Consentimento</h3>
            <div className="p-6 bg-zinc-900/60 rounded-3xl border border-white/5 space-y-4">
                <div className="h-40 overflow-y-auto pr-4 text-[10px] text-zinc-500 font-medium leading-relaxed font-mono">
                    Eu, o abaixo assinado, declaro estar ciente de todos os riscos biológicos e estéticos envolvidos no procedimento de tatuagem...
                    [CONTEÚDO DO TERMO DIGITAL INKFLOW]...
                    Assinatura digital vinculada ao IP: 192.168.1.1
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                        <FileSignature className="w-5 h-5 text-gold-polished" />
                        <span className="text-[9px] font-black text-white uppercase">Validado via DocuSign Digital</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">ASSINADO</span>
                </div>
            </div>
        </div>
    );
}

function PortfolioView() {
    const images = [
        "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Trabalho #1 (ID: JPl0GPNoeoM)
        "https://images.unsplash.com/photo-1540174053853-1cc5d1fa8814?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Trabalho #2 (ID: pIltvcnqsfU)
        "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=500&auto=format&fit=crop", // Trabalho #3: Arte Profissional
        "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=500&auto=format&fit=crop"  // Trabalho #4: Blackwork
    ];

    return (
        <div className="space-y-6 text-white pb-10">
            <h3 className="text-xl font-black uppercase tracking-tighter">Portfólio Digital</h3>
            <div className="grid grid-cols-2 gap-4">
                {images.map((url, i) => (
                    <div key={i} className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden group/img relative shadow-2xl">
                        <img
                            src={url}
                            alt={`Tattoo work ${i + 1}`}
                            className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gold-polished/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-500 pointer-events-none">
                            <Camera className="w-8 h-8 text-gold-polished drop-shadow-2xl" />
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[11px] font-black text-white uppercase border border-white/10">
                            TRABALHO #{i + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



function SettingsView() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter uppercase">Configurações</h3>
            <div className="space-y-3">
                {[
                    { l: 'Dados do Estúdio', i: User },
                    { l: 'Planos & Assinatura', i: Star },
                    { l: 'Configuração de E-mail', i: MailIcon },
                    { l: 'Segurança & Backups', i: ShieldCheck },
                ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 premium-card bg-zinc-900/30 border-white/5 group hover:border-gold-polished/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <s.i className="w-4 h-4 text-zinc-400 group-hover:text-gold-polished transition-colors" />
                            <span className="text-[10px] font-black text-zinc-200 uppercase tracking-widest">{s.l}</span>
                        </div>
                        <ArrowRightIcon className="w-3 h-3 text-zinc-600" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function ArrowRightIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
