import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { Logger } from './utils/logger.js';
import { AIProvider } from './providers/ai-provider.js';
import { MCPManager } from './mcp/mcp-manager.js';

config();

const logger = new Logger('main');
const app = express();
const PORT = parseInt(process.env.PORT || '3100', 10);

let aiProvider: AIProvider;
let mcpManager: MCPManager;
let isReady = false;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// ===== HEALTH & STATUS ENDPOINTS =====
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        version: '3.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        ready: isReady
    });
});

app.get('/status', (req: Request, res: Response) => {
    res.json({
        server: {
            status: 'running',
            uptime: process.uptime(),
            port: PORT
        },
        ai: aiProvider?.getStatus() || { status: 'not initialized' },
        mcp: mcpManager?.getStatus() || { status: 'not initialized' },
        ready: isReady
    });
});

app.get('/list', (req: Request, res: Response) => {
    res.json({
        endpoints: [
            { method: 'GET', path: '/health', description: 'Health check' },
            { method: 'GET', path: '/status', description: 'Detailed status' },
            { method: 'GET', path: '/list', description: 'List endpoints' },
            { method: 'POST', path: '/api/chat', description: 'Chat with AI' },
            { method: 'GET', path: '/api/models', description: 'List available models' },
            { method: 'POST', path: '/api/mcp/execute', description: 'Execute MCP tool' },
            { method: 'GET', path: '/api/mcp/tools', description: 'List MCP tools' }
        ]
    });
});

// ===== AI ENDPOINTS =====
app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { message, model } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const response = await aiProvider.chat(message, model);
        res.json(response);
    } catch (error: any) {
        logger.error('Chat error', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/models', (req: Request, res: Response) => {
    res.json({
        models: aiProvider?.getAvailableModels() || []
    });
});

// ===== MCP ENDPOINTS =====
app.get('/api/mcp/tools', async (req: Request, res: Response) => {
    try {
        const tools = await mcpManager.listTools();
        res.json({ tools, count: tools.length });
    } catch (error: any) {
        logger.error('List tools error', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/mcp/execute', async (req: Request, res: Response) => {
    try {
        const { tool, args } = req.body;
        
        if (!tool) {
            return res.status(400).json({ error: 'Tool name is required' });
        }
        
        const result = await mcpManager.executeTool(tool, args || {});
        res.json(result);
    } catch (error: any) {
        logger.error('Execute tool error', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== INITIALIZATION =====
async function initialize() {
    try {
        logger.info('Starting AI Controller v3.0...');
        
        // Initialize AI Provider
        aiProvider = new AIProvider();
        await aiProvider.initialize();
        logger.info('✓ AI Provider ready');
        
        // Initialize MCP Manager
        mcpManager = new MCPManager();
        await mcpManager.initialize();
        logger.info('✓ MCP Manager ready');
        
        isReady = true;
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`✓ Server running on http://localhost:${PORT}`);
            logger.info('Available endpoints:');
            logger.info('  GET  /health');
            logger.info('  GET  /status');
            logger.info('  GET  /list');
            logger.info('  POST /api/chat');
            logger.info('  GET  /api/models');
            logger.info('  GET  /api/mcp/tools');
            logger.info('  POST /api/mcp/execute');
        });
        
    } catch (error) {
        logger.error('Failed to initialize', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await mcpManager?.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await mcpManager?.shutdown();
    process.exit(0);
});

initialize();
