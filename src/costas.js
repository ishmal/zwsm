import { Biquad } from "./biquad";

const TWOPI = 2.0 * Math.PI;
const TABLE_SIZE = 1024;
const PI_SCALE = TWOPI / TABLE_SIZE;

function createCossinTable() {
	const xs = [];
	let angle = 0;

	for (let idx = 0; idx < TABLE_SIZE; idx++) {
		xs[idx] = {
			r: Math.cos(angle),
			i: -Math.sin(angle)
		};
		angle += PI_SCALE;
	}
	return xs;
}

const ncoTable = createCossinTable();

function LoopFilter(bandWidth) {
	const K = 1000; //loop gain
	const z = 0.707; // damping factor
	const bw = bandWidth;
	const t1 = K / (bw * bw); //tau1
	const t2 = 2 * z / bw; // tau2
	// feed-forward coefficients (numerator)
	const b0 = (4 * K / t1) * (1. + t2 / 2.0);
	const b1 = (8 * K / t1);
	const b2 = (4 * K / t1) * (1. - t2 / 2.0);

	// feed-back coefficients (denominator)
	//const a1 = -2.0;
	//const a2 =  1.0;
	let v0 = 0;
	let v1 = 0;
	let v2 = 0;

	return {
		update: (x) => {
			v2 = v1;
			v1 = v0;
			v0 = x + v1 + v1 - v2; // x - v1 * a1 - v2 * a2;
			const res = v0 * b0 + v1 * b1 + v2 * b2;
			return res;
		}
	}
}

export class Costas {
	constructor(frequency, sampleRate) {
		this.sampleRate = sampleRate;
		this.phase = 0;
		this.setFrequency(frequency);
		this.bandWidth = TWOPI / 400;   // 100 to 400
		this.minFreq = this.freq - this.bandWidth * 0.5;
		this.maxFreq = this.freq + this.bandWidth * 0.5;
		this.loopFilter = LoopFilter(this.bandWidth);
	}

	setFrequency(v) {
		this.freq = v * TWOPI / this.sampleRate;
		this.freq0 = this.freq;
		this.slpf = Biquad.lowPass(v, this.sampleRate);
		this.clpf = Biquad.lowPass(v, this.sampleRate);
	}

	update(v) {
		let phase = this.phase;
		const {
			r,
			i
		} = ncoTable[Math.floor(phase * PI_SCALE)];
		const cosx = r * v;
		const cosxf = this.clpf.update(cosx);
		const sinx = i * v; // negative: see cossin table
		const sinxf = this.slpf.update(sinx);
		const combined = sinxf * cosxf;
		const err = this.loopFilter.update(combined);
		let freq = this.freq - err;
		if (freq > this.maxFreq) {
			freq = this.maxFreq;
			console.log("max");
		} else if (freq < this.minFreq) {
			freq = this.minFreq;
			console.log("min");
		}
		phase = phase + freq;
		while (phase > TWOPI) {
			phase -= TWOPI;
		}
		while (phase < -TWOPI) {
			phase += TWOPI
		}
		this.freq = freq;
		this.phase = phase;
	}


}
