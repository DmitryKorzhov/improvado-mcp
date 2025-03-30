/**
 * Notion API client wrapper
 */
import { convertToMarkdown } from './markdown';
import { 
  NotionResponse,
  BlockResponse,
  PageResponse,
  DatabaseResponse,
  ListResponse,
  UserResponse,
  CommentResponse,
  RichTextItemResponse
} from './types';

/**
 * Verifies and retrieves a Notion API key from Improvado
 * @param improvadoApiKey The Improvado API key to use for verification
 * @returns The verified Notion API key
 */
export async function verifyNotionApiKey(improvadoApiKey: string): Promise<string> {
  if (!improvadoApiKey) {
    throw new Error("Improvado API key is required");
  }
  
  try {
    const response = await fetch('https://improvado.fyi/api/gpt/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${improvadoApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'notion'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Verification failed with status: ${response.status}`);
    }
    
    const result = await response.json() as { apiKey?: string };
    if (!result.apiKey) {
      throw new Error("Notion API key not returned from verification endpoint");
    }
    
    return result.apiKey;
  } catch (error) {
    throw new Error(`Failed to verify Notion API key: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Type definitions for tool arguments
// Blocks
export interface AppendBlockChildrenArgs {
  block_id: string;
  children: Partial<BlockResponse>[];
  after?: string;
  format?: "json" | "markdown";
}

export interface RetrieveBlockArgs {
  block_id: string;
  format?: "json" | "markdown";
}

export interface RetrieveBlockChildrenArgs {
  block_id: string;
  start_cursor?: string;
  page_size?: number;
  format?: "json" | "markdown";
}

export interface DeleteBlockArgs {
  block_id: string;
  format?: "json" | "markdown";
}

// Pages
export interface RetrievePageArgs {
  page_id: string;
  format?: "json" | "markdown";
}

export interface UpdatePagePropertiesArgs {
  page_id: string;
  properties: Record<string, any>;
  format?: "json" | "markdown";
}

// Users
export interface ListAllUsersArgs {
  start_cursor?: string;
  page_size?: number;
  format?: "json" | "markdown";
}

export interface RetrieveUserArgs {
  user_id: string;
  format?: "json" | "markdown";
}

export interface RetrieveBotUserArgs {
  random_string: string;
  format?: "json" | "markdown";
}

// Databases
export interface CreateDatabaseArgs {
  parent: {
    type: string;
    page_id?: string;
    database_id?: string;
    workspace?: boolean;
  };
  title: RichTextItemResponse[];
  properties: Record<string, any>;
  format?: "json" | "markdown";
}

export interface QueryDatabaseArgs {
  database_id: string;
  filter?: Record<string, any>;
  sorts?: Array<{
    property?: string;
    timestamp?: string;
    direction: "ascending" | "descending";
  }>;
  start_cursor?: string;
  page_size?: number;
  format?: "json" | "markdown";
}

export interface RetrieveDatabaseArgs {
  database_id: string;
  format?: "json" | "markdown";
}

export interface UpdateDatabaseArgs {
  database_id: string;
  title?: RichTextItemResponse[];
  description?: RichTextItemResponse[];
  properties?: Record<string, any>;
  format?: "json" | "markdown";
}

export interface CreateDatabaseItemArgs {
  database_id: string;
  properties: Record<string, any>;
  format?: "json" | "markdown";
}

// Comments
export interface CreateCommentArgs {
  parent?: { page_id: string };
  discussion_id?: string;
  rich_text: RichTextItemResponse[];
  format?: "json" | "markdown";
}

export interface RetrieveCommentsArgs {
  block_id: string;
  start_cursor?: string;
  page_size?: number;
  format?: "json" | "markdown";
}

// Search
export interface SearchArgs {
  query?: string;
  filter?: { property: string; value: string };
  sort?: {
    direction: "ascending" | "descending";
    timestamp: "last_edited_time";
  };
  start_cursor?: string;
  page_size?: number;
  format?: "json" | "markdown";
}

export class NotionClientWrapper {
  private notionToken: string;
  private baseUrl: string = "https://api.notion.com/v1";
  private headers: { [key: string]: string };

  /**
   * Create a new NotionClientWrapper
   * @param tokenOrImprovadoApiKey Either a direct Notion API token or an Improvado API key
   * @param isImprovadoKey If true, the first parameter is treated as an Improvado API key and verification is performed
   */
  constructor(tokenOrImprovadoApiKey: string, isImprovadoKey: boolean = false) {
    if (isImprovadoKey) {
      throw new Error("For Improvado API key verification, use the static fromImprovadoApiKey method");
    }
    
    this.notionToken = tokenOrImprovadoApiKey;
    this.headers = {
      Authorization: `Bearer ${this.notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };
  }

  /**
   * Create a new NotionClientWrapper using an Improvado API key
   * @param improvadoApiKey The Improvado API key to use for verification
   * @returns A new NotionClientWrapper instance
   */
  static async fromImprovadoApiKey(improvadoApiKey: string): Promise<NotionClientWrapper> {
    const notionToken = await verifyNotionApiKey(improvadoApiKey);
    return new NotionClientWrapper(notionToken);
  }

  async appendBlockChildren(
    block_id: string,
    children: Partial<BlockResponse>[]
  ): Promise<BlockResponse> {
    const body = { children };

    const response = await fetch(
      `${this.baseUrl}/blocks/${block_id}/children`,
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify(body),
      }
    );

    return response.json();
  }

  async retrieveBlock(block_id: string): Promise<BlockResponse> {
    const response = await fetch(`${this.baseUrl}/blocks/${block_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async retrieveBlockChildren(
    block_id: string,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(
      `${this.baseUrl}/blocks/${block_id}/children?${params}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    return response.json();
  }

  async deleteBlock(block_id: string): Promise<BlockResponse> {
    const response = await fetch(`${this.baseUrl}/blocks/${block_id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    return response.json();
  }

  async retrievePage(page_id: string): Promise<PageResponse> {
    const response = await fetch(`${this.baseUrl}/pages/${page_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updatePageProperties(
    page_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const body = { properties };

    const response = await fetch(`${this.baseUrl}/pages/${page_id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async listAllUsers(
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(`${this.baseUrl}/users?${params.toString()}`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async retrieveUser(user_id: string): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/users/${user_id}`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async retrieveBotUser(): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: "GET",
      headers: this.headers,
    });
    return response.json();
  }

  async createDatabase(
    parent: CreateDatabaseArgs["parent"],
    title: RichTextItemResponse[],
    properties: Record<string, any>
  ): Promise<DatabaseResponse> {
    const body = { parent, title, properties };

    const response = await fetch(`${this.baseUrl}/databases`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async queryDatabase(
    database_id: string,
    filter?: Record<string, any>,
    sorts?: Array<{
      property?: string;
      timestamp?: string;
      direction: "ascending" | "descending";
    }>,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const body: Record<string, any> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (start_cursor) body.start_cursor = start_cursor;
    if (page_size) body.page_size = page_size;

    const response = await fetch(
      `${this.baseUrl}/databases/${database_id}/query`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      }
    );

    return response.json();
  }

  async retrieveDatabase(database_id: string): Promise<DatabaseResponse> {
    const response = await fetch(`${this.baseUrl}/databases/${database_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updateDatabase(
    database_id: string,
    title?: RichTextItemResponse[],
    description?: RichTextItemResponse[],
    properties?: Record<string, any>
  ): Promise<DatabaseResponse> {
    const body: Record<string, any> = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (properties) body.properties = properties;

    const response = await fetch(`${this.baseUrl}/databases/${database_id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createDatabaseItem(
    database_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const body = {
      parent: { database_id },
      properties,
    };

    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createComment(
    parent?: { page_id: string },
    discussion_id?: string,
    rich_text?: RichTextItemResponse[]
  ): Promise<CommentResponse> {
    const body: Record<string, any> = { rich_text };
    if (parent) {
      body.parent = parent;
    }
    if (discussion_id) {
      body.discussion_id = discussion_id;
    }

    const response = await fetch(`${this.baseUrl}/comments`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async retrieveComments(
    block_id: string,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const params = new URLSearchParams();
    params.append("block_id", block_id);
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(
      `${this.baseUrl}/comments?${params.toString()}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    return response.json();
  }

  async search(
    query?: string,
    filter?: { property: string; value: string },
    sort?: {
      direction: "ascending" | "descending";
      timestamp: "last_edited_time";
    },
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const body: Record<string, any> = {};
    if (query) body.query = query;
    if (filter) body.filter = filter;
    if (sort) body.sort = sort;
    if (start_cursor) body.start_cursor = start_cursor;
    if (page_size) body.page_size = page_size;

    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async toMarkdown(response: NotionResponse): Promise<string> {
    return convertToMarkdown(response);
  }
} 