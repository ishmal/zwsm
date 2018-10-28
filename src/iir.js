
const TWOPI = Math.PI * 2.0;

export class IIR {

	static filter(b) {
		const a = 1.0 - b;
		let z = 0;
		return {
			update: (v) => {
				z = v * a + z * b;
				return z;
			}
		};
	}

	/**
	 * single pole low pass filter
	 * @param {number} cutoff cutoff frequency in hertz
	 * @param {number} sampleRate samples per second
	 */
	static lowPass(cutoff, sampleRate) {
		const b = Math.exp(-TWOPI * cutoff / sampleRate);
		return IIR.filter(b);
	}

	/**
	 * single pole low pass filter
	 * @param {number} cutoff cutoff frequency in hertz
	 * @param {number} sampleRate samples per second
	 */
	static highPass(cutoff, sampleRate) {
		const b = Math.exp(-TWOPI * (0.5 - cutoff / sampleRate));
		return IIR.filter(b);
	}

}