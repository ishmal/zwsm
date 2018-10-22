import { ModeTester } from "./modeTester";
import { Bpsk } from "../src/mode/bpsk";


describe("Bpsk", () => {
	it("should pass a ModeTester run", () => {
		const tester = new ModeTester(Bpsk);
		debugger;
		tester.execute();
	});
});