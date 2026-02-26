'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Users,
    DollarSign,
    Package,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    User,
    MessageSquare,
    HeartPulse,
    FileSignature,
    Image as ImageIcon,
    ClipboardList
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', permission: 'any' },
    { icon: Calendar, label: 'Agenda Estudio', href: '/dashboard/agenda', permission: 'agenda' },
    { icon: ClipboardList, label: 'Agendamentos', href: '/dashboard/appointments', permission: 'agenda' },
    { icon: Users, label: 'Clientes CRM', href: '/dashboard/clients', permission: 'clientes' },
    { icon: BarChart3, label: 'Orçamentos', href: '/dashboard/budgets', permission: 'any' }, // budgets generally visible or linked to agenda
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/finance', permission: 'financeiro' },
    { icon: Package, label: 'Estoque', href: '/dashboard/inventory', permission: 'estoque' },
    { icon: User, label: 'Equipe', href: '/dashboard/users', permission: 'configuracoes' },
    { icon: HeartPulse, label: 'Anamnese', href: '/dashboard/anamnesis', permission: 'agenda' },
    { icon: FileSignature, label: 'Consentimento', href: '/dashboard/consent', permission: 'agenda' },
    { icon: ImageIcon, label: 'Portfólio', href: '/dashboard/portfolio', permission: 'any' },
    { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat', permission: 'chat' },
    { icon: Settings, label: 'Configurações', href: '/dashboard/settings', permission: 'configuracoes' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { team, currentUserId, setCurrentUser } = useStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get current user details dynamically
    const currentUser = team.find(m => m.id === currentUserId) || team[0];

    const handleLogout = () => {
        router.push('/login');
    };

    const filteredMenu = MENU_ITEMS.filter(item => {
        if (item.permission === 'any') return true;
        if (!currentUser || !currentUser.permissions) return false;
        const permissionKey = item.permission as keyof typeof currentUser.permissions;
        return currentUser.permissions[permissionKey];
    });

    return (
        <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
            {/* SIDEBAR */}
            <aside className="hidden md:flex w-64 border-r border-premium-border flex-col">
                <div className="p-8 border-b border-premium-border flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="INK FLOW"
                        className="h-28 w-auto logo-alpha object-contain"
                    />
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-scroll">
                    {filteredMenu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", // Increased py from 2.5 to 3
                                    isActive
                                        ? "bg-gold-polished/10 text-gold-polished"
                                        : "text-secondary-text hover:bg-zinc-900 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-gold-polished" : "group-hover:text-gold-polished")} />
                                <span className="text-[13px] font-bold uppercase tracking-widest">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-polished shadow-[0_0_8px_var(--accent-secondary)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-premium-border space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-[13px] font-bold uppercase tracking-widest text-secondary-text hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Encerrar Sessão</span>
                    </button>

                    {/* DEMO ROLE SWITCHER */}
                    <div className="pt-2">
                        <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 px-2">Alterar Perfil (DEMO)</p>
                        <div className="flex flex-col gap-2">
                            {team.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => setCurrentUser(member.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-xl border transition-all text-left",
                                        currentUserId === member.id
                                            ? "bg-gold-polished/10 border-gold-polished/30"
                                            : "bg-black border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black",
                                        currentUserId === member.id ? "bg-gold-polished text-black" : "bg-zinc-900 text-zinc-500"
                                    )}>
                                        {member.name.substring(0, 2)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className={cn("text-[12px] font-bold truncate", currentUserId === member.id ? "text-white" : "text-zinc-500")}>
                                            {member.name}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-tighter truncate font-medium">
                                            {member.role}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden md:overflow-hidden">
                {/* TOP HEADER */}
                <header className="h-16 md:h-20 border-b border-premium-border flex items-center justify-between px-4 md:px-8 bg-[#0A0A0A]/50 backdrop-blur-xl z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg border border-white/5 text-secondary-text hover:text-white hover:bg-zinc-900 transition-all"
                            aria-label="Abrir menu"
                        >
                            ☰
                        </button>
                        <img
                            src="/logo.png"
                            alt="INK FLOW"
                            className="h-10 md:h-12 w-auto logo-alpha object-contain"
                        />
                        <div className="hidden sm:block text-sm md:text-base text-gold-polished uppercase tracking-[0.3em] font-black border-l border-premium-border pl-6">
                            DASHBOARD
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 relative text-secondary-text hover:text-gold-polished transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-gold-polished border-2 border-[#0A0A0A] rounded-full" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-3 md:p-8 scrollbar-hide">
                    {children}
                </div>
            </main>

            {/* MOBILE MENU DRAWER */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[200] md:hidden">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-[#0A0A0A] border-r border-premium-border flex flex-col">
                        <div className="p-5 border-b border-premium-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="INK FLOW" className="h-10 w-auto object-contain" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-gold-polished">Menu</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-lg border border-white/5 text-secondary-text hover:text-white hover:bg-zinc-900 transition-all"
                                aria-label="Fechar menu"
                            >
                                ✕
                            </button>
                        </div>

                        <nav className="flex-1 p-3 space-y-1 overflow-y-auto sidebar-scroll">
                            {filteredMenu.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                            isActive
                                                ? "bg-gold-polished/10 text-gold-polished"
                                                : "text-secondary-text hover:bg-zinc-900 hover:text-white"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-gold-polished" : "group-hover:text-gold-polished")} />
                                        <span className="text-[13px] font-bold uppercase tracking-widest">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-3 border-t border-premium-border space-y-2">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full text-[13px] font-bold uppercase tracking-widest text-secondary-text hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Encerrar Sessão</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
