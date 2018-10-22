import { Mode } from "./mode";

//################################################################
//# 16 DQAM
//################################################################


//v.22bis constellation
/* beautify preserve:start */
const qam16 = [
	[{ r:  1, i:  1 }, { r:  3, i:  1 }, { r:  1, i:  3 }, { r:  3, i:  3 }],
	[{ r: -1, i:  1 }, { r: -1, i:  3 }, { r: -3, i:  1 }, { r: -3, i:  3 }],
	[{ r: -1, i: -1 }, { r: -3, i: -1 }, { r: -1, i: -3 }, { r: -3, i: -3 }],
	[{ r:  1, i: -1 }, { r:  1, i: -3 }, { r:  3, i: -1 }, { r:  3, i: -3 }]
];
const q16Trans = [
	[1,2,3,0], [0,1,2,3], [3,0,1,2], [2,3,0,1]
];
/* beautify preserve:end */

export class Qam16 extends Mode{

	constructor(par) {
		super(par);
		this.symbolRate = 600;
		this.frequency = 1200;
		let sampleRate = par.sampleRate;
		this.samplesPerSymbol = (sampleRate / this.symbolRate) | 0;
		console.log("sps:" + this.samplesPerSymbol);
		this.xmSampleCount = 0;
		this.xmText = raven;
		this.xmTextPosition = 0;
		this.xmCode = null;
		this.xmCodePosition = 0;
		this.xmKey = 0;
		this.symbol = qam16[0][0];
		this.quadrant = 0;
		this.byte = 0;
		this.nrQbit = 99;
		par.setBandpass(this.frequency, this.symbolRate);
	}

	getNextByte() {
		let code = this.xmText.charCodeAt(this.xmTextPosition++);
		if (this.xmTextPosition >= this.xmText.length) {
			this.xmTextPosition = 0;
		}
		return code & 0xff;
	}

	getNextQbit() {
		if (this.nrQbit >= 2) {
			this.byte = this.getNextByte();
			this.nrQbit = 0;
		}
		let qbits = (this.nrQbit === 0) ?
			(this.byte >> 4) & 15 : this.byte & 15;
		this.nrQbit++;
		return qbits;
	}

	getNextSymbol() {
		let qbits = this.getNextQbit();
		let hi = (qbits >> 2) & 3;
		let lo = qbits & 3;
		let newQuad = q16Trans[hi][this.quadrant];
		let symbol = qam16[newQuad][lo];
		this.quadrant = newQuad;
		return symbol;
	}

	transmit() {
		let a = this.nco.next();
		let b = this.symbol;
		this.xmSampleCount++;
		if (this.xmSampleCount >= this.samplesPerSymbol) {
			this.xmSampleCount = 0;
			this.symbol = this.getNextSymbol();
		}
		let i = a.r * b.r - a.i * b.i;
		let q = a.r * b.i + a.i * b.r;
		let sample = i + q;
		return sample;
	}
}



