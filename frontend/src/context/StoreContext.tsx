'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- TYPES ---

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    instagram?: string;
    status: 'ACTIVE' | 'VIP' | 'RISK' | 'INACTIVE';
    totalSpent: number;
    createdAt: string;
}

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    artist: string;
    service: string;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FINISHED' | 'WAITING_DEPOSIT';
    value: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
    status: 'OK' | 'LOW' | 'CRITICAL';
}

export interface Budget {
    id: string;
    title: string;
    clientName: string;
    clientId?: string;
    value: number;
    status: 'NEW' | 'ANALYZING' | 'PAID' | 'READY';
    source: string;
    description: string;
    images?: string[];
    date: string;
}

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    category: string;
    clientName?: string;
    artistId?: string;
    description: string;
    paymentMethod: string;
}

export interface PortfolioItem {
    id: string;
    title: string;
    artist: string;
    views: number;
    likes: number;
    date: string;
    imageUrl?: string;
    isVisible: boolean;
}

export interface ConsentTerm {
    id: string;
    name: string;
    version: string;
    signedCount: number;
}

export interface ConsentPrintRecord {
    id: string;
    termId: string;
    termName: string;
    termVersion: string;
    clientId: string;
    clientName: string;
    createdAt: string; // ISO
}

export interface AnamnesisPrintRecord {
    id: string;
    clientId: string;
    clientName: string;
    createdAt: string; // ISO
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Administrador' | 'Artista' | 'Suporte';
    status: 'Ativo' | 'Inativo';
    appointmentsCount: number;
    commission: number; // Percentage
    permissions: {
        agenda: boolean;
        financeiro: boolean;
        clientes: boolean;
        estoque: boolean;
        configuracoes: boolean;
    };
}

interface StoreState {
    clients: Client[];
    appointments: Appointment[];
    inventory: InventoryItem[];
    budgets: Budget[];
    transactions: Transaction[];
    team: TeamMember[];
    portfolio: PortfolioItem[];
    consentTerms: ConsentTerm[];
    consentPrintHistory: ConsentPrintRecord[];
    anamnesisPrintHistory: AnamnesisPrintRecord[];
    studioName: string;
    studioEmail: string;
    studioPhone: string;
    studioCnpj: string;
    studioLogo: string;
    accentColor: string;
    notificationSettings: {
        email: boolean;
        push: boolean;
    };
    smtpSettings: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
    currentUserId: string;
    tenantId: string;
}

interface StoreContextType extends StoreState {
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalSpent'>) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addAppointment: (app: Omit<Appointment, 'id'>) => void;
    updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
    deleteAppointment: (id: string) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
    updateInventory: (id: string, amount: number) => void;
    deleteInventoryItem: (id: string) => void;
    addBudget: (budget: Omit<Budget, 'id' | 'date'>) => void;
    moveBudget: (budgetId: string, newStatus: Budget['status']) => void;
    updateBudgetValue: (id: string, value: number) => void;
    deleteBudget: (id: string) => void;
    addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
    deleteTransaction: (id: string) => void;
    addTeamMember: (member: Omit<TeamMember, 'id' | 'appointmentsCount' | 'permissions'>) => void;
    deleteTeamMember: (id: string) => void;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
    addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'views' | 'likes' | 'date' | 'isVisible'>) => void;
    deletePortfolioItem: (id: string) => void;
    updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => void;
    togglePortfolioLike: (id: string) => void;
    addConsentTerm: (term: Omit<ConsentTerm, 'id' | 'signedCount'>) => void;
    deleteConsentTerm: (id: string) => void;
    updateConsentTerm: (id: string, updates: Partial<ConsentTerm>) => void;
    recordConsentPrint: (input: { termName: string; termVersion: string; clientId: string }) => void;
    recordAnamnesisPrint: (clientId: string) => void;
    updateStudioName: (name: string) => void;
    updateStudioInfo: (info: Partial<StoreState>) => void;
    updateSmtpSettings: (settings: StoreState['smtpSettings']) => Promise<void>;
    setCurrentUser: (id: string) => void;
}

