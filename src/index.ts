import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { NotionClientWrapper } from "./tools/notion";
import { Env, Props } from "./global-types";
import { executeQuerySchema, executeQueryHandler } from "./tools";
import { z } from "zod";

export class MyMCP extends McpAgent<Props, Env> {
	server = new McpServer({
		name: "Improvado MCP",
		version: "1.0.0",
	});

	async init() {
		this.server.tool(
			"executeQuery",
			"Execute SQL query on Improvado data via GPT interface",
			executeQuerySchema,
			async (args, extra) => {
				const apiKey = this.props?.improvadoApiKey;
				return executeQueryHandler(args, extra, apiKey as string);
			}
		);

		// Add Notion API tools
		this.addNotionTools();
	}

	private addNotionTools() {
		// Block operations
		this.server.tool(
			"notion_appendBlockChildren",
			"Append child blocks to a Notion block",
			{
				block_id: z.string().describe("ID of the parent block"),
				children: z.array(z.any()).describe("Array of child blocks to append"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.appendBlockChildren(args.block_id, args.children);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveBlock",
			"Retrieve a block by ID",
			{
				block_id: z.string().describe("ID of the block to retrieve"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveBlock(args.block_id);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveBlockChildren",
			"Retrieve all children of a block",
			{
				block_id: z.string().describe("ID of the parent block"),
				start_cursor: z.string().optional().describe("Cursor for pagination (optional)"),
				page_size: z.number().optional().describe("Number of items per page (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveBlockChildren(args.block_id, args.start_cursor, args.page_size);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_deleteBlock",
			"Delete a block by ID",
			{
				block_id: z.string().describe("ID of the block to delete"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.deleteBlock(args.block_id);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		// Page operations
		this.server.tool(
			"notion_retrievePage",
			"Retrieve a page by ID",
			{
				page_id: z.string().describe("ID of the page to retrieve"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrievePage(args.page_id);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_updatePageProperties",
			"Update properties of a page",
			{
				page_id: z.string().describe("ID of the page to update"),
				properties: z.record(z.any()).describe("Properties to update"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.updatePageProperties(args.page_id, args.properties);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		// User operations
		this.server.tool(
			"notion_listAllUsers",
			"List all users in the workspace",
			{
				start_cursor: z.string().optional().describe("Cursor for pagination (optional)"),
				page_size: z.number().optional().describe("Number of items per page (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.listAllUsers(args.start_cursor, args.page_size);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveUser",
			"Retrieve a user by ID",
			{
				user_id: z.string().describe("ID of the user to retrieve"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveUser(args.user_id);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveBotUser",
			"Retrieve the bot user (me)",
			{
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveBotUser();
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		// Database operations
		this.server.tool(
			"notion_createDatabase",
			"Create a new database",
			{
				parent: z.object({
					type: z.string().describe("Type of parent"),
					page_id: z.string().optional().describe("Page ID (optional)"),
					database_id: z.string().optional().describe("Database ID (optional)"),
					workspace: z.boolean().optional().describe("Workspace flag (optional)")
				}).describe("Parent object containing type and ID"),
				title: z.array(z.any()).describe("Title of the database as rich text"),
				properties: z.record(z.any()).describe("Database properties"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.createDatabase(args.parent, args.title, args.properties);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_queryDatabase",
			"Query a database with filters and sorting",
			{
				database_id: z.string().describe("ID of the database to query"),
				filter: z.record(z.any()).optional().describe("Filter conditions (optional)"),
				sorts: z.array(z.any()).optional().describe("Sorting instructions (optional)"),
				start_cursor: z.string().optional().describe("Cursor for pagination (optional)"),
				page_size: z.number().optional().describe("Number of items per page (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.queryDatabase(
					args.database_id, 
					args.filter, 
					args.sorts, 
					args.start_cursor, 
					args.page_size
				);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveDatabase",
			"Retrieve a database by ID",
			{
				database_id: z.string().describe("ID of the database to retrieve"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveDatabase(args.database_id);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_updateDatabase",
			"Update a database's properties",
			{
				database_id: z.string().describe("ID of the database to update"),
				title: z.array(z.any()).optional().describe("Title of the database as rich text (optional)"),
				description: z.array(z.any()).optional().describe("Description of the database as rich text (optional)"),
				properties: z.record(z.any()).optional().describe("Database properties (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.updateDatabase(
					args.database_id, 
					args.title, 
					args.description, 
					args.properties
				);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_createDatabaseItem",
			"Create a new item in a database",
			{
				database_id: z.string().describe("ID of the database"),
				properties: z.record(z.any()).describe("Properties of the new item"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.createDatabaseItem(args.database_id, args.properties);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		// Comment operations
		this.server.tool(
			"notion_createComment",
			"Create a new comment",
			{
				parent: z.object({
					page_id: z.string().describe("ID of the parent page")
				}).optional().describe("Parent page (optional)"),
				discussion_id: z.string().optional().describe("ID of the discussion (optional)"),
				rich_text: z.array(z.any()).describe("Content of the comment as rich text"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.createComment(args.parent, args.discussion_id, args.rich_text);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		this.server.tool(
			"notion_retrieveComments",
			"Retrieve comments for a block",
			{
				block_id: z.string().describe("ID of the block"),
				start_cursor: z.string().optional().describe("Cursor for pagination (optional)"),
				page_size: z.number().optional().describe("Number of items per page (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.retrieveComments(args.block_id, args.start_cursor, args.page_size);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);

		// Search operation
		this.server.tool(
			"notion_search",
			"Search pages and databases",
			{
				query: z.string().optional().describe("Search query (optional)"),
				filter: z.object({
					property: z.string().describe("Property to filter on"),
					value: z.string().describe("Value to filter by")
				}).optional().describe("Filter by object type (optional)"),
				sort: z.object({
					direction: z.enum(["ascending", "descending"]).describe("Sort direction"),
					timestamp: z.enum(["last_edited_time"]).describe("Property to sort by")
				}).optional().describe("Sort results (optional)"),
				start_cursor: z.string().optional().describe("Cursor for pagination (optional)"),
				page_size: z.number().optional().describe("Number of items per page (optional)"),
				format: z.enum(["json", "markdown"]).optional().describe("Response format (optional)")
			},
			async (args, extra) => {
				const client = await this.getNotionClient();
				const response = await client.search(
					args.query, 
					args.filter, 
					args.sort, 
					args.start_cursor, 
					args.page_size
				);
				const result = args.format === "markdown" ? await client.toMarkdown(response) : response;
				return {
					content: [{ 
						type: "text", 
						text: typeof result === "string" ? result : JSON.stringify(result, null, 2) 
					}]
				};
			}
		);
	}

	private async getNotionClient(): Promise<NotionClientWrapper> {
		const apiKey = this.props?.improvadoApiKey;
		if (!apiKey) {
			throw new Error("Improvado API key is required");
		}
		return NotionClientWrapper.fromImprovadoApiKey(apiKey as string);
	}
}

export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: MyMCP.mount("/sse"),
	// @ts-ignore
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});