import { executeQuerySchema, executeQueryHandler } from './executeQuery';

export const tools = {
    executeQuery: {
        schema: executeQuerySchema,
        handler: executeQueryHandler
    }
};

export * from './executeQuery'; 