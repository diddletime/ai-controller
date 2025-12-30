# 🤖 AI Controller v3.0

Complete AI → MCP → n8n Integration Pipeline

## Quick Start
```bash
npm install
npm run setup
npm start
```

## Commands
- `npm start` - Start server
- `npm run setup` - Interactive configuration
- `npm run monitor` - Live monitoring dashboard
- `npm test` - Test endpoints

## Endpoints
- `GET /health` - Health check
- `GET /status` - Detailed status
- `GET /list` - List all endpoints
- `POST /api/chat` - Chat with AI

## n8n Integration
Custom node installed at `~/.n8n/custom/ai-controller`
Restart n8n to load the node.
