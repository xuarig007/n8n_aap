import {
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
	Icon,
} from 'n8n-workflow';

export class AnsibleAutomationPlatformTokenApi implements ICredentialType {
    name = 'ansibleAutomationPlatformTokenApi';
    displayName = 'Ansible Automation Platform Token API'; // Harmonisé avec le nom de la classe
    // Suppression de l'icon complexe pour simplifier si le fichier n'est pas présent
    icon: Icon = { light: 'file:../icons/github.svg', dark: 'file:../icons/github.dark.svg' };

    documentationUrl = 'https://example.com/docs/auth';

    properties: INodeProperties[] = [
		{
            displayName: 'Token',
            name: 'token', // Doit correspondre à la clé dans authenticate
            type: 'string',
            default: '',
			typeOptions: { password: true },
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

    test: ICredentialTestRequest = {
        request: {
            // Remplace par l'URL de test réelle de ton API
            baseURL: 'https://aap-aap.apps.cluster-gptcr-2.dynamic.redhatworkshops.io', 
            url: '/api/controller/v2',
            method: 'GET',
            headers: {
                Authorization: 'Bearer {{$credentials.token}}',
            }
        },
    };
}