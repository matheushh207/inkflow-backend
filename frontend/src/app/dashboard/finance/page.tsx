'use client';

import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    PieChart,
    Download,
    Calendar,
    Filter,
    Check,
    Plus,
    X,
    CheckCircle2,
    Users,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function FinancePage() {
    const { transactions, addTransaction, deleteTransaction, team } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false); // Added
    const [newTx, setNewTx] = useState({
        type: 'INCOME' as 'INCOME' | 'EXPENSE',
        amount: 0,
        category: 'Procedimento',
        clientName: '',
        artistId: '',
        description: '',
        paymentMethod: 'Pix'
    });

    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;

    const artistSummaries = team.map(artist => {
        const artistTransactions = transactions.filter(t => t.artistId === artist.id && t.type === 'INCOME');
        const total = artistTransactions.reduce((acc, t) => acc + t.amount, 0);
        const artistCut = total * (artist.commission / 100);
        const studioCut = total - artistCut;
        return {
            ...artist,
            total,
            artistCut,
            studioCut
        };
    }).filter(s => s.total > 0);

    const handleAddTx = () => {
        if (newTx.amount <= 0) return alert('Insira um valor válido');
        addTransaction(newTx);
        setIsModalOpen(false);
        setNewTx({ type: 'INCOME', amount: 0, category: 'Procedimento', clientName: '', artistId: '', description: '', paymentMethod: 'Pix' });
    };
    return (
        <div className="space-y-6 animate-premium-fade w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Gestão Financeira</h1>
                    <p className="text-secondary-text text-sm font-medium">Controle de caixa e comissões do estúdio.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-premium flex items-center gap-2 font-black text-[12px] uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" /> Novo Lançamento
                </button>
            </div>
            <div className="text-[12px] font-black px-3 py-2 bg-zinc-900 rounded border border-white/5 uppercase tracking-widest">
                R$ {balance.toLocaleString('pt-BR')} Saldo Total
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 premium-card border-none bg-emerald-500/10 hover:bg-emerald-500/15 transition-all">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Entradas (Fevereiro)</p>
                    <h4 className="text-xl font-black text-white">R$ {income.toLocaleString('pt-BR')}</h4> {/* Modified */}
                </div>
                <div className="p-4 premium-card border-none bg-rose-500/10 hover:bg-rose-500/15 transition-all">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Saídas (Fevereiro)</p>
                    <h4 className="text-xl font-black text-white">R$ {expenses.toLocaleString('pt-BR')}</h4> {/* Modified */}
                </div>
            </div>

            {/* ARTIST BREAKDOWN */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-gold-polished" />
                    <h4 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Apurado por Artista</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {artistSummaries.map((s) => (
                        <div key={s.id} className="p-4 premium-card bg-zinc-900/40 border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white uppercase italic">{s.name}</span>
                                <span className="text-[11px] font-black px-2 py-0.5 bg-gold-polished/10 text-gold-polished rounded border border-gold-polished/20 uppercase">
                                    {s.commission}% Comissão
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Bruto</p>
                                    <p className="text-sm font-black text-white">R$ {s.total.toLocaleString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase font-gold-polished">Artista ({s.commission}%)</p>
                                    <p className="text-sm font-black text-gold-polished font-bold italic">R$ {s.artistCut.toLocaleString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Estúdio</p>
                                    <p className="text-sm font-black text-zinc-400">R$ {s.studioCut.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-[12px] font-black text-gold-polished uppercase tracking-[0.2em] mb-4">Últimas Transações</h4>
                {transactions.length > 0 ? transactions.map((t) => (
                    <div key={t.id} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-gold-polished/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                            <div>
                                <span className="text-sm font-bold text-white group-hover:text-gold-polished transition-colors uppercase tracking-tight">{t.description}</span>
                                <p className="text-[10px] text-zinc-600 font-black uppercase">{t.date} {'//'} {t.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-xs font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                            </span>
                            <button
                                onClick={() => {
                                    if (confirm('Deseja excluir este lançamento?')) {
                                        deleteTransaction(t.id);
                                    }
                                }}
                                className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Excluir Lançamento"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-12 text-center opacity-30 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Nenhuma transação registrada</p>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden">
                        <div className="flex justify-between items-center mb-6 text-white text-xl font-black uppercase italic">
                            <h3>Novo Lançamento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setNewTx({ ...newTx, type: 'INCOME' })}
                                    className={`flex-1 py-3 text-[12px] font-black uppercase rounded-lg transition-all ${newTx.type === 'INCOME' ? 'bg-emerald-500 text-black' : 'text-zinc-500'}`}
                                >
                                    Entrada
                                </button>
                                <button
                                    onClick={() => setNewTx({ ...newTx, type: 'EXPENSE' })}
                                    className={`flex-1 py-3 text-[12px] font-black uppercase rounded-lg transition-all ${newTx.type === 'EXPENSE' ? 'bg-rose-500 text-white' : 'text-zinc-500'}`}
                                >
                                    Saída
                                </button>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Valor (R$)</label>
                                <input
                                    type="number"
                                    value={newTx.amount}
                                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Categoria</label>
                                <select
                                    value={newTx.category}
                                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                >
                                    <option value="Procedimento">Procedimento</option>
                                    <option value="Material">Material</option>
                                    <option value="Aluguel">Aluguel</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Profissional (Artista)</label>
                                <select
                                    value={newTx.artistId}
                                    onChange={(e) => setNewTx({ ...newTx, artistId: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                >
                                    <option value="">Selecione um profissional</option>
                                    {team.filter(m => m.role === 'Artista' || m.role === 'Administrador').map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Cliente (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Nome do cliente"
                                    value={newTx.clientName}
                                    onChange={(e) => setNewTx({ ...newTx, clientName: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest block mb-1.5">Descrição</label>
                                <textarea
                                    value={newTx.description}
                                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                                    className="w-full bg-zinc-900 border border-premium-border rounded-xl p-3 text-sm text-white focus:border-gold-polished transition-all outline-none h-20 resize-none"
                                />
                            </div>
                            <button
                                onClick={handleAddTx}
                                className="btn-premium w-full py-4 mt-4 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Registrar Lançamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
