/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === "GET" && url.pathname === "/api/health") {
			return Response.json({
				status: "ok",
				service: "atins-komis-cloudflare-lab",
			});
		}

		if (request.method === "GET" && url.pathname === "/api/cars") {
			return Response.json([
				{
					id: 1,
					brand: "Toyota",
					model: "Corolla",
					year: 2021,
					status: "AVAILABLE",
				},
			]);
		}

		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;