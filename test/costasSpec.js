import { Costas } from "../src/costas";
import { Nco } from "../src/nco";

describe("Costas", () => {
	it ("can find a signal", () => {
		const loop = new Costas(1000, 1024);
		const nco = new Nco(1001, 1024);
		for (let i = 0; i < 10000; i++) {
			const { r } = nco.next();
			loop.update(r);
			console.log(loop.phase.toString() + " : " + nco.phase.toString());
		}
	});
});