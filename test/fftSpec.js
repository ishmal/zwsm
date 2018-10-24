
import { Fft } from "../src/fft";

describe("FFT", () => {
	it("should perform foward and reverse fft correctly", () => {
		const fft = new Fft(1024);
		const arr = [];
		for (let i = 0; i < 1024; i++) {
			const f1 = Math.sin(i / 40);
			const f2 = Math.sin(i / 30);
			const f3 = Math.sin(i / 50);
			arr[i] = f1 + f2 + f3;
		}
		const transformed = fft.forward(arr);
		fft.scaleTransform(transformed);
		const restored = fft.inverse(transformed);
		for (let i = 0; i < 1024; i++) {
			expect(restored[i]).toBeCloseTo(arr[i], 5);
		}
	});
});