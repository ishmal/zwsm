import FFTW from "fftw-js";

export class Fft {
	constructor(size) {
		this.fftr = new FFTW.RFFT(size);
		this.scale = 1.0 / size;
	}

	forward(arr) {
		return this.fftr.forward(arr);
	}

	inverse(arr) {
		return this.fftr.inverse(arr);
	}

	scaleTransform(arr) {
		const scale = this.scale;
		for (let i = 0, len = arr.length; i < len; i++) {
			arr[i] *= scale;
		}
	}

}