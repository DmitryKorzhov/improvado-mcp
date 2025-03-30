// Environment interface
export interface Env {
	OAUTH_KV: KVNamespace;
}

export interface Props {
	improvadoApiKey?: string;
}

// Re-export tool-specific types
export type { QueryResponse } from './tools/executeQuery/types'; 