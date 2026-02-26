'use client';

import Link from 'next/link';
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
    Plus,
    ClipboardList,
    BarChart3,
    CheckCircle2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const STATS_CONFIG = [
    { label: 'Faturamento Total', key: 'revenue', icon: DollarSign, color: 'text-gold-polished', href: '/dashboard/finance' },
    { label: 'Total de Clientes', key: 'clients', icon: Users, color: 'text-blue-500', href: '/dashboard/clients' },
    { label: 'Agendamentos', key: 'appointments', icon: Calendar, color: 'text-emerald-500', href: '/dashboard/agenda' },
    { label: 'Orçamentos Ativos', key: 'budgets', icon: Star, color: 'text-amber-500', href: '/dashboard/budgets' },
];

export default function DashboardPage() {
    const { clients, appointments, budgets, transactions, inventory, team } = useStore();

    const todayRevenue = transactions
        .filter(t => t.date.startsWith(new Date().toISOString().split('T')[0]) && t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

    const artists = team.filter(m => m.role === 'Artista' && m.status === 'Ativo');
    const performanceRows = artists.map((a, idx) => {
        const totalApps = appointments.length;
        const artistApps = appointments.filter(ap => (ap.artist || '').toLowerCase() === a.name.toLowerCase()).length;
        const perf = totalApps > 0 ? Math.round((artistApps / totalApps) * 100) : 0;
        const colors = ['bg-emerald-500', 'bg-gold-polished', 'bg-rose-500', 'bg-blue-500'];
        return { name: a.name, perf, color: colors[idx % colors.length] };
    });

    const forecast = budgets
        .filter(b => b.status === 'READY' || b.status === 'PAID')
        .reduce((acc, b) => acc + (b.value || 0), 0);

    return (
        <div className="space-y-6 md:space-y-8 animate-premium-fade w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic">Visão Geral</h1>
                    <p className="text-secondary-text text-sm sm:text-base mt-2">Gestão centralizada do seu estúdio em tempo real.</p>
                </div>
                <div className="p-3 bg-premium-card border-gold-polished/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold-polished animate-pulse" />
                    <span className="text-[12px] font-black uppercase tracking-widest text-gold-polished">Sistema Operacional Ativo</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Faturamento Total</p>
                    <h4 className="text-3xl font-black text-white">R$ {transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0).toLocaleString('pt-BR')}</h4>
                    <p className="text-[12px] text-emerald-500 mt-2 font-bold">{transactions.length} transações registradas</p>
                </div>
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Novos Leads</p>
                    <h4 className="text-3xl font-black text-white">{budgets.length}</h4>
                    <p className="text-[12px] text-gold-polished mt-2 font-bold">{budgets.filter(b => b.status === 'READY').length} prontos para agendar</p>
                </div>
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Clientes VIP</p>
                    <h4 className="text-3xl font-black text-white">{clients.filter(c => c.status === 'VIP').length}</h4>
                    <p className="text-[12px] text-blue-500 mt-2 font-bold">Total de {clients.length} clientes na base</p>
                </div>
                <div className="premium-card p-6 bg-gradient-to-br from-zinc-900 to-black border-gold-polished/10">
                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-1">Agendamentos</p>
                    <h4 className="text-3xl font-black text-white">{appointments.length}</h4>
                    <p className="text-[12px] text-amber-500 mt-2 font-bold">{appointments.filter(a => a.status === 'PENDING').length} pendentes de confirmação</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PERFORMANCE & ALERTS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="premium-card p-6">
                        <h4 className="text-sm font-black uppercase text-gold-polished mb-4 tracking-widest">Performance da Equipe</h4>
                        {performanceRows.length > 0 ? (
                            <div className="space-y-6">
                                {performanceRows.map(st => (
                                    <div key={st.name} className="space-y-2">
                                        <div className="flex justify-between text-[12px] font-bold text-zinc-400 uppercase tracking-tighter">
                                            <span>{st.name}</span>
                                            <span>{st.perf}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${st.color}`} style={{ width: `${st.perf}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center opacity-50">
                                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500">Nenhum tatuador ativo cadastrado</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Próximos Agendamentos</h2>
                        <Link href="/dashboard/agenda" className="text-[12px] font-black uppercase text-gold-polished hover:underline">Ver Agenda Completa</Link>
                    </div>

                    <div className="space-y-4">
                        {appointments.length > 0 ? appointments.slice(0, 3).map((app) => (
                            <div key={app.id} className="premium-card flex items-center gap-6 group hover:translate-x-1 transition-all">
                                <div className="text-center min-w-[60px] border-r border-premium-border pr-6">
                                    <p className="text-2xl font-black text-white">{app.time}</p>
                                    <p className="text-[11px] font-black text-secondary-text uppercase italic">GMT -3</p>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg group-hover:text-gold-polished transition-colors">{app.clientName}</h4>
                                    <p className="text-[12px] text-secondary-text uppercase tracking-[0.2em]">{app.service} {'//'} {app.artist}</p>
                                </div>
                                <span className="px-3 py-1 bg-gold-polished/10 text-gold-polished text-[12px] font-black rounded-full border border-gold-polished/10 uppercase tracking-tighter">{app.status}</span>
                            </div>
                        )) : (
                            <div className="premium-card bg-zinc-900/20 border-dashed border-zinc-800 text-center py-12">
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Nenhum agendamento para hoje</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ALERTS */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Principais Alertas</h2>
                    {inventory.filter(i => i.stock <= i.minStock).map(item => (
                        <div key={item.id} className="premium-card bg-rose-500/5 border-rose-500/20 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Insumo em Falta</p>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                </div>
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-xs text-zinc-500">Restante: {item.stock} {item.unit}</p>
                                <Link href="/dashboard/inventory" className="text-[11px] font-black bg-rose-500 text-white px-3 py-1.5 rounded uppercase hover:bg-rose-600 transition-colors">Solicitar Estoque</Link>
                            </div>
                        </div>
                    ))}

                    <div className="premium-card p-6 border-gold-polished/10 bg-gradient-to-br from-black to-zinc-900">
                        <TrendingUp className="w-8 h-8 text-gold-polished mb-4" />
                        <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Previsão</p>
                        <h4 className="text-2xl font-black text-white mt-1">R$ {forecast.toLocaleString('pt-BR')}</h4>
                        <p className="text-[12px] text-secondary-text mt-2 italic">Baseado em orçamentos prontos/pagos</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
