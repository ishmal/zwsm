import FFTW from "fftw-js";

class Fft {
	constructor(size) {
		this.fftr = FFTW.RFFT(size);
		this.scale = 1.0 / size;
	}

	forward(arr) {
		return this.fftr.forward(arr);
	}

	scaleTransform(arr) {
		const scale = this.scale;
		for (let i = 0, len = arr.length; i < len; i++) {
			arr[i] *= scale;
		}
	}

	inverse(arr) {
		return fftr.inverse(arr);
	}
}