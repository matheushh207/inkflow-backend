'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Aprovando seu orçamento...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de confirmação não encontrado.');
            return;
        }

        const confirm = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/confirmations/budget?token=${token}`);
                if (response.ok) {
                    setStatus('success');
                    setMessage('Seu orçamento foi aprovado com sucesso! Em breve entraremos em contato para os próximos passos.');
                } else {
                    setStatus('error');
                    setMessage('Não foi possível aprovar seu orçamento. O link pode ter expirado ou ser inválido.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Ocorreu um erro ao tentar aprovar seu orçamento.');
            }
        };

        confirm();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl text-center">
                <div className="mb-8 flex justify-center">
                    <img src="/logo.png" alt="INK FLOW" className="h-20 w-auto object-contain" />
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-gold-polished animate-spin mx-auto" />
                        <p className="text-zinc-400 font-medium">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                        <h2 className="text-2xl font-bold">Aprovado!</h2>
                        <p className="text-zinc-400">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
                        <h2 className="text-2xl font-bold">Ops!</h2>
                        <p className="text-zinc-400">{message}</p>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">
                        Powered by INK FLOW
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmBudgetPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold-polished animate-spin" />
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}
