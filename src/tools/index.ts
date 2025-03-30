import { executeQuerySchema, executeQueryHandler } from './executeQuery/index';
import { NotionClientWrapper, verifyNotionApiKey } from './notion';

export const tools = {
    executeQuery: {
        schema: executeQuerySchema,
        handler: executeQueryHandler
    },
    notion: {
        client: NotionClientWrapper,
        verify: verifyNotionApiKey
    }
};

export * from './executeQuery/index';
export * from './notion'; 