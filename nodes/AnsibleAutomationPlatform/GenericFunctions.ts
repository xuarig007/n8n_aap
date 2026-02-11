import { 
    ICredentialDataDecryptedObject,
    ILoadOptionsFunctions,
    NodeOperationError,
    type IExecuteFunctions,
} from 'n8n-workflow';

// Dans votre fichier de fonctions (ex: GenericFunctions.ts)
export async function getCredentialsAAP(
    this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<ICredentialDataDecryptedObject> {
    const authenticationMethod = this.getNodeParameter('authentication', 0) as string;
    
    const credentialType = authenticationMethod === 'basicAuth' 
        ? 'ansibleAutomationPlatformApi' 
        : 'ansibleAutomationPlatformTokenApi';

    const credentials = await this.getCredentials(credentialType);

    if (!credentials) {
        throw new NodeOperationError(this.getNode(), 'No credentials returned!');
    }

    return credentials;
}

export function getCredentialsAAPType(
    this: IExecuteFunctions | ILoadOptionsFunctions,
): string {


    const authenticationMethod = this.getNodeParameter('authentication', 0) as string;

    const credentialType:string = authenticationMethod === 'basicAuth' 
        ? 'ansibleAutomationPlatformApi' 
        : 'ansibleAutomationPlatformTokenApi';

    return credentialType;
}

