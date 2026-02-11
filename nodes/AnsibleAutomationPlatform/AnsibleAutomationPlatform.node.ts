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
import { 
    getCredentialsAAP,
    getCredentialsAAPType,
} from './GenericFunctions';

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
                displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
            },
            {
                name: 'ansibleAutomationPlatformTokenApi',
                required: true,
                displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth',
						value: 'basicAuth',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
				description: 'Authentication method to use',
			},
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
                default: '',
            },
            // Paramètre pour coller le JSON
            {
                displayName: 'Extra Variables (JSON Format)',
                name: 'jsonBody',
                type: 'json',
                default: '{}',
                description: 'The JSON that will be posted directly to the API',
                displayOptions: {
                    show: {
                        resource: ['model'],
                        operation: ['launch_model']
                    },
                }
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
                            'job',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Get Status',
                        value: 'get_status',
                        action: 'Check the status of a job'
                    },
                ],
                default: 'get_status',
            },
            {
                displayName: 'Job ID',
                name: 'jobId',
                type: 'number',
                default: 0,
                description: 'ID of the job to get status for',
                displayOptions: {
                    show: {
                        resource: ['job'],
                        operation: ['get_status']
                    },
                }
            }

    ]
	};

    

    methods = {
    loadOptions: {
        async getJobTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

            const returnData: INodePropertyOptions[] = [];
            const credentials: ICredentialDataDecryptedObject = await getCredentialsAAP.call(this);
            const domain = (credentials?.domain as string)?.replace(/\/$/, '');
            const url = `${domain}/api/controller/v2/job_templates`;
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
                    getCredentialsAAPType.call(this), // Dynamically determine which credential type to use
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


    

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const returnData: INodeExecutionData[] = [];
        const credentials: ICredentialDataDecryptedObject = await getCredentialsAAP.call(this);
        const domain = (credentials?.domain as string)?.replace(/\/$/, '');

        if (!credentials) {
            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
        }
        
        const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

        if (resource === 'model' && operation === 'launch_model') {
            const modelId = this.getNodeParameter('model', 0);
            const jsonBody = this.getNodeParameter('jsonBody', 0);
            const url = `${domain}/api/controller/v2/job_templates/${modelId}/launch/`; // Remplace par l'endpoint de lancement de job réel de ton API

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
                    getCredentialsAAPType.call(this), // For example: pipedriveApi
                    options,
                );

                returnData.push({
                    json: response,
                    pairedItem: { item: 0 }
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
        if (resource === 'job' && operation === 'get_status') {
            const jobId = this.getNodeParameter('jobId', 0);
            const urlJob = `${domain}/api/controller/v2/jobs/${jobId}`; // Remplace par l'endpoint de lancement de job réel de ton API
            const urlStdout = `${domain}/api/controller/v2/jobs/${jobId}/stdout/?format=json`; // Remplace par l'endpoint de récupération de stdout réel de ton API

            const response = {
                job: null,
                stdout: null,
            };



            try {

                const options : IHttpRequestOptions = {
                    method: 'GET',
                    url: urlJob,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                };

                response.job = await this.helpers.httpRequestWithAuthentication.call(
                    this, 
                    getCredentialsAAPType.call(this),
                    options,
                );

            } catch (error) {
                // On utilise NodeOperationError pour que n8n l'affiche correctement dans l'UI
                throw new NodeOperationError(
                    this.getNode(), 
                    error as Error,
                    { message: `Error getting job status for url: ${urlJob} - ${error.message || 'An unknown error occurred'}` }
                );
            }

            try {
                //on recupere la stdout au format json

                const optionsStdout : IHttpRequestOptions = {
                    method: 'GET',
                    url: urlStdout,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                };

                response.stdout = await this.helpers.httpRequestWithAuthentication.call(
                    this, 
                    getCredentialsAAPType.call(this),
                    optionsStdout,
                );
                
            } catch (error) {
                // On utilise NodeOperationError pour que n8n l'affiche correctement dans l'UI
                throw new NodeOperationError(
                    this.getNode(), 
                    error as Error,
                    { message: `Error getting job stdout for url: ${urlStdout} - ${error.message || 'An unknown error occurred'}` }
                );
            }

            //on renvoie un objet qui contient à la fois le status du job et sa stdout
            
            returnData.push({
                json: response,
                pairedItem: { item: 0 }
            });
            
        }

        return [returnData];

    }
   
}
