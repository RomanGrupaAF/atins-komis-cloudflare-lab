import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Komis API", () => {
	it("GET /api/health returns service status", async () => {
		const request = new IncomingRequest(
			"http://example.com/api/health"
		);

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: "ok",
			service: "atins-komis-cloudflare-lab",
		});
	});

	it("GET /api/cars returns cars", async () => {
		const response = await SELF.fetch(
			"https://example.com/api/cars"
		);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual([
			{
				id: 1,
				brand: "Toyota",
				model: "Corolla",
				year: 2021,
				status: "AVAILABLE",
			},
		]);
	});

	it("unknown route returns 404", async () => {
		const response = await SELF.fetch(
			"https://example.com/not-existing"
		);

		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Not Found");
	});
});