'use client';

import {
    Plus,
    Search,
    MoreHorizontal,
    Calendar,
    ExternalLink,
    Filter,
    FilterX,
    X,
    CheckCircle2,
    Trash2,
    ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

const COLUMNS = [
    { title: 'Novo Lead', status: 'NEW', color: 'border-blue-500' },
    { title: 'Análise Interna', status: 'ANALYZING', color: 'border-amber-500' },
    { title: 'Sinal Confirmado', status: 'PAID', color: 'border-gold-polished' },
    { title: 'Pronto p/ Agendar', status: 'READY', color: 'border-emerald-500' },
];

export default function BudgetsPage() {
    const { budgets, moveBudget, addBudget, clients, updateBudgetValue, deleteBudget } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<any>(null);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
    const [newBudget, setNewBudget] = useState({
        title: '',
        clientName: '',
        value: 0,
        source: 'Instagram',
        description: ''
    });

    const filteredBudgets = budgets.filter(b => {
        if (filter === 'ALL') return true;
        if (filter === 'APPROVED') return b.status === 'READY' || b.status === 'PAID';
        return b.status === 'NEW' || b.status === 'ANALYZING';
    });

    const handleAddBudget = () => {
        if (!newBudget.title || !newBudget.clientName) {
            alert('Título e Cliente são obrigatórios!');
            return;
        }
        addBudget({
            ...newBudget,
            status: 'NEW'
        });
        setIsModalOpen(false);
        setNewBudget({ title: '', clientName: '', value: 0, source: 'Instagram', description: '' });
        alert('Orçamento registrado com sucesso!');
    };

    const handleMove = (id: string, status: any) => {
        moveBudget(id, status);
    };

    return (
        <div className="space-y-6 animate-premium-fade pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div>
                    <h3 className="text-xl font-black uppercase border-l-4 border-gold-polished pl-4">Projetos & Orçamentos</h3>
                    <p className="text-[12px] text-zinc-500 font-bold uppercase mt-1">Gestão de Funil de Vendas</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar scrollbar-hide">
                        {[
                            { label: 'Todos', val: 'ALL' },
                            { label: 'Pendentes', val: 'PENDING' },
                            { label: 'Aprovados', val: 'APPROVED' }
                        ].map(f => (
                            <span
                                key={f.val}
                                onClick={() => setFilter(f.val as any)}
                                className={`text-[10px] font-black px-3 py-1.5 border rounded uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap ${filter === f.val ? 'bg-gold-polished text-black border-gold-polished' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-gold-polished'}`}
                            >
                                {f.label}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-gold-polished text-black text-[12px] font-black uppercase rounded hover:bg-white transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Novo Orçamento
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {filteredBudgets.map((budget) => (
                    <div key={budget.id} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-gold-polished/20 transition-all">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-base font-bold text-white group-hover:text-gold-polished transition-colors uppercase tracking-tight truncate">{budget.title}</h4>
                                <p className="text-[11px] text-zinc-500 font-bold uppercase truncate">{budget.clientName} {'//'} {budget.source}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0 ${budget.status === 'READY' || budget.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gold-polished/10 text-gold-polished'}`}>
                                {budget.status}
                            </span>
                        </div>
                        <div className="flex flex-row justify-between items-center pt-2 border-t border-white/5 gap-2">
                            <span className="text-xs font-black text-white whitespace-nowrap">R$ {budget.value.toLocaleString('pt-BR')}</span>
                            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                                {budget.status !== 'READY' && budget.status !== 'PAID' && (
                                    <button
                                        onClick={() => handleMove(budget.id, 'READY')}
                                        className="text-[10px] font-black text-emerald-500 hover:text-white uppercase tracking-widest transition-all whitespace-nowrap"
                                    >
                                        Aprovar
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedBudget(budget);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    className="text-[10px] font-black text-gold-polished hover:text-white uppercase tracking-widest transition-all whitespace-nowrap"
                                >
                                    Detalhes
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Deseja excluir este orçamento?')) {
                                            deleteBudget(budget.id);
                                        }
                                    }}
                                    className="text-[10px] font-black text-rose-500 hover:text-white uppercase tracking-widest transition-all p-1"
                                    title="Excluir Orçamento"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {budgets.length === 0 && (
                <div className="text-center py-20 opacity-30">
                    <ClipboardList className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Nenhum orçamento em análise</p>
                </div>
            )}

            {/* MODAL MOCK */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase italic">Novo Orçamento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Selecionar Cliente / Lead</label>
                                <select
                                    value={newBudget.clientName}
                                    onChange={e => setNewBudget({ ...newBudget, clientName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Título do Trabalho</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Full Sleeve Blackwork"
                                    value={newBudget.title}
                                    onChange={e => setNewBudget({ ...newBudget, title: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Descrição/Detalhes</label>
                                <textarea
                                    placeholder="Descreva a ideia, tamanho, local do corpo..."
                                    value={newBudget.description}
                                    onChange={e => setNewBudget({ ...newBudget, description: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Valor Estimado</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newBudget.value}
                                        onChange={e => setNewBudget({ ...newBudget, value: Number(e.target.value) })}
                                        className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Origem</label>
                                    <select
                                        value={newBudget.source}
                                        onChange={e => setNewBudget({ ...newBudget, source: e.target.value })}
                                        className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                    >
                                        <option>Instagram</option>
                                        <option>WhatsApp</option>
                                        <option>Indicação</option>
                                        <option>Site</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleAddBudget}
                                className="btn-premium w-full py-4 mt-4 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Criar Orçamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* DETAILS MODAL */}
            {isDetailsModalOpen && selectedBudget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
                    <div className="premium-card w-full max-w-lg relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden bg-[#0D0D0D]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase italic">Detalhes do Orçamento</h3>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[12px] font-black text-gold-polished uppercase tracking-widest mb-1">Título do Projeto</p>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">{selectedBudget.title}</h4>
                                </div>
                                <span className={`px-4 py-1.5 text-[11px] font-black rounded-full uppercase tracking-widest border ${selectedBudget.status === 'READY' || selectedBudget.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gold-polished/10 text-gold-polished border-gold-polished/20'
                                    }`}>
                                    {selectedBudget.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Cliente</p>
                                    <p className="text-sm font-bold text-white italic">{selectedBudget.clientName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Origem</p>
                                    <p className="text-sm font-bold text-white italic">{selectedBudget.source}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Valor Estimado</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-gold-polished">R$</span>
                                        <input
                                            type="number"
                                            value={selectedBudget.value}
                                            onChange={(e) => {
                                                const newVal = Number(e.target.value);
                                                setSelectedBudget({ ...selectedBudget, value: newVal });
                                                updateBudgetValue(selectedBudget.id, newVal);
                                            }}
                                            className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-1 text-lg font-black text-gold-polished w-full max-w-[140px] outline-none focus:border-gold-polished transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Data de Criação</p>
                                    <p className="text-sm font-bold text-white">{selectedBudget.date}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Descrição e Observações</p>
                                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 min-h-[100px] text-zinc-300 text-sm leading-relaxed">
                                    {selectedBudget.description || "Nenhuma observação detalhada para este orçamento."}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2">
                                {selectedBudget.status !== 'READY' && selectedBudget.status !== 'PAID' && (
                                    <button
                                        onClick={() => {
                                            handleMove(selectedBudget.id, 'READY');
                                            setIsDetailsModalOpen(false);
                                        }}
                                        className="flex-1 py-4 bg-emerald-600 text-white text-[12px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 order-1 sm:order-none"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Aprovar Orçamento
                                    </button>
                                )}
                                <div className="flex gap-3 flex-1 order-2 sm:order-none">
                                    <button
                                        onClick={() => setIsDetailsModalOpen(false)}
                                        className="flex-1 py-4 bg-zinc-800 text-white text-[12px] font-black uppercase rounded-xl hover:bg-zinc-700 transition-all"
                                    >
                                        Fechar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Deseja excluir este orçamento?')) {
                                                deleteBudget(selectedBudget.id);
                                                setIsDetailsModalOpen(false);
                                            }
                                        }}
                                        className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                        title="Excluir Orçamento"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
