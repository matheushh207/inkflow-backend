'use client';

import {
    Calendar,
    Filter,
    MoreHorizontal,
    Clock,
    User,
    Search,
    ArrowUpRight,
    MapPin,
    AlertCircle,
    X,
    CheckCircle2,
    CalendarCheck,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function AppointmentsPage() {
    const { appointments, clients, addAppointment, updateAppointmentStatus, deleteAppointment } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterTab, setFilterTab] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const [newApp, setNewApp] = useState({
        clientId: '',
        service: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        artist: 'Selecione o Artista',
        value: 0
    });

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.service.toLowerCase().includes(searchTerm.toLowerCase());

        const today = new Date().toISOString().split('T')[0];
        if (filterTab === 'Hoje') return matchesSearch && app.date === today;
        if (filterTab === 'Finalizados') return matchesSearch && app.status === 'FINISHED';
        if (filterTab === 'Cancelados') return matchesSearch && app.status === 'CANCELLED';
        return matchesSearch;
    });

    const handleCreateApp = () => {
        const client = clients.find(c => c.id === newApp.clientId);
        if (!client) return alert('Selecione um cliente!');

        addAppointment({
            ...newApp,
            clientName: client.name,
            status: 'PENDING'
        });
        setIsModalOpen(false);
        setNewApp({ clientId: '', service: '', date: new Date().toISOString().split('T')[0], time: '14:00', artist: 'Selecione o Artista', value: 0 });
    };

    return (
        <div className="space-y-8 animate-premium-fade">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 w-full overflow-x-hidden">
                <div className="w-full lg:w-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Agendamentos</h1>
                    <p className="text-secondary-text text-[13px] font-medium uppercase tracking-widest mt-1">Gestão de Sessões e Horários</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64 min-w-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 pl-12 text-sm text-white outline-none focus:border-gold-polished/40 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap py-3.5 px-6"
                    >
                        <Calendar className="w-4 h-4" /> Novo Agendamento
                    </button>
                </div>
            </div>

            <div className="premium-card p-0">
                <div className="p-4 md:p-6 border-b border-premium-border flex justify-between items-center bg-zinc-900/10">
                    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                        {['Todos', 'Hoje', 'Finalizados'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                className={`px-4 py-2 flex-shrink-0 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterTab === tab ? 'bg-gold-polished text-black shadow-lg shadow-gold-polished/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-premium-border overflow-x-hidden">
                    {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
                        <div key={app.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:bg-zinc-900/40 transition-all text-white gap-4">
                            <div className="flex flex-row sm:items-center gap-4 md:gap-8 flex-1 w-full min-w-0">
                                <div className="text-center min-w-[70px] bg-zinc-900/50 p-2 rounded-xl border border-white/5 sm:bg-transparent sm:p-0 sm:border-0">
                                    <p className="text-[10px] sm:text-sm font-black text-zinc-500 uppercase tracking-widest">{new Date(app.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-xl sm:text-2xl font-black text-white italic">{app.time}</p>
                                </div>
                                <div className="hidden sm:block h-10 w-[1px] bg-premium-border" />
                                <div className="min-w-0 flex-1">
                                    <Link href={`/dashboard/clients/${app.clientId}`} className="text-base sm:text-lg font-bold text-white hover:text-gold-polished transition-colors block italic tracking-tight truncate">{app.clientName}</Link>
                                    <p className="text-[11px] sm:text-[12px] text-zinc-500 uppercase tracking-widest font-black leading-tight truncate">{app.service}</p>
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3 text-gold-polished" />
                                            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">{app.artist}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <MapPin className="w-3 h-3 text-zinc-600" />
                                            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest truncate">Estúdio Principal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                                <span className={`px-3 py-1.5 text-[9px] sm:text-[11px] font-black rounded-lg uppercase tracking-widest border ${app.status === 'CONFIRMED' || app.status === 'FINISHED' ? 'bg-emerald-green/10 text-emerald-green border-emerald-green/20' :
                                    app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        app.status === 'WAITING_DEPOSIT' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                    }`}>
                                    {app.status === 'CONFIRMED' ? 'Confirmado' :
                                        app.status === 'FINISHED' ? 'Finalizado' :
                                            app.status === 'CANCELLED' ? 'Cancelado' :
                                                app.status === 'WAITING_DEPOSIT' ? 'Sinal Pendente' : 'Pendente'}
                                </span>
                                <div className="relative group/menu">
                                    <button className="p-2.5 bg-zinc-900 rounded-lg border border-white/5 text-secondary-text transition-all hover:border-gold-polished/20">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    {/* DROPDOWN MENU - Modified to handle mobile placement better */}
                                    <div className="absolute right-0 bottom-full sm:bottom-0 sm:top-full mb-2 sm:mb-0 sm:mt-2 w-52 bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-[100] overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            <button onClick={() => updateAppointmentStatus(app.id, 'CONFIRMED')} className="w-full text-left px-3 py-2.5 text-[11px] font-black uppercase text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-2.5">
                                                <CheckCircle2 className="w-4 h-4" /> Confirmar
                                            </button>
                                            <button onClick={() => updateAppointmentStatus(app.id, 'FINISHED')} className="w-full text-left px-3 py-2.5 text-[11px] font-black uppercase text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all flex items-center gap-2.5">
                                                <CalendarCheck className="w-4 h-4" /> Finalizar
                                            </button>
                                            <div className="h-[1px] bg-white/5 my-1" />
                                            <button onClick={() => updateAppointmentStatus(app.id, 'CANCELLED')} className="w-full text-left px-3 py-2.5 text-[11px] font-black uppercase text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all flex items-center gap-2.5">
                                                <AlertCircle className="w-4 h-4" /> Cancelar
                                            </button>
                                            <button onClick={() => { if (confirm('Excluir agendamento?')) deleteAppointment(app.id); }} className="w-full text-left px-3 py-2.5 text-[11px] font-black uppercase text-rose-700 hover:bg-rose-700/10 rounded-lg transition-all flex items-center gap-2.5">
                                                <Trash2 className="w-4 h-4" /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center opacity-30">
                            <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                            <p className="text-sm font-black uppercase tracking-widest">Nenhum agendamento encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden">
                        <div className="flex justify-between items-center mb-6 text-white text-xl font-black uppercase italic">
                            <h3>Novo Agendamento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Cliente</label>
                                <input type="text" placeholder="Nome do cliente..." className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Data</label>
                                    <input type="date" className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Horário</label>
                                    <input type="time" className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Artista Responsável</label>
                                <select className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none">
                                    <option>Selecione o Artista</option>
                                    <option>Artista 1</option>
                                    <option>Recepção</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    alert('Agendamento realizado com sucesso!');
                                }}
                                className="btn-premium w-full py-4 mt-4 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Confirmar Reserva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
