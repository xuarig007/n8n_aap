import {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
    Icon,
} from 'n8n-workflow';

export class AnsibleAutomationPlatformApi implements ICredentialType {
    name = 'ansibleAutomationPlatformApi';
    // Standardize with the class name
    displayName = 'Ansible Automation Platform API'; 
    
    // Use simplified icons if the specific files are missing
    icon: Icon = { light: 'file:../icons/redhat_aap.light.svg', dark: 'file:../icons/redhat_aap.dark.svg' };

    documentationUrl = 'https://github.com/xuarig007/n8n_aap/blob/master/README.md';

    properties: INodeProperties[] = [
        {
            displayName: 'Username',
            // Must match the key used in the authenticate property
            name: 'username', 
            type: 'string',
            default: '',
        },
        {
            displayName: 'Password',
            // Must match the key used in the authenticate property
            name: 'password', 
            type: 'string',
            typeOptions: { password: true },
            default: '',
        },
        {
            displayName: 'Domain',
            name: 'domain',
            type: 'string',
            default: '',
            hint: 'AAP domain',
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
            // Replace with the actual test URL of your API
            baseURL: '={{$credentials.domain}}',
            url: '/api/controller/v2',
            method: 'GET',
        },
    };
}