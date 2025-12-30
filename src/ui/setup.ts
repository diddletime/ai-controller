import inquirer from 'inquirer';
import { writeFileSync } from 'fs';
import chalk from 'chalk';

interface SetupAnswers {
    provider: string;
    openrouterKey?: string;
    anthropicKey?: string;
    openaiKey?: string;
    port: number;
    enableMcp: boolean;
}

async function setup() {
    console.log(chalk.cyan.bold('\n🤖 AI Controller Setup\n'));
    
    const answers = await inquirer.prompt<SetupAnswers>([
        {
            type: 'list',
            name: 'provider',
            message: 'Select your AI provider:',
            choices: [
                { name: 'OpenRouter (100+ models)', value: 'openrouter' },
                { name: 'Anthropic (Claude)', value: 'anthropic' },
                { name: 'OpenAI (GPT)', value: 'openai' }
            ]
        },
        {
            type: 'password',
            name: 'openrouterKey',
            message: 'OpenRouter API key:',
            when: (ans: SetupAnswers) => ans.provider === 'openrouter'
        },
        {
            type: 'password',
            name: 'anthropicKey',
            message: 'Anthropic API key:',
            when: (ans: SetupAnswers) => ans.provider === 'anthropic'
        },
        {
            type: 'password',
            name: 'openaiKey',
            message: 'OpenAI API key:',
            when: (ans: SetupAnswers) => ans.provider === 'openai'
        },
        {
            type: 'number',
            name: 'port',
            message: 'Server port:',
            default: 3100
        },
        {
            type: 'confirm',
            name: 'enableMcp',
            message: 'Enable MCP (n8n integration)?',
            default: true
        }
    ]);
    
    const env = `# AI Controller Configuration
OPENROUTER_API_KEY=${answers.openrouterKey || ''}
ANTHROPIC_API_KEY=${answers.anthropicKey || ''}
OPENAI_API_KEY=${answers.openaiKey || ''}
PORT=${answers.port}
LOG_LEVEL=info
MCP_ENABLED=${answers.enableMcp}
`;
    
    writeFileSync('.env', env);
    console.log(chalk.green('\n✓ Configuration saved to .env\n'));
    console.log('Next steps:');
    console.log('  npm start      # Start the server');
    console.log('  npm run monitor # Monitor dashboard\n');
}

setup().catch(console.error);