// --- INITIAL MOCK DATA ---

const INITIAL_STATE: StoreState = {
    clients: [],
    appointments: [],
    inventory: [],
    budgets: [],
    transactions: [],
    team: [
        {
            id: 'admin-1',
            name: 'Administrador',
            email: 'admin@inkflow.com.br',
            role: 'Administrador',
            status: 'Ativo',
            appointmentsCount: 0,
            commission: 0,
            permissions: {
                agenda: true,
                financeiro: true,
                clientes: true,
                estoque: true,
                configuracoes: true
            }
        },
    ],
    portfolio: [],
    consentTerms: [],
    consentPrintHistory: [],
    anamnesisPrintHistory: [],
    studioName: 'Estúdio Ink',
    studioEmail: 'admin@inkflow.com.br',
    studioPhone: '(11) 99999-9999',
    studioCnpj: '00.000.000/0001-00',
    studioLogo: '/logo.png',
    accentColor: '#FFD700',
    notificationSettings: {
        email: true,
        push: false
    },
    smtpSettings: {
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: ''
    },
    currentUserId: 'admin-1',
    tenantId: '123' // Mock default
};

// --- CONTEXT ---

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<StoreState>(INITIAL_STATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Persistence Hook
    useEffect(() => {
        const savedStore = localStorage.getItem('inkflow_store');
        if (savedStore) {
            try {
                const parsed = JSON.parse(savedStore);

                // DATA MIGRATION: Ensure all team members have permissions
                if (parsed.team) {
                    parsed.team = parsed.team.map((m: any) => ({
                        ...m,
                        permissions: m.permissions || (
                            m.role === 'Administrador'
                                ? { agenda: true, financeiro: true, clientes: true, estoque: true, configuracoes: true }
                                : { agenda: true, financeiro: false, clientes: true, estoque: false, configuracoes: false }
                        )
                    }));
                }

                // DATA MIGRATION: Ensure new arrays exist
                if (!parsed.consentTerms) parsed.consentTerms = [];
                if (!parsed.consentPrintHistory) parsed.consentPrintHistory = [];
                if (!parsed.anamnesisPrintHistory) parsed.anamnesisPrintHistory = [];

                // Merge with INITIAL_STATE to ensure new properties like 'currentUserId' exist
                setState({ ...INITIAL_STATE, ...parsed });
            } catch (e) {
                console.error("Failed to load store", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('inkflow_store', JSON.stringify(state));
        }
    }, [state, isLoaded]);

    // --- ACTIONS ---

    const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'totalSpent'>) => {
        const newClient: Client = {
            ...client,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            totalSpent: 0
        };
        setState(prev => ({ ...prev, clients: [newClient, ...prev.clients] }));
    };

    const updateClient = (id: string, updates: Partial<Client>) => {
        setState(prev => ({
            ...prev,
            clients: prev.clients.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    };

    const deleteClient = (id: string) => {
        setState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
    };

    const addAppointment = async (app: Omit<Appointment, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newApp: Appointment = { ...app, id };
        setState(prev => ({ ...prev, appointments: [newApp, ...prev.appointments] }));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...app,
                    tenantId: state.tenantId,
                    userId: state.currentUserId
                })
            });
        } catch (error) {
            console.error("Failed to sync appointment with backend", error);
        }
    };

    const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
        setState(prev => ({
            ...prev,
            appointments: prev.appointments.map(app => app.id === id ? { ...app, status } : app)
        }));
    };

    const deleteAppointment = (id: string) => {
        setState(prev => ({ ...prev, appointments: prev.appointments.filter(a => a.id !== id) }));
    };

    const updateInventory = (id: string, amount: number) => {
        setState(prev => ({
            ...prev,
            inventory: prev.inventory.map(item => {
                if (item.id === id) {
                    const newStock = Math.max(0, item.stock + amount);
                    let newStatus: InventoryItem['status'] = 'OK';
                    if (newStock <= item.minStock / 2) newStatus = 'CRITICAL';
                    else if (newStock <= item.minStock) newStatus = 'LOW';
                    return { ...item, stock: newStock, status: newStatus };
                }
                return item;
            })
        }));
    };

    const addBudget = async (budget: Omit<Budget, 'id' | 'date'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newBudget: Budget = {
            ...budget,
            id,
            date: 'Agora'
        };
        setState(prev => ({ ...prev, budgets: [newBudget, ...prev.budgets] }));

        try {
            // Find client email if possible
            const client = state.clients.find(c => c.id === budget.clientId);

            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/budgets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...budget,
                    tenantId: state.tenantId,
                    clientEmail: client?.email
                })
            });
        } catch (error) {
            console.error("Failed to sync budget with backend", error);
        }
    };

    const moveBudget = (budgetId: string, newStatus: Budget['status']) => {
        setState(prev => ({
            ...prev,
            budgets: prev.budgets.map(b => b.id === budgetId ? { ...b, status: newStatus } : b)
        }));
    };

    const updateBudgetValue = (id: string, value: number) => {
        setState(prev => ({
            ...prev,
            budgets: prev.budgets.map(b => b.id === id ? { ...b, value } : b)
        }));
    };

    const deleteBudget = (id: string) => {
        setState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
    };

    const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
        const newTx: Transaction = {
            ...tx,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    };

    const deleteTransaction = (id: string) => {
        setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    };

    const addTeamMember = (member: Omit<TeamMember, 'id' | 'appointmentsCount' | 'permissions'>) => {
        const newMember: TeamMember = {
            ...member,
            id: Math.random().toString(36).substr(2, 9),
            appointmentsCount: 0,
            permissions: member.role === 'Administrador'
                ? { agenda: true, financeiro: true, clientes: true, estoque: true, configuracoes: true }
                : { agenda: true, financeiro: false, clientes: true, estoque: false, configuracoes: false }
        };
        setState(prev => ({ ...prev, team: [newMember, ...prev.team] }));
    };

    const deleteTeamMember = (id: string) => {
        setState(prev => ({ ...prev, team: prev.team.filter(m => m.id !== id) }));
    };

    const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
        setState(prev => ({
            ...prev,
            team: prev.team.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
    };

    const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'status'>) => {
        const newItem: InventoryItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            status: item.stock <= item.minStock / 2 ? 'CRITICAL' : item.stock <= item.minStock ? 'LOW' : 'OK'
        };
        setState(prev => ({ ...prev, inventory: [newItem, ...prev.inventory] }));
    };

    const deleteInventoryItem = (id: string) => {
        setState(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
    };

    const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'views' | 'likes' | 'date' | 'isVisible'>) => {
        const newItem: PortfolioItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            views: 0,
            likes: 0,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            isVisible: true
        };
        setState(prev => ({ ...prev, portfolio: [newItem, ...prev.portfolio] }));
    };

    const deletePortfolioItem = (id: string) => {
        setState(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== id) }));
    };

    const updatePortfolioItem = (id: string, updates: Partial<PortfolioItem>) => {
        setState(prev => ({
            ...prev,
            portfolio: prev.portfolio.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    const togglePortfolioLike = (id: string) => {
        setState(prev => ({
            ...prev,
            portfolio: prev.portfolio.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)
        }));
    };

    const addConsentTerm = (term: Omit<ConsentTerm, 'id' | 'signedCount'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setState(prev => ({
            ...prev,
            consentTerms: [...prev.consentTerms, { ...term, id, signedCount: 0 }]
        }));
    };

    const deleteConsentTerm = (id: string) => {
        setState(prev => ({
            ...prev,
            consentTerms: prev.consentTerms.filter(t => t.id !== id)
        }));
    };

    const updateConsentTerm = (id: string, updates: Partial<ConsentTerm>) => {
        setState(prev => ({
            ...prev,
            consentTerms: prev.consentTerms.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    };

    const recordConsentPrint = (input: { termName: string; termVersion: string; clientId: string }) => {
        setState(prev => {
            const client = prev.clients.find(c => c.id === input.clientId);
            if (!client) return prev;

            const existingTerm = prev.consentTerms.find(t => t.name === input.termName && t.version === input.termVersion);
            const termId = existingTerm?.id ?? Math.random().toString(36).substr(2, 9);
            const nextTerms = existingTerm
                ? prev.consentTerms.map(t => t.id === termId ? { ...t, signedCount: (t.signedCount ?? 0) + 1 } : t)
                : [...prev.consentTerms, { id: termId, name: input.termName, version: input.termVersion, signedCount: 1 }];

            const record: ConsentPrintRecord = {
                id: Math.random().toString(36).substr(2, 9),
                termId,
                termName: input.termName,
                termVersion: input.termVersion,
                clientId: client.id,
                clientName: client.name,
                createdAt: new Date().toISOString(),
            };

            return {
                ...prev,
                consentTerms: nextTerms,
                consentPrintHistory: [record, ...prev.consentPrintHistory],
            };
        });
    };

    const recordAnamnesisPrint = (clientId: string) => {
        setState(prev => {
            const client = prev.clients.find(c => c.id === clientId);
            if (!client) return prev;
            const record: AnamnesisPrintRecord = {
                id: Math.random().toString(36).substr(2, 9),
                clientId: client.id,
                clientName: client.name,
                createdAt: new Date().toISOString(),
            };
            return {
                ...prev,
                anamnesisPrintHistory: [record, ...prev.anamnesisPrintHistory],
            };
        });
    };

    const updateStudioName = (name: string) => {
        setState(prev => ({ ...prev, studioName: name }));
    };

    const updateStudioInfo = (info: Partial<StoreState>) => {
        setState(prev => ({
            ...prev,
            ...info
        }));
    };

    const updateSmtpSettings = async (settings: StoreState['smtpSettings']) => {
        setState(prev => ({ ...prev, smtpSettings: settings }));

        // In a real app, you would call the API here
        // For this demo/local storage version, the useEffect persistence handles it
        // But I'll add the API call structure for clarity
        try {
            const tenantId = '123'; // Mock tenant ID
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenants/${tenantId}/smtp`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
        } catch (error) {
            console.error("Failed to save SMTP settings to backend", error);
        }
    };

    const setCurrentUser = (id: string) => {
        setState(prev => ({ ...prev, currentUserId: id }));
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` :
            "255 215 0"; // Fallback to gold
    };

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const rgb = hexToRgb(state.accentColor);
            document.documentElement.style.setProperty('--accent-primary-rgb', rgb);
            document.documentElement.style.setProperty('--accent-primary', state.accentColor);

            // For components using older rgba variables
            document.documentElement.style.setProperty('--accent-secondary', `rgba(${rgb}, 0.2)`);
        }
    }, [state.accentColor]);

    return (
        <StoreContext.Provider value={{
            ...state,
            addClient,
            updateClient,
            deleteClient,
            addAppointment,
            addInventoryItem,
            updateInventory,
            deleteInventoryItem,
            addBudget,
            moveBudget,
            addTransaction,
            deleteTransaction,
            addTeamMember,
            deleteTeamMember,
            updateTeamMember,
            addPortfolioItem,
            deletePortfolioItem,
            updatePortfolioItem,
            togglePortfolioLike,
            addConsentTerm,
            deleteConsentTerm,
            updateConsentTerm,
            recordConsentPrint,
            recordAnamnesisPrint,
            updateAppointmentStatus,
            deleteAppointment,
            updateBudgetValue,
            deleteBudget,
            updateStudioName,
            updateStudioInfo,
            updateSmtpSettings,
            setCurrentUser
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
}
