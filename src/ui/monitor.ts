import chalk from 'chalk';

interface HealthResponse {
    status: string;
    uptime: number;
    ready: boolean;
}

interface StatusResponse {
    ai: { active: string };
    mcp: { tools: number };
}

async function monitor() {
    const baseUrl = process.env.API_URL || 'http://localhost:3100';
    
    console.clear();
    console.log(chalk.cyan.bold('🤖 AI Controller Monitor\n'));
    
    async function fetch() {
        try {
            const healthRes = await globalThis.fetch(`${baseUrl}/health`);
            const health = await healthRes.json() as HealthResponse;
            
            const statusRes = await globalThis.fetch(`${baseUrl}/status`);
            const status = await statusRes.json() as StatusResponse;
            
            console.clear();
            console.log(chalk.cyan.bold('🤖 AI Controller Monitor\n'));
            console.log(chalk.green('Status:'), health.status);
            console.log(chalk.green('Uptime:'), Math.floor(health.uptime) + 's');
            console.log(chalk.green('Ready:'), health.ready ? '✓' : '✗');
            console.log(chalk.green('\nAI Provider:'), status.ai.active);
            console.log(chalk.green('MCP Tools:'), status.mcp.tools || 0);
            console.log(chalk.dim('\nPress Ctrl+C to exit'));
            
        } catch (error: any) {
            console.clear();
            console.log(chalk.cyan.bold('🤖 AI Controller Monitor\n'));
            console.log(chalk.red('Status: OFFLINE'));
            console.log(chalk.dim(`\nCannot connect to ${baseUrl}`));
            console.log(chalk.dim('Press Ctrl+C to exit'));
        }
    }
    
    await fetch();
    setInterval(fetch, 2000);
}

monitor().catch(console.error);
