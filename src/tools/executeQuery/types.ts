import { z } from "zod";

export interface QueryResponse {
    success: boolean;
    data: any;
    error?: string;
}

export interface QueryRequest {
    query: string;
    params?: any[];
}

export const executeQuerySchema = {
    query: z.string().describe("SQL query to execute"),
    params: z.array(z.any()).optional().describe("Parameters to substitute in the query (optional)")
}; 