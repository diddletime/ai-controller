import chalk from 'chalk';

async function test() {
    const baseUrl = 'http://localhost:3100';
    
    console.log(chalk.cyan.bold('\n🧪 Testing AI Controller\n'));
    
    const tests = [
        { name: 'Health Check', url: '/health' },
        { name: 'Status', url: '/status' },
        { name: 'List Endpoints', url: '/list' },
        { name: 'MCP Tools', url: '/api/mcp/tools' }
    ];
    
    for (const test of tests) {
        try {
            const res = await fetch(baseUrl + test.url);
            const data = await res.json();
            console.log(chalk.green('✓'), test.name);
            console.log(chalk.dim('  ' + JSON.stringify(data).substring(0, 80) + '...\n'));
        } catch (error) {
            console.log(chalk.red('✗'), test.name);
            console.log(chalk.dim('  Error: ' + error + '\n'));
        }
    }
}

test().catch(console.error);
