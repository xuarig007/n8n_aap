import { 
    ICredentialDataDecryptedObject,
    ILoadOptionsFunctions,
    INodePropertyOptions,
    NodeOperationError,
    type IExecuteFunctions, 
    type IHttpRequestOptions, 
    type INodeExecutionData, 
    type INodeType, 
    type INodeTypeDescription
} from 'n8n-workflow';

export class AnsibleAutomationPlatform implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
        displayName: 'AAP Redhat',
        name: 'ansibleAutomationPlatform',
        icon: 'file:AnsibleAutomationPlatform_logo.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Make actions with AAP API',
        defaults: {
            name: 'Ansible Automation Platform',
        },
        usableAsTool: true,
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'ansibleAutomationPlatformApi',
                required: true,
            },
        ],
        requestDefaults: {
            baseURL: '',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
		properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Model',
                        value: 'model',
                    },
                    {
                        name: 'Job',
                        value: 'job',
                    },
                ],
                default: 'model',
            },
            // Operations will go here
            {
                displayName: 'Operation',
                name: 'operation', 
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: [
                            'model',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Launch',
                        value: 'launch_model',
                        action: 'Launch a model'
                    },
                ],
                default: 'launch_model',
            },
            // Operations will go here
            {
                displayName: 'Model Name or ID',
                name: 'model', 
                type: 'options',
			    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['model'],
                        operation: ['launch_model']
                    },
                },
                // On remplace les options statiques par la méthode dynamique
                typeOptions: {
                    loadOptionsMethod: 'getJobTemplates',
                },
                /*options: [
                    {
                        name: 'o_n1.p_redhat_patching',
                        value: '47',
                        action: 'o_n1.p_redhat_patching'
                    },
                ],
                */
                default: '',
            },
            // Paramètre pour coller le JSON
            {
                displayName: 'Extravars Au Format JSON',
                name: 'jsonBody',
                type: 'json',
                default: '{}',
                description: 'Le JSON qui sera posté directement à l\'API',
                displayOptions: {
                    show: {
                        resource: ['model'],
                        operation: ['launch_model']
                    },
                }
            }        
    ]
	};

    

    methods = {
    loadOptions: {
        async getJobTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
            const returnData: INodePropertyOptions[] = [];
            const credentials: ICredentialDataDecryptedObject = await this.getCredentials<ICredentialDataDecryptedObject>('ansibleAutomationPlatformApi');
            const url = `${credentials?.domain}/api/controller/v2/job_templates`;
            try {

                const options : IHttpRequestOptions = {
                    method: 'GET',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                };

                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this, 
                    'ansibleAutomationPlatformApi', // For example: pipedriveApi
                    options,
                );

                // On boucle sur les résultats de AAP (généralement dans "results")
                for (const template of response.results) {
                    returnData.push({
                        name: template.name,      // Ce qui sera affiché (ex: "RedHat Patching")
                        value: template.id.toString(), // La valeur technique (ex: "47")
                    });
                }
            } catch (error) {
                // On utilise NodeOperationError pour que n8n l'affiche correctement dans l'UI
                throw new NodeOperationError(
                    this.getNode(), 
                    error as Error,
                    { message: `Error listing models for url: ${url} - ${error.message || 'An unknown error occurred'}` }
                );
            }

            return returnData;
        },
    },
};


    async getCredentialsAAP(this: IExecuteFunctions) {
        const credentials: ICredentialDataDecryptedObject = await this.getCredentials('ansibleAutomationPlatformApi');
        if (!credentials) {
            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
        }
        return credentials;
    }

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		//const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		//const returnAll = false;
        //let responseData;
        const credentials: ICredentialDataDecryptedObject = await this.getCredentials<ICredentialDataDecryptedObject>('ansibleAutomationPlatformApi');
        const base_url = `${credentials?.domain}/api/controller/v2/job_templates`;
        
        const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

        if (resource === 'model' && operation === 'launch_model') {
            const modelId = this.getNodeParameter('model', 0);
            const jsonBody = this.getNodeParameter('jsonBody', 0);
            const url = `${base_url}/job_templates/${modelId}/launch/`; // Remplace par l'endpoint de lancement de job réel de ton API

            try {

                const options : IHttpRequestOptions = {
                    method: 'POST',
                    url: url,
                    body: jsonBody,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                };

                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this, 
                    'ansibleAutomationPlatformApi', // For example: pipedriveApi
                    options,
                );

                returnData.push({
                    json: response,
                });
            } catch (error) {
                // On utilise NodeOperationError pour que n8n l'affiche correctement dans l'UI
                throw new NodeOperationError(
                    this.getNode(), 
                    error as Error,
                    { message: `Error launching model for url: ${url} - ${error.message || 'An unknown error occurred'}` }
                );
            }
        }

        return [returnData];

    }
   
}