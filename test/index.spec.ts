import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
	applyD1Migrations,
} from "cloudflare:test";

import {
	describe,
	it,
	expect,
	beforeEach,
} from "vitest";

import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

type D1Migration = {
	name: string;
	queries: string[];
};

beforeEach(async () => {
	const testEnv = env as Env & {
		TEST_MIGRATIONS: D1Migration[];
	};

	// 1. Zastosuj migracje do testowej bazy D1
	await applyD1Migrations(
		testEnv.DB,
		testEnv.TEST_MIGRATIONS
	);

	// 2. Wyczyść dane przed każdym testem
	await testEnv.DB
		.prepare("DELETE FROM cars")
		.run();

	// 3. Wyzeruj AUTOINCREMENT
	await testEnv.DB
		.prepare("DELETE FROM sqlite_sequence WHERE name = 'cars'")
		.run();

	// 4. Dodaj kontrolowany rekord testowy
	await testEnv.DB
		.prepare(`
			INSERT INTO cars (
				brand,
				model,
				production_year,
				mileage_km,
				price_pln,
				status
			)
			VALUES (?, ?, ?, ?, ?, ?)
		`)
		.bind(
			"Toyota",
			"Corolla",
			2021,
			54000,
			72900,
			"AVAILABLE"
		)
		.run();
});

describe("Komis API", () => {
	it("GET /api/health returns service status", async () => {
		const request = new IncomingRequest(
			"http://example.com/api/health"
		);

		const ctx = createExecutionContext();

		const response = await worker.fetch(
			request,
			env,
			ctx
		);

		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual({
			status: "ok",
			service: "atins-komis-cloudflare-lab",
		});
	});

	it("GET /api/cars returns cars from D1", async () => {
		const response = await SELF.fetch(
			"https://example.com/api/cars"
		);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual([
			{
				id: 1,
				brand: "Toyota",
				model: "Corolla",
				production_year: 2021,
				mileage_km: 54000,
				price_pln: 72900,
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