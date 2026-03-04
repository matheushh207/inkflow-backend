'use client';

import {
    Search,
    UserPlus,
    Filter,
    MoreVertical,
    Star,
    TrendingUp,
    Clock,
    ShieldCheck,
    Phone,
    Instagram,
    Mail,
    ArrowUpRight,
    Link as LinkIcon,
    X,
    UserCircle,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function ClientsPage() {
    const { clients, addClient, deleteClient } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', instagram: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'VIP' | 'RISK' | 'INACTIVE'>('ALL');

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAddClient = () => {
        if (!newClient.name || !newClient.phone) {
            alert('Nome e Telefone são obrigatórios!');
            return;
        }
        addClient({
            ...newClient,
            status: 'ACTIVE'
        });
        setIsModalOpen(false);
        setNewClient({ name: '', email: '', phone: '', instagram: '' });
        alert('Cliente adicionado com sucesso!');
    };

    return (
        <div className="space-y-6 animate-premium-fade w-full overflow-x-hidden pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="w-full lg:w-auto">
                    <h3 className="text-xl font-black text-white uppercase border-l-4 border-gold-polished pl-4">CRM de Clientes</h3>
                    <p className="text-[11px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Base de Dados & Fidelização</p>
                </div>

                <div className="flex flex-col sm:flex-row flex-1 gap-3 w-full max-w-2xl">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white outline-none focus:border-gold-polished/40 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-black uppercase text-secondary-text outline-none focus:border-gold-polished/40 transition-all flex-1 min-w-[120px]"
                        >
                            <option value="ALL">TODOS</option>
                            <option value="ACTIVE">ATIVOS</option>
                            <option value="VIP">VIP</option>
                            <option value="RISK">RISCO</option>
                        </select>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-3 bg-gold-polished text-black text-[11px] font-black uppercase rounded hover:bg-white transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <UserPlus className="w-4 h-4" /> Novo
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredClients.map((client) => (
                    <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="p-4 premium-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group bg-[#0D0D0D] border-white/5 hover:border-gold-polished/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4 w-full min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gold-polished/10 flex items-center justify-center text-gold-polished border border-gold-polished/20 flex-shrink-0">
                                <UserCircle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-base font-bold text-white group-hover:text-gold-polished transition-colors truncate">{client.name}</h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${client.status === 'VIP' ? 'text-gold-polished' :
                                        client.status === 'RISK' ? 'text-rose-500' : 'text-zinc-600'
                                        }`}>
                                        {client.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-700 font-bold uppercase">{'//'}</span>
                                    <span className="text-[10px] text-zinc-500 font-black tracking-widest">{client.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0 invisible sm:visible group-hover:visible">
                            <div className="text-left sm:text-right">
                                <p className="text-sm font-black text-white italic">R$ {client.totalSpent.toLocaleString('pt-BR')}</p>
                                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-tighter">Lifetime Value</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-gold-polished transition-all" />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Deseja apagar este cliente?')) {
                                            deleteClient(client.id);
                                        }
                                    }}
                                    className="p-2 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/10"
                                    title="Apagar Cliente"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {filteredClients.length === 0 && (
                <div className="text-center py-20 opacity-40">
                    <UserCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                        {searchTerm || statusFilter !== 'ALL' ? 'Nenhum cliente encontrado nos filtros' : 'Nenhum cliente na base de dados'}
                    </p>
                </div>
            )}

            {/* NEW CLIENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
                                <UserCircle className="w-6 h-6 text-gold-polished" /> Novo Registro
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5 ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Ana Paula Miranda"
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-base text-white focus:border-gold-polished transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5 ml-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        value={newClient.phone}
                                        onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5 ml-1">Instagram</label>
                                    <input
                                        type="text"
                                        placeholder="@usuario"
                                        value={newClient.instagram}
                                        onChange={e => setNewClient({ ...newClient, instagram: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5 ml-1">E-mail (Opcional)</label>
                                <input
                                    type="email"
                                    placeholder="ana@email.com"
                                    value={newClient.email}
                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={handleAddClient}
                                className="btn-premium w-full py-4 mt-6 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 group"
                            >
                                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Finalizar Cadastro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
