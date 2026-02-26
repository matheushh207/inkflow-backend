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
        <div className="space-y-6 animate-premium-fade w-full overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-black text-white uppercase border-l-4 border-gold-polished pl-4 w-full md:w-auto">CRM de Clientes</h3>

                <div className="flex flex-1 gap-3 w-full max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou celular..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-gold-polished/40 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-[12px] font-black uppercase text-secondary-text outline-none focus:border-gold-polished/40 transition-all"
                    >
                        <option value="ALL">TODOS</option>
                        <option value="ACTIVE">ATIVOS</option>
                        <option value="VIP">VIP</option>
                        <option value="RISK">RISCO</option>
                        <option value="INACTIVE">INATIVOS</option>
                    </select>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-3 bg-gold-polished text-black text-[12px] font-black uppercase rounded hover:bg-white transition-all flex items-center gap-2 whitespace-nowrap"
                >
                    <UserPlus className="w-4 h-4" /> Novo Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredClients.map((client) => (
                    <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="p-4 premium-card flex justify-between items-center group bg-[#0D0D0D] border-white/5 hover:border-gold-polished/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold-polished/10 flex items-center justify-center text-gold-polished border border-gold-polished/20">
                                <UserCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white group-hover:text-gold-polished transition-colors">{client.name}</h4>
                                <span className={`text-[12px] font-black uppercase tracking-widest ${client.status === 'VIP' ? 'text-gold-polished' :
                                    client.status === 'RISK' ? 'text-rose-500' : 'text-zinc-600'
                                    }`}>
                                    {client.status} {' // '} {client.phone}
                                </span>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div>
                                <p className="text-sm font-black text-white">R$ {client.totalSpent.toLocaleString('pt-BR')}</p>
                                <p className="text-[12px] text-zinc-500 uppercase font-bold">Lifetime Value</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover:text-gold-polished transition-all" />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm('Deseja apagar este cliente?')) {
                                        deleteClient(client.id);
                                    }
                                }}
                                className="p-2 text-zinc-800 hover:text-rose-500 transition-all"
                                title="Apagar Cliente"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
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
