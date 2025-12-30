import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '../utils/logger.js';

export class AIProvider {
    private logger = new Logger('ai-provider');
    private openrouterClient?: OpenAI;
    private anthropicClient?: Anthropic;
    private openaiClient?: OpenAI;
    private activeProvider: string = 'none';
    
    async initialize() {
        const openrouterKey = process.env.OPENROUTER_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        
        if (openrouterKey) {
            this.openrouterClient = new OpenAI({
                apiKey: openrouterKey,
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': 'https://github.com/ai-controller',
                    'X-Title': 'AI Controller'
                }
            });
            this.activeProvider = 'openrouter';
            this.logger.info('OpenRouter initialized');
        }
        
        if (anthropicKey) {
            this.anthropicClient = new Anthropic({ apiKey: anthropicKey });
            if (this.activeProvider === 'none') this.activeProvider = 'anthropic';
            this.logger.info('Anthropic initialized');
        }
        
        if (openaiKey) {
            this.openaiClient = new OpenAI({ apiKey: openaiKey });
            if (this.activeProvider === 'none') this.activeProvider = 'openai';
            this.logger.info('OpenAI initialized');
        }
        
        if (this.activeProvider === 'none') {
            throw new Error('No AI provider configured. Add API keys to .env');
        }
    }
    
    async chat(message: string, model?: string) {
        try {
            if (this.activeProvider === 'openrouter' && this.openrouterClient) {
                return await this.chatOpenRouter(message, model);
            } else if (this.activeProvider === 'anthropic' && this.anthropicClient) {
                return await this.chatAnthropic(message, model);
            } else if (this.activeProvider === 'openai' && this.openaiClient) {
                return await this.chatOpenAI(message, model);
            }
            throw new Error('No provider available');
        } catch (error: any) {
            this.logger.error('Chat error', error);
            throw error;
        }
    }
    
    private async chatOpenRouter(message: string, model?: string) {
        const response = await this.openrouterClient!.chat.completions.create({
            model: model || 'anthropic/claude-3.5-sonnet',
            messages: [{ role: 'user', content: message }]
        });
        
        return {
            success: true,
            content: response.choices[0].message?.content || '',
            model: response.model,
            provider: 'openrouter',
            usage: response.usage
        };
    }
    
    private async chatAnthropic(message: string, model?: string) {
        const response = await this.anthropicClient!.messages.create({
            model: model || 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content: message }]
        });
        
        const content = response.content[0];
        return {
            success: true,
            content: content.type === 'text' ? content.text : '',
            model: response.model,
            provider: 'anthropic',
            usage: response.usage
        };
    }
    
    private async chatOpenAI(message: string, model?: string) {
        const response = await this.openaiClient!.chat.completions.create({
            model: model || 'gpt-4-turbo',
            messages: [{ role: 'user', content: message }]
        });
        
        return {
            success: true,
            content: response.choices[0].message?.content || '',
            model: response.model,
            provider: 'openai',
            usage: response.usage
        };
    }
    
    getStatus() {
        return {
            active: this.activeProvider,
            providers: {
                openrouter: !!this.openrouterClient,
                anthropic: !!this.anthropicClient,
                openai: !!this.openaiClient
            }
        };
    }
    
    getAvailableModels() {
        const models: any[] = [];
        
        if (this.openrouterClient) {
            models.push(
                { id: 'anthropic/claude-3.5-sonnet', provider: 'openrouter' },
                { id: 'openai/gpt-4-turbo', provider: 'openrouter' }
            );
        }
        
        if (this.anthropicClient) {
            models.push({ id: 'claude-sonnet-4-20250514', provider: 'anthropic' });
        }
        
        if (this.openaiClient) {
            models.push({ id: 'gpt-4-turbo', provider: 'openai' });
        }
        
        return models;
    }
}
