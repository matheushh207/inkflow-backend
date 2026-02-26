'use client';

import {
    MessageSquare,
    Smartphone,
    Settings2,
    Clock,
    Zap,
    Send,
    ShieldCheck,
    Search,
    Smartphone as SmartphoneIcon
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { io, Socket } from 'socket.io-client';

// determine WebSocket URL, with sensible fallbacks and a warning
const WS_URL =
    (process.env.NEXT_PUBLIC_WS_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'))
        .replace(/\/$/, '');

export default function ChatPage() {
    const { clients, appointments, studioName } = useStore();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'INITIALIZING' | 'AWAITING_SCAN' | 'AUTHENTICATED' | 'READY' | 'DISCONNECTED'>('INITIALIZING');
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [automations, setAutomations] = useState([
        { id: '24h', name: 'Lembrete 24h', desc: 'Confirmado?', icon: Clock, on: true },
        { id: 'post', name: 'Pós-Tattoo 15d', desc: 'Cuidado extra', icon: ShieldCheck, on: true },
    ]);

    useEffect(() => {
        socketRef.current = io(WS_URL, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => console.log('Socket connected'));
        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connect error', err);
            setConnectionStatus('DISCONNECTED');
        });
        socketRef.current.on('qr', (qr: string) => {
            setQrCode(qr);
            setConnectionStatus('AWAITING_SCAN');
        });
        socketRef.current.on('status', (status: any) => {
            setConnectionStatus(status);
            if (status === 'READY') setQrCode(null);
        });
        socketRef.current.on('message', (message: any) => {
            setMessages(prev => {
                const isDup = prev.some(m => m.id === message.id);
                if (isDup) return prev;
                return [...prev, message];
            });
        });

        return () => { socketRef.current?.disconnect(); };
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    useEffect(() => {
        if (!selectedClient || !socketRef.current || connectionStatus !== 'READY') return;

        // Limpar mensagens ao trocar de cliente
        setMessages([]);

        const phone = selectedClient.phone.replace(/\D/g, '');
        socketRef.current.emit('get-chat-history', { phone }, (history: any[]) => {
            if (history) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newOnes = history.filter(h => !existingIds.has(h.id));
                    return [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
                });
            }
        });
    }, [selectedClientId, connectionStatus]);

    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Função robusta para comparar números do Brasil (DDD + Últimos 8 dígitos)
    const matchPhone = (msgPhone: string, clientPhone: string) => {
        const cleanMsg = msgPhone.replace(/\D/g, '');
        const cleanClient = clientPhone.replace(/\D/g, '');

        // Se um deles for muito curto, não combina
        if (cleanMsg.length < 8 || cleanClient.length < 8) return false;

        // Pegamos os últimos 8 dígitos e os 2 anteriores (DDD)
        // Isso ignora o prefixo 55 e o nono dígito (9)
        const getCanonical = (p: string) => p.slice(-10); // DDD + 8 dígitos
        const getCanonicalFallback = (p: string) => p.slice(-8); // Apenas 8 últimos caso DDD falhe

        const canMsg = getCanonical(cleanMsg);
        const canClient = getCanonical(cleanClient);

        if (canMsg === canClient) return true;

        // Se ainda não bater, tenta só os últimos 8 (mais arriscado mas resolve casos de DDD diferente gravado errado)
        return cleanMsg.slice(-8) === cleanClient.slice(-8);
    };

    const clientMessages = messages.filter(m => {
        if (!selectedClient) return false;

        // Se a mensagem é MINHA, ela deve ter sido enviada PARA o telefone do cliente
        if (m.fromMe || m.from === 'me') {
            return matchPhone(m.to || '', selectedClient.phone);
        }

        // Se a mensagem é DO CLIENTE, o REMETENTE deve ser o telefone do cliente
        return matchPhone(m.from || '', selectedClient.phone);
    });

    useEffect(() => {
        scrollToBottom();
    }, [clientMessages]);

    const generateQr = () => socketRef.current?.emit('generate-qr');

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedClient || !socketRef.current) return;

        const phone = selectedClient.phone.replace(/\D/g, '');
        const phoneWith55 = phone.startsWith('55') ? phone : `55${phone}`;

        const msgData = {
            to: phoneWith55,
            body: newMessage
        };

        socketRef.current.emit('send-message', msgData);
        setMessages(prev => [...prev, {
            fromMe: true,
            body: newMessage,
            timestamp: Date.now(),
            from: 'me',
            to: phoneWith55
        }]);
        setNewMessage('');
    };

    const triggerAutomation = (type: string) => {
        if (!selectedClient || !socketRef.current) return;

        socketRef.current.emit('trigger-automation', {
            type,
            clientId: selectedClient.id,
            clientPhone: selectedClient.phone,
            clientName: selectedClient.name,
            studioName: studioName
        });

        alert(`Solicitação processada: ${type === '24h' ? 'Lembrete 24h' : 'Pós-Tattoo'} para ${selectedClient.name}`);
    };

    return (
        <div className="w-full h-auto md:h-[calc(100vh-120px)] flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden premium-card p-0 bg-[#0A0A0A] border-white/5 shadow-2xl relative">
            {/* SIDEBAR: CONVERSATIONS */}
            <aside className={cn(
                "w-full md:w-80 border-white/5 flex flex-col bg-[#0D0D0D]",
                selectedClient ? "hidden md:flex md:border-r" : "flex md:border-r"
            )}>
                <div className="p-4 border-b border-white/5 bg-[#111111]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Conversas</h2>
                        <div className={`px-2 py-0.5 rounded text-[12px] font-black uppercase ${connectionStatus === 'READY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {connectionStatus}
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/5 rounded-xl py-3 pl-9 pr-4 text-[13px] text-white focus:outline-none focus:border-gold-polished/30 transition-all font-bold uppercase"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredClients.map(client => {
                        const isSelected = selectedClientId === client.id;
                        const lastMsg = messages.filter(m => m.from.includes(client.phone.replace(/\D/g, ''))).pop();

                        return (
                            <button
                                key={client.id}
                                onClick={() => setSelectedClientId(client.id)}
                                className={cn(
                                    "w-full p-4 flex items-center gap-3 border-b border-white/[0.02] transition-all hover:bg-white/[0.02]",
                                    isSelected ? "bg-gold-polished/5 border-l-2 border-l-gold-polished" : ""
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 font-black text-xs">
                                    {client.name[0]}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[14px] font-black text-white uppercase tracking-tighter">{client.name}</span>
                                        <span className="text-[12px] text-zinc-600 font-bold">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                    <p className="text-[13px] text-zinc-500 font-medium truncate w-48 uppercase">
                                        {lastMsg ? lastMsg.body : client.phone}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* MAIN CONTENT: CHAT AREA */}
            <main className="flex-1 flex flex-col bg-[#080808] relative">
                {selectedClient ? (
                    <>
                        {/* CHAT HEADER */}
                        <header className="p-4 border-b border-white/5 bg-[#0D0D0D] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedClientId(null)}
                                    className="md:hidden p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-all"
                                    title="Voltar"
                                >
                                    ←
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gold-polished/10 border border-gold-polished/20 flex items-center justify-center text-gold-polished font-black uppercase tracking-widest text-xs">
                                    {selectedClient.name.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-tighter">{selectedClient.name}</h3>
                                    <span className="text-[13px] text-emerald-500 font-bold uppercase tracking-widest">Online via WhatsApp</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => triggerAutomation('24h')}
                                    title="Disparar Lembrete 24h"
                                    className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-gold-polished transition-all"
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => triggerAutomation('post')}
                                    title="Disparar Pós-Tattoo 15d"
                                    className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-gold-polished transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                </button>
                                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                                <Settings2 className="w-4 h-4 text-zinc-600 cursor-pointer" />
                            </div>
                        </header>

                        {/* MESSAGES AREA */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-[#080808]">
                            {/* LOGO BACKGROUND */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.1] z-0 px-20">
                                <img src="/logo.png" alt="" className="w-full max-w-[280px] grayscale invert brightness-200" />
                            </div>

                            <div className="relative z-10">
                                {clientMessages.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {clientMessages.map((msg, i) => (
                                            <div key={i} className={cn("flex flex-col gap-1 max-w-[75%]", msg.fromMe ? "ml-auto items-end" : "items-start")}>
                                                <div className={cn(
                                                    "p-4 rounded-2xl text-[14px] font-medium leading-relaxed font-sans shadow-lg",
                                                    msg.fromMe
                                                        ? "bg-gold-polished text-black rounded-tr-none shadow-gold-polished/5"
                                                        : "bg-[#1A1A1A] text-zinc-300 border border-white/5 rounded-tl-none shadow-black"
                                                )}>
                                                    {msg.body}
                                                </div>
                                                <span className="text-[12px] text-zinc-600 font-bold px-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-20">
                                        <MessageSquare className="w-12 h-12 text-zinc-500 mb-2" />
                                        <p className="text-[13px] uppercase font-black tracking-[0.2em] text-zinc-500">Inicie uma conversa</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* INPUT AREA */}
                        <footer className="p-4 bg-[#0D0D0D] border-t border-white/5">
                            <div className="flex items-center gap-3 max-w-4xl mx-auto">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Digite sua mensagem..."
                                        className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-gold-polished/40 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    className="w-12 h-12 bg-gold-polished text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:scale-105 transition-all active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#050505]">
                        {connectionStatus === 'DISCONNECTED' ? (
                        <div className="space-y-4 max-w-sm text-center">
                            <p className="text-sm font-bold text-rose-500">Erro de conexão ao servidor de chat.</p>
                            <p className="text-xs text-zinc-400">
                                Verifique se a variável de ambiente <code>NEXT_PUBLIC_WS_URL</code> ou <code>NEXT_PUBLIC_API_URL</code> está definida corretamente e se o backend está acessível.
                            </p>
                        </div>
                    ) : connectionStatus !== 'READY' && connectionStatus !== 'AUTHENTICATED' ? (
                            <div className="space-y-8 max-w-sm animate-premium-fade">
                                {qrCode ? (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                            <a href={qrCode} target="_blank" rel="noopener noreferrer">
                                                <img src={qrCode} alt="WhatsApp QR" className="w-56 h-56 mx-auto" />
                                            </a>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Escaneie o QR Code</h2>
                                            <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest leading-relaxed">
                                                Abra o WhatsApp {'>'} Configurações {'>'} Dispositivos Conectados
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="w-24 h-24 rounded-full border-2 border-gold-polished/20 flex items-center justify-center mx-auto border-t-gold-polished animate-spin">
                                            <SmartphoneIcon className="w-10 h-10 text-gold-polished animate-pulse" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Conexão Necessária</h2>
                                            <p className="text-zinc-500 text-sm font-medium">Sincronize seu WhatsApp para liberar as automações de agenciamento e o chat inteligente.</p>
                                            <button
                                                onClick={generateQr}
                                                className="btn-premium w-full flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] py-4"
                                            >
                                                <Zap className="w-4 h-4 fill-current" />Iniciar Protocolo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-sm opacity-40">
                                <div className="w-20 h-20 rounded-full bg-gold-polished/5 border border-gold-polished/10 flex items-center justify-center mx-auto">
                                    <MessageSquare className="w-8 h-8 text-gold-polished" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Selecione uma conversa</h2>
                                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                                        Clique em um contato à esquerda para gerenciar mensagens e disparos automáticos.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>


            <style jsx global>{`
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: var(--accent-secondary); border-radius: 10px; }
                .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: var(--accent-primary); }
            `}</style>
        </div>
    );
}


function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
