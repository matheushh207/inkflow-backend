'use client';

import {
    Settings,
    ShieldCheck,
    Bell,
    Users,
    CreditCard,
    Globe,
    Mail,
    Camera,
    Save,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    X,
    Calendar,
    DollarSign,
    MessageSquare,
    Package,
    Key,
    Link as LinkIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import ImageUpload from '@/components/ImageUpload';

export default function SettingsPage() {
    const {
        studioName,
        studioEmail,
        studioPhone,
        studioCnpj,
        studioLogo,
        notificationSettings,
        updateStudioInfo,
        team
    } = useStore();

    const [activeTab, setActiveTab] = useState('Geral');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'Artista' });

    // Local state for all settings
    const [localSettings, setLocalSettings] = useState({
        studioName,
        studioEmail,
        studioCnpj,
        studioPhone,
        studioLogo,
        notifications: { ...notificationSettings }
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPasswords: false,
        twoFactor: true
    });

    useEffect(() => {
        setLocalSettings({
            studioName,
            studioEmail,
            studioCnpj,
            studioPhone,
            studioLogo,
            notifications: { ...notificationSettings }
        });
    }, [studioName, studioEmail, studioCnpj, studioPhone, studioLogo, notificationSettings]);

    const handleSave = () => {
        setIsSaving(true);
        updateStudioInfo({
            studioName: localSettings.studioName,
            studioEmail: localSettings.studioEmail,
            studioCnpj: localSettings.studioCnpj,
            studioPhone: localSettings.studioPhone,
            studioLogo: localSettings.studioLogo,
            notificationSettings: localSettings.notifications
        });

        setTimeout(() => {
            setIsSaving(false);
            alert('Configurações salvas com sucesso!');
        }, 500);
    };

    const handleCopyLink = () => {
        const link = `https://inkflowcrm.onrender.com/reserva`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateMember = (id: string, updates: Partial<any>) => {
        updateStudioInfo({
            team: team.map(m => m.id === id ? { ...m, ...updates } : m)
        });
        // Update selectedMember state if it's the one being edited
        if (selectedMember?.id === id) {
            setSelectedMember((prev: any) => ({ ...prev, ...updates }));
        }
    };

    const togglePermission = (memberId: string, permissionKey: string) => {
        const member = team.find(m => m.id === memberId);
        if (!member) return;

        updateMember(memberId, {
            permissions: {
                ...member.permissions,
                [permissionKey]: !member.permissions[permissionKey as keyof typeof member.permissions]
            }
        });
    };

    const handleInvite = () => {
        if (!inviteData.name || !inviteData.email) return alert('Preecha todos os campos!');
        // Simulated invitation
        alert(`Convite enviado para ${inviteData.email}! Senha temporária: inkflow123`);
        setIsInviteModalOpen(false);
        setInviteData({ name: '', email: '', role: 'Artista' });
    };

    const TABS = [
        { icon: Settings, label: 'Geral' },
        { icon: Users, label: 'Equipe' },
        { icon: Bell, label: 'Notificações' },
        { icon: Lock, label: 'Segurança' },
        { icon: Globe, label: 'White Label' },
    ];


    return (
        <div className="space-y-6 md:space-y-8 animate-premium-fade w-full overflow-x-hidden">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Configurações</h1>
                    <p className="text-secondary-text text-base font-medium">Gerencie a identidade e as preferências do seu estúdio.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-premium flex items-center gap-2 font-black text-sm uppercase tracking-widest disabled:opacity-50"
                >
                    {isSaving ? <Settings className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SETTINGS NAV */}
                <div className="lg:col-span-1 space-y-1">
                    {TABS.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.label
                                ? 'bg-gold-polished text-black shadow-[0_10px_20px_var(--accent-secondary)] translate-x-1'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50 hover:translate-x-1'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 transition-transform ${activeTab === item.label ? 'scale-110' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* SETTINGS CONTENT */}
                <div className="lg:col-span-3 space-y-8">
                    {activeTab === 'Geral' && (
                        <div className="space-y-8">
                            {/* PROFILE SECTION */}
                            <div className="premium-card">
                                <h3 className="text-lg font-bold text-white uppercase mb-8 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-gold-polished" /> Identidade Visual
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                                    <div className="md:col-span-4 space-y-4">
                                        <div className="flex flex-col items-center">
                                            <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-4 w-full text-left ml-1">Logo do Estúdio</p>
                                            <div className="w-full aspect-square max-w-[200px] relative group">
                                                <ImageUpload
                                                    value={localSettings.studioLogo ? [localSettings.studioLogo] : []}
                                                    onImagesChange={(imgs) => setLocalSettings({ ...localSettings, studioLogo: imgs[0] || '' })}
                                                    maxFiles={1}
                                                    label="Trocar Logo"
                                                />
                                            </div>
                                            <p className="text-[11px] text-zinc-600 mt-4 text-center italic">Recomendado: 512x512px (PNG ou JPG)</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-secondary-text uppercase tracking-widest ml-1">Nome do Estúdio</label>
                                            <input
                                                type="text"
                                                value={localSettings.studioName}
                                                onChange={(e) => setLocalSettings({ ...localSettings, studioName: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-base text-white focus:border-gold-polished transition-all outline-none"
                                                placeholder="Nome comercial do estúdio"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-secondary-text uppercase tracking-widest ml-1">Identificação / CNPJ</label>
                                            <input
                                                type="text"
                                                value={localSettings.studioCnpj}
                                                onChange={(e) => setLocalSettings({ ...localSettings, studioCnpj: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-base text-white focus:border-gold-polished transition-all outline-none"
                                                placeholder="00.000.000/0001-00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-secondary-text uppercase tracking-widest ml-1">WhatsApp Comercial</label>
                                            <input
                                                type="text"
                                                value={localSettings.studioPhone}
                                                onChange={(e) => setLocalSettings({ ...localSettings, studioPhone: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-base text-white focus:border-gold-polished transition-all outline-none"
                                                placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-secondary-text uppercase tracking-widest ml-1">E-mail para Contato</label>
                                            <input
                                                type="email"
                                                value={localSettings.studioEmail}
                                                onChange={(e) => setLocalSettings({ ...localSettings, studioEmail: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-base text-white focus:border-gold-polished transition-all outline-none"
                                                placeholder="contato@estudio.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'Equipe' && (
                        <div className="premium-card space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase mb-1">Membros da Equipe</h3>
                                    <p className="text-zinc-500 text-sm italic">Gerencie permissões e artistas do estúdio.</p>
                                </div>
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="btn-premium py-2 px-4 text-[11px]"
                                >
                                    Convidar Membro
                                </button>
                            </div>

                            <div className="space-y-4">
                                {team.map((member) => (
                                    <div key={member.id} className="flex justify-between items-center p-4 bg-black rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-black text-white uppercase">
                                                {member.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{member.name}</p>
                                                <p className="text-[12px] text-zinc-500 font-medium">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => updateMember(member.id, { role: e.target.value })}
                                                    className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-black text-gold-polished uppercase tracking-widest outline-none focus:border-gold-polished/50 transition-all cursor-pointer"
                                                >
                                                    <option value="Administrador">Administrador</option>
                                                    <option value="Artista">Artista</option>
                                                    <option value="Suporte">Suporte</option>
                                                </select>
                                                <p className="text-[12px] text-zinc-600 font-medium uppercase mt-1">{member.status}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setIsPermissionsModalOpen(true);
                                                }}
                                                className="p-2 text-zinc-700 hover:text-gold-polished transition-colors bg-zinc-900/50 rounded-lg border border-white/5"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Notificações' && (
                        <div className="premium-card space-y-8">
                            <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gold-polished" /> Preferências de Alerta
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'whatsapp', label: 'Alertas via WhatsApp', desc: 'Resumos diários e confirmações de orçamento.' },
                                    { key: 'email', label: 'E-mails Administrativos', desc: 'Relatórios financeiros e avisos de sistema.' },
                                    { key: 'push', label: 'Notificações Push', desc: 'Alertas em tempo real no dashboard.' },
                                ].map((item) => (
                                    <div key={item.key} className="flex justify-between items-center p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-base font-bold text-white">{item.label}</p>
                                            <p className="text-[12px] text-zinc-500 uppercase tracking-widest mt-1">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalSettings({
                                                ...localSettings,
                                                notifications: {
                                                    ...localSettings.notifications,
                                                    [item.key]: !localSettings.notifications[item.key as keyof typeof localSettings.notifications]
                                                }
                                            })}
                                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${localSettings.notifications[item.key as keyof typeof localSettings.notifications] ? 'bg-gold-polished' : 'bg-zinc-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${localSettings.notifications[item.key as keyof typeof localSettings.notifications] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Segurança' && (
                        <div className="space-y-6">
                            <div className="premium-card">
                                <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2 mb-8">
                                    <Lock className="w-5 h-5 text-rose-500" /> Alterar Senha
                                </h3>
                                <div className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-secondary-text uppercase tracking-widest">Senha Atual</label>
                                        <div className="relative">
                                            <input
                                                type={security.showPasswords ? 'text' : 'password'}
                                                value={security.currentPassword}
                                                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-sm text-white focus:border-rose-500 outline-none pr-12"
                                            />
                                            <button
                                                onClick={() => setSecurity({ ...security, showPasswords: !security.showPasswords })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-500"
                                            >
                                                {security.showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-secondary-text uppercase tracking-widest">Nova Senha</label>
                                        <input
                                            type={security.showPasswords ? 'text' : 'password'}
                                            value={security.newPassword}
                                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-premium-border rounded-xl p-4 text-sm text-white focus:border-rose-500 outline-none"
                                        />
                                    </div>
                                    <button className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                        Redefinir Senha
                                    </button>
                                </div>
                            </div>

                            <div className="premium-card border-blue-500/20 bg-blue-500/5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-blue-500" /> Duplo Fator (2FA)
                                        </h3>
                                        <p className="text-zinc-500 text-xs italic">Aumente a proteção alpha da sua conta.</p>
                                    </div>
                                    <button
                                        onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${security.twoFactor ? 'bg-blue-500' : 'bg-zinc-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${security.twoFactor ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'White Label' && (
                        <div className="premium-card bg-gold-polished/5 border-gold-polished/20">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-gold-polished" /> Personalização Total
                                    </h3>
                                    <p className="text-zinc-500 text-sm italic">Sua marca, sua regra. Nada de links externos.</p>
                                </div>
                                <span className="px-3 py-1 bg-gold-polished text-black text-[12px] font-black rounded-full uppercase">Ativo</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[12px] font-black text-zinc-600 uppercase tracking-widest">Link Público de Reserva</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black border border-white/5 rounded-xl p-3 text-[13px] text-zinc-500 font-mono flex items-center overflow-hidden">
                                            <span className="truncate">https://inkflowcrm.onrender.com/reserva</span>
                                        </div>
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-900 border border-white/5 text-white hover:bg-zinc-800'}`}
                                        >
                                            {copied ? <CheckCircle2 className="w-3 h-3" /> : null}
                                            {copied ? 'Copiado' : 'Copiar'}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[12px] font-black text-zinc-600 uppercase tracking-widest">Favicon do Navegador</p>
                                    <button className="w-full flex items-center  justify-between p-3 bg-black border border-white/5 rounded-xl text-xs font-black text-zinc-500 uppercase">
                                        <span>Usar logo atual</span>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: PERMISSÕES */}
            {isPermissionsModalOpen && selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPermissionsModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden bg-[#0D0D0D]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">Editar Membro</h3>
                                <p className="text-[12px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Configurações de acesso e perfil</p>
                            </div>
                            <button onClick={() => setIsPermissionsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gold-polished uppercase tracking-widest ml-1">Nome</label>
                                    <input
                                        type="text"
                                        value={selectedMember.name}
                                        onChange={(e) => updateMember(selectedMember.id, { name: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-polished outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gold-polished uppercase tracking-widest ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={selectedMember.email}
                                        onChange={(e) => updateMember(selectedMember.id, { email: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-polished outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-6">
                                <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-4 ml-1">Módulos Disponíveis</p>
                                <div className="space-y-3">
                                    {[
                                        { key: 'agenda', label: 'Agenda & Reservas', icon: Calendar },
                                        { key: 'financeiro', label: 'Fluxo de Caixa', icon: DollarSign },
                                        { key: 'clientes', label: 'Base de Clientes', icon: Users },
                                        { key: 'estoque', label: 'Gestão de Estoque', icon: Package },
                                        { key: 'chat', label: 'Chat & WhatsApp', icon: MessageSquare },
                                        { key: 'configuracoes', label: 'Configurações Master', icon: Settings },
                                    ].map((perm) => (
                                        <div key={perm.key} className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-xl border border-white/5 group hover:border-gold-polished/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-black rounded-lg border border-white/5">
                                                    <perm.icon className="w-4 h-4 text-zinc-500 group-hover:text-gold-polished transition-colors" />
                                                </div>
                                                <span className="text-xs font-bold text-white uppercase tracking-tight">{perm.label}</span>
                                            </div>
                                            <button
                                                onClick={() => togglePermission(selectedMember.id, perm.key)}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${selectedMember.permissions?.[perm.key] ? 'bg-gold-polished' : 'bg-zinc-800'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all duration-300 ${selectedMember.permissions?.[perm.key] ? 'left-5.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => setIsPermissionsModalOpen(false)}
                                    className="w-full py-4 bg-gold-polished text-black text-[12px] font-black uppercase rounded-xl hover:bg-white transition-all shadow-[0_10px_20px_var(--accent-secondary)]"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONVIDAR MEMBRO */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
                    <div className="premium-card w-full max-w-md relative z-10 border-gold-polished/20 animate-premium-pop overflow-hidden bg-[#0D0D0D]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase italic">Convidar para Equipe</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-secondary-text">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={inviteData.name}
                                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                    className="w-full bg-black border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished outline-none"
                                    placeholder="Ex: Carlos Oliveira"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest ml-1">E-mail de Acesso</label>
                                <input
                                    type="email"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    className="w-full bg-black border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished outline-none"
                                    placeholder="email@artist.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-gold-polished uppercase tracking-widest ml-1">Cargo Inicial</label>
                                <select
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                    className="w-full bg-black border border-premium-border rounded-xl p-4 text-sm text-white focus:border-gold-polished outline-none"
                                >
                                    <option value="Artista">Artista</option>
                                    <option value="Suporte">Recepcionista / Suporte</option>
                                    <option value="Administrador">Cogerente</option>
                                </select>
                            </div>

                            <div className="p-4 bg-zinc-900/50 rounded-xl border border-dashed border-white/10">
                                <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed">
                                    Ao enviar, o sistema gerará uma senha temporária em conformidade com as permissões padrão do cargo selecionado.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleInvite}
                                    className="w-full py-4 bg-gold-polished text-black text-[12px] font-black uppercase rounded-xl hover:bg-white transition-all shadow-[0_10px_20px_var(--accent-secondary)] flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" /> Enviar Convite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
