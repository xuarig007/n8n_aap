import {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
    Icon,
} from 'n8n-workflow';

export class AnsibleAutomationPlatformTokenApi implements ICredentialType {
    name = 'ansibleAutomationPlatformTokenApi';
    displayName = 'Ansible Automation Platform Token API';
    icon: Icon = { light: 'file:../icons/redhat_aap.light.svg', dark: 'file:../icons/redhat_aap.dark.svg' };
    documentationUrl = 'https://github.com/xuarig007/n8n_aap/blob/master/README.md';

    // This is the missing piece the error was screaming about
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.token}}',
            },
        },
    };

    properties: INodeProperties[] = [
        {
            displayName: 'Domain',
            name: 'domain',
            type: 'string',
            default: '',
            placeholder: 'https://aap.example.com',
            hint: 'The base URL of your AAP instance',
            required: true,
        },
        {
            displayName: 'Token',
            name: 'token',
            type: 'string',
            default: '',
            typeOptions: { password: true },
            required: true,
        },
    ];

    test: ICredentialTestRequest = {
        request: {
            // Using a template literal or the variable directly
            baseURL: '={{$credentials.domain}}', 
            url: '/api/v2/ping/', // A common ping endpoint for AAP/AWX
            method: 'GET',
        },
    };
}