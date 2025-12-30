import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AIControllerApi implements ICredentialType {
    name = 'aiControllerApi';
    displayName = 'AI Controller API';
    documentationUrl = 'https://github.com/diddletime/ai-controller';
    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'http://localhost:3100',
            description: 'AI Controller server URL'
        }
    ];
}
