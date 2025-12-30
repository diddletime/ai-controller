import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class AIController implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'AI Controller',
        name: 'aiController',
        icon: 'file:aicontroller.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Interact with AI Controller',
        defaults: { name: 'AI Controller' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            { name: 'aiControllerApi', required: true }
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'Chat', value: 'chat', action: 'Chat with AI' },
                    { name: 'Health Check', value: 'health', action: 'Check health' }
                ],
                default: 'chat'
            },
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { operation: ['chat'] } },
                description: 'Message to send to AI'
            }
        ]
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const credentials = await this.getCredentials('aiControllerApi');
        const baseUrl = credentials.baseUrl as string;

        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;

            try {
                let response: any;

                if (operation === 'chat') {
                    const message = this.getNodeParameter('message', i) as string;
                    response = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${baseUrl}/api/chat`,
                        body: { message },
                        json: true
                    });
                } else if (operation === 'health') {
                    response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/health`,
                        json: true
                    });
                }

                returnData.push({ json: response });

            } catch (error: any) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error.message);
            }
        }

        return [returnData];
    }
}
