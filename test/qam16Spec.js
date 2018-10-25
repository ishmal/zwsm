import { ModeTester } from "./modeTester";
import { Qam16 } from "../src/mode/dqam16";


describe.only("Qam16", () => {
	it("should pass a ModeTester run", () => {
		const tester = new ModeTester(Qam16);
		debugger;
		tester.execute();
	});
});