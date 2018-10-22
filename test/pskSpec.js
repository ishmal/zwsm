import { ModeTester } from "./modeTester";
import { PskMode } from "../src/mode/psk";


describe("Bpsk", () => {
	it("should pass a ModeTester run", () => {
		const tester = new ModeTester(PskMode);
		debugger;
		tester.execute();
	});
});