import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { Env, Props } from "./types";
import { executeQuerySchema, executeQueryHandler } from "./tools";

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
