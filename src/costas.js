import { Biquad } from "./biquad";
import { LowPassIIR } from "./iir";

const TWOPI = 2.0 * Math.PI;
const TABLE_SIZE = 1024;
const PI_SCALE = TWOPI / TABLE_SIZE;

function createCossinTable() {
    const twopi = Math.PI * 2.0;
    const delta = twopi / size;
    const xs = new Array(two16);
    let angle = 0;

    for (let idx = 0; idx < size; idx++) {
        xs[idx] = { r: Math.cos(angle), i: Math.sin(angle) };
        angle += delta;
    }
    return xs;
}

const TWO32 = 4294967296.0;

const ncoTable = createCossinTable(TABLE_SIZE);

export class Costas {
	constructor(frequency, sampleRate) {
		this.alpha = 0.01;
		this.freq = 0 | 0;
		this.sampleRate = sampleRate;
		this.phase = 0 | 0;
		this.setFrequency(frequency);
		this.dlpf = LowPassIIR(10, sampleRate);
	}

    setFrequency(v) {
		this.freq = (v * this.hzToInt) | 0;
		this.slpf = Biquad.lowPass(v, this.sampleRate);
		this.clpf = Biquad.lowPass(v, this.sampleRate);
    }

	update(v) {
        	let phase = this.phase;
		const {r, i} = ncoTable[Math.floor(phase * PI_SCALE)];
		const sinx = r * v;
		const sinxf = this.slpf.update(sinx);
		const cosx = i * v;
		const cosxf = this.clpf.update(cosx);
		const combined = sinxf * cosxf;
		const err = this.dlpf.update(combined);
		phase = phase + Math.floor(this.freq + this.alpha * err);
		if (isNaN(phase)) {
			debugger;
		}
		this.phase = phase;

    }


}
