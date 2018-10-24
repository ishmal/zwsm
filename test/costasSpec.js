import { Costas } from "../src/costas";
import { Nco } from "../src/nco";

describe("Costas", () => {
	it ("can find a signal", () => {
		const loop = new Costas(1000, 8000);
		const nco = new Nco(1001, 8000);
		let lastDiff = 0;
		for (let i = 0; i < 20000; i++) {
			const { r } = nco.next();
			loop.update(r);
		}

		// expect(loop.phase).toEqual(nco.phase);
	});
});