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
		this.quadrant = 0;
		par.setBandpass(this.frequency, this.symbolRate);
	}

	receive() {
		
	}

	transmit() {
		const inBytes = this.getTransmitData(30);
		if (!inBytes) {
			return null; // should probably idle instead
		}
		let quadrant = this.quadrant;
		const outBuf = [];
		inBytes.forEach(b => {
			const hi1 = (b >> 6) & 3;
			const lo1 = (b >> 4) & 3;
			quadrant = q16Trans[hi1][quadrant];
			const symbol1 = qam16[quadrant][lo1];
			outBuf.push(symbol1);
			const hi2 = (b >> 2) & 3;
			const lo2 = b & 3;
			quadrant = q16Trans[hi2][quadrant];
			const symbol2 = qam16[quadrant][lo2];
			outBuf.push(symbol2);
		});
		this.quadrant = quadrant;
		return outBuf;
	}
}



