import { Hono } from "hono";
import {
	layout,
	homeContent,
	parseApproveFormBody,
	renderAuthorizationRejectedContent,
	renderAuthorizationApprovedContent,
	renderLoggedInAuthorizeScreen,
	renderLoggedOutAuthorizeScreen,
} from "./utils";
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { Env } from "./types";

export type Bindings = Env & {
	OAUTH_PROVIDER: OAuthHelpers;
};

const app = new Hono<{
	Bindings: Bindings;
}>();

app.get("/", async (c) => {
	const content = await homeContent(c.req.raw);
	return c.html(layout(content, "Improvado MCP - Home"));
});

app.get("/authorize", async (c) => {
	const isLoggedIn = true;

	const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);

	const oauthScopes = [
		{
			name: "improvado_api",
			description: "Access your Improvado data using your API key",
		},
	];

	if (isLoggedIn) {
		const content = await renderLoggedInAuthorizeScreen(oauthScopes, oauthReqInfo);
		return c.html(layout(content, "Improvado MCP - Authorization"));
	}

	const content = await renderLoggedOutAuthorizeScreen(oauthScopes, oauthReqInfo);
	return c.html(layout(content, "Improvado MCP - Authorization"));
});

app.post("/approve", async (c) => {
	const { action, oauthReqInfo, improvadoApiKey } = await parseApproveFormBody(
		await c.req.parseBody(),
	);

	if (!oauthReqInfo) {
		return c.html("INVALID REQUEST", 401);
	}

	if (action === "reject") {
		return c.html(
			layout(
				await renderAuthorizationRejectedContent("/"),
				"Improvado MCP - Authorization Status",
			),
		);
	}

	const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
		request: oauthReqInfo,
		userId: "improvado_user",
		metadata: {
			label: "Improvado User",
		},
		scope: oauthReqInfo.scope,
		props: {
			improvadoApiKey: improvadoApiKey,
		},
	});

	return c.html(
		layout(
			await renderAuthorizationApprovedContent(redirectTo),
			"Improvado MCP - Authorization Status",
		),
	);
});

export default app;
