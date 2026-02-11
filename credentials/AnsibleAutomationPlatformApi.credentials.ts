import {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
	Icon,
} from 'n8n-workflow';

export class AnsibleAutomationPlatformApi implements ICredentialType {
    name = 'ansibleAutomationPlatformApi';
    displayName = 'Ansible Automation Platform API'; // Harmonisé avec le nom de la classe
    // Suppression de l'icon complexe pour simplifier si le fichier n'est pas présent
    icon: Icon = { light: 'file:../icons/github.svg', dark: 'file:../icons/github.dark.svg' };

    documentationUrl = 'https://example.com/docs/auth';

    properties: INodeProperties[] = [
		{
            displayName: 'Username',
            name: 'username', // Doit correspondre à la clé dans authenticate
            type: 'string',
            default: '',
        },
        {
            displayName: 'Password',
            name: 'password', // Doit correspondre à la clé dans authenticate
            type: 'string',
            typeOptions: { password: true },
            default: '',
        },
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: '',
			hint: 'AAP domain : example https://aap-aap.apps.cluster-gptcr-2.dynamic.redhatworkshops.io/',
			required: true,
		},
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            auth: {
                username: '={{$credentials.username}}',
                password: '={{$credentials.password}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            // Remplace par l'URL de test réelle de ton API
            baseURL: 'https://aap-aap.apps.cluster-gptcr-2.dynamic.redhatworkshops.io', 
            url: '/api/controller/v2',
            method: 'GET',
        },
    };
}