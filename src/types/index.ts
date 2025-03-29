// Environment interface
export interface Env {
	OAUTH_KV: KVNamespace;
}

// Props interface for values passed from OAuth provider
export interface Props {
	improvadoApiKey?: string;
}

// Define response type for the API
export interface QueryResponse {
	success: boolean;
	data: any;
	error?: string;
} 