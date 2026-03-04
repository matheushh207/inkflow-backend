import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
    private client: Client;
    private readonly logger = new Logger(WhatsappService.name);
    private qrCode: string | null = null;
    private isInitializing = false;
    private isAuthenticated = false;
    private isReady = false;

    constructor(private readonly gateway: WhatsappGateway) {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'ink-flow-v2',
                dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
            }),
            authTimeoutMs: 120000,
            qrMaxRetries: 20,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--font-render-hinting=none',
                    '--disable-extensions',
                    '--disable-component-update',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ],
            },
        });
    }

    async onModuleDestroy() {
        this.logger.log('Shutting down WhatsApp client...');
        try {
            await this.client.destroy();
            this.logger.log('WhatsApp client destroyed successfully.');
        } catch (err) {
            this.logger.error('Error destroying WhatsApp client:', err);
        }
    }

    onModuleInit() {
        this.logger.log('WhatsappModule onModuleInit starting initial initialize()...');
        this.initialize();
    }

    public async initialize() {
        if (this.isReady || this.isInitializing) {
            this.logger.log('Client is already READY or currently INITIALIZING, skipping.');
            if (this.isReady) this.gateway.sendStatus('READY');
            return;
        }

        this.isInitializing = true;
        this.logger.log('Starting WhatsApp client initialization sequence...');

        // Cleanup any existing instance listeners
        this.client.removeAllListeners('qr');
        this.client.removeAllListeners('ready');
        this.client.removeAllListeners('authenticated');
        this.client.removeAllListeners('auth_failure');
        this.client.removeAllListeners('disconnected');
        this.client.removeAllListeners('message_create');

        this.client.on('qr', async (qr) => {
            this.logger.log('QR Code received, generating image...');
            this.qrCode = await qrcode.toDataURL(qr);
            this.gateway.sendQrCode(this.qrCode);
            this.gateway.sendStatus('AWAITING_SCAN');
        });

        this.client.on('ready', () => {
            this.logger.log('WhatsApp Client is READY!');
            this.isReady = true;
            this.isInitializing = false;
            this.qrCode = null;
            this.gateway.sendStatus('READY');
        });

        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp Client AUTHENTICATED');
            this.isAuthenticated = true;
            this.gateway.sendStatus('AUTHENTICATED');
        });

        this.client.on('auth_failure', (msg) => {
            this.logger.error('WhatsApp Auth failure:', msg);
            this.gateway.sendStatus('AUTH_FAILURE');
            this.resetAndRestart();
        });

        this.client.on('disconnected', async (reason) => {
            this.logger.warn('WhatsApp Client disconnected:', reason);
            this.isReady = false;
            this.isAuthenticated = false;
            this.gateway.sendStatus('DISCONNECTED');
            this.resetAndRestart();
        });

        this.client.on('message_create', (message) => {
            if (!message.from) return;
            this.gateway.sendMessage({
                id: message.id.id,
                from: message.from,
                to: message.to,
                body: message.body,
                timestamp: Date.now(),
                fromMe: message.fromMe
            });
        });

        try {
            await this.client.initialize();
        } catch (err) {
            this.logger.error('Failed to initialize WhatsApp client:', err);
            this.isInitializing = false;
            this.gateway.sendStatus('ERROR');
            this.resetAndRestart();
        }
    }

    private async resetAndRestart() {
        this.logger.log('Attempting to re-initialize WhatsApp in 10 seconds...');
        this.isReady = false;
        this.qrCode = null;

        setTimeout(() => {
            this.initialize();
        }, 10000);
    }

    private async resolveJid(number: string): Promise<string> {
        let cleanNumber = number.replace(/\D/g, '');

        // Ensure 55 prefix for Brazil if missing
        if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('55')) {
            cleanNumber = `55${cleanNumber}`;
        }

        // Try to get the official JID from WhatsApp-Web.js
        try {
            const id = await this.client.getNumberId(cleanNumber);
            if (id) {
                return id._serialized;
            }
        } catch (e) {
            this.logger.warn(`Could not resolve JID for ${cleanNumber}, falling back to manual format`);
        }

        return cleanNumber.includes('@c.us') ? cleanNumber : `${cleanNumber}@c.us`;
    }

    async sendManualMessage(to: string, body: string) {
        if (!this.isReady) {
            this.logger.warn('Attempted to send message while WhatsApp is not ready');
            return { success: false, error: 'WhatsApp not connected' };
        }

        try {
            const jid = await this.resolveJid(to);
            const result = await this.client.sendMessage(jid, body);
            this.logger.log(`Manual message sent to ${jid}`);
            return { success: true, messageId: result.id.id };
        } catch (err) {
            this.logger.error(`Error sending manual message to ${to}:`, err);
            return { success: false, error: err.message };
        }
    }

    async getChatHistory(number: string, limit: number = 50) {
        if (!this.isReady) return [];
        try {
            const jid = await this.resolveJid(number);
            this.logger.log(`Fetching history for ${jid}...`);
            const chat = await this.client.getChatById(jid);
            const messages = await chat.fetchMessages({ limit });
            this.logger.log(`Fetched ${messages.length} messages for ${jid}`);
            return messages.map(m => ({
                id: m.id.id,
                from: m.from,
                to: m.to,
                body: m.body,
                timestamp: m.timestamp * 1000,
                fromMe: m.fromMe
            }));
        } catch (err) {
            this.logger.error(`Error fetching history for ${number}:`, err);
            return [];
        }
    }

    async triggerAutomation(type: string, clientId: string, clientPhone: string, clientName: string, studioName: string) {
        if (!this.isReady) return { success: false, error: 'WhatsApp not connected' };

        const jid = await this.resolveJid(clientPhone);
        let message = '';

        if (type === '24h') {
            message = `Olá ${clientName}! Passando para confirmar seu agendamento de amanhã aqui na ${studioName}. Tudo certo para nos vermos? 🤟`;
        } else if (type === 'post') {
            message = `E aí ${clientName}! Como está a cicatrização da sua nova tattoo? Lembre-se: manter limpo, hidratado e evitar sol/mar/piscina por enquanto. Qualquer dúvida, conta com a gente na ${studioName}! 🛡️✨`;
        } else {
            return { success: false, error: 'Unknown automation type' };
        }

        try {
            const result = await this.client.sendMessage(jid, message);
            this.logger.log(`Automation ${type} sent to ${clientName} (${jid}) using studio ${studioName}`);

            return { success: true, messageId: result.id.id };
        } catch (err) {
            this.logger.error(`Error sending automation ${type} to ${clientName}:`, err);
            return { success: false, error: err.message };
        }
    }

    getQrCode() {
        return this.qrCode;
    }

    getStatus() {
        if (this.isReady) return 'READY';
        if (this.isAuthenticated) return 'AUTHENTICATED';
        if (this.qrCode) return 'AWAITING_SCAN';
        return 'INITIALIZING';
    }
}
