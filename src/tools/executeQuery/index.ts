import { QueryResponse, QueryRequest, executeQuerySchema } from "./types";

export const executeQueryHandler = async ({ 
    query, 
    params = [] 
}: QueryRequest, 
extra: any,
apiKey: string | undefined
) => {
    if (!apiKey) {
        return {
            content: [{ 
                type: "text" as const, 
                text: "❌ Improvado API key is not configured. Please go through the authorization process again." 
            }],
        };
    }
    
    try {
        const response = await fetch('https://improvado.fyi/api/gpt/query', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                params
            })
        });
        
        if (!response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json() as QueryResponse;
                    throw new Error(`API returned an error: ${errorData.error || response.statusText}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(`API returned an error: ${errorText || response.statusText}`);
                }
            } catch (parseError) {
                throw new Error(`API returned an error (${response.status}): ${response.statusText}`);
            }
        }
        
        try {
            const result = await response.json() as QueryResponse;
            
            return {
                content: [{ 
                    type: "text" as const, 
                    text: `Query result:\n${JSON.stringify(result.data, null, 2)}` 
                }],
            };
        } catch (parseError) {
            throw new Error(`Failed to parse API response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error executing query:", error);
        return {
            content: [{ 
                type: "text" as const, 
                text: `❌ Error executing query: ${error instanceof Error ? error.message : "Unknown error"}` 
            }],
        };
    }
};

export { executeQuerySchema }; 