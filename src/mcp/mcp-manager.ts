import { spawn, ChildProcess } from 'child_process';
import { Logger } from '../utils/logger.js';

interface MCPTool {
    name: string;
    description: string;
}

export class MCPManager {
    private logger = new Logger('mcp-manager');
    private process?: ChildProcess;
    private tools: MCPTool[] = [];
    private enabled: boolean;
    
    constructor() {
        this.enabled = process.env.MCP_ENABLED !== 'false';
    }
    
    async initialize() {
        if (!this.enabled) {
            this.logger.info('MCP disabled');
            return;
        }
        
        try {
            // Start n8n-mcp server
            this.process = spawn('npx', ['-y', 'n8n-mcp'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            this.process.on('error', (error) => {
                this.logger.error('MCP process error', error);
            });
            
            // Mock tools for now
            this.tools = [
                { name: 'workflow_execute', description: 'Execute n8n workflow' },
                { name: 'workflow_list', description: 'List n8n workflows' }
            ];
            
            this.logger.info('MCP initialized');
        } catch (error) {
            this.logger.warn('MCP initialization failed', error);
        }
    }
    
    async listTools() {
        return this.tools;
    }
    
    async executeTool(name: string, args: any) {
        this.logger.info(`Executing tool: ${name}`);
        
        return {
            success: true,
            tool: name,
            result: { message: 'Tool executed (mock implementation)' }
        };
    }
    
    getStatus() {
        return {
            enabled: this.enabled,
            running: !!this.process,
            tools: this.tools.length
        };
    }
    
    async shutdown() {
        if (this.process) {
            this.process.kill();
            this.logger.info('MCP shutdown');
        }
    }
}
