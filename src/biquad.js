// ########################################################################
// #  B I Q U A D
// ########################################################################

/**
 * A biquad filter
 * @see http:// en.wikipedia.org/wiki/Digital_biquad_filter
 * @param b0 {number}
 * @param b1 {number}
 * @param b2 {number}
 * @param a1 {number}
 * @param a2 {number}
 * @return {Filter}
 */
function BiquadFilter(b0, b1, b2, a0, a1, a2) {
	const a0Inv = 1 / a0;
	b0 *= a0Inv;
	b1 *= a0Inv;
	b2 *= a0Inv;
	a1 *= a0Inv;
	a2 *= a0Inv;

	let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
	
    let x1r = 0, x2r = 0, y1r = 0, y2r = 0;
    let x1i = 0, x2i = 0, y1i = 0, y2i = 0;

    return {

        update: function(x) {
            const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            x2 = x1;
            x1 = x;
            y2 = y1;
			y1 = y;
            return y;
        },

        updatex: function(x) {
            const r = x.r;
            const i = x.i;
            const yr = b0 * r + b1 * x1r + b2 * x2r - a1 * y1r - a2 * y2r;
            const yi = b0 * i + b1 * x1i + b2 * x2i - a1 * y1i - a2 * y2i;
            x2r = x1r;
            x1r = r;
            x2i = x1i;
            x1i = i;
            y2r = y1r;
            y1r = yr;
            y2i = y1i;
            y1i = yi;
            return { r: yr, i: yi };
        }
    };

}

function getCossin(frequency, sampleRate) {
	if (frequency >= sampleRate * 0.5) {
		throw new Error(`Biquad: frequency ${frequency} is greater than 1/2 the sampleRate ${sampleRate}`);
	}
	const freq = 2.0 * Math.PI * frequency / sampleRate;
	const sn = Math.sin(freq);
	const cs = Math.cos(freq);
	return {sn, cs};
}

export class Biquad {

    /**
     * @param frequency {number}
     * @param sampleRate {number}
     * @param q {number}
     * @return {Filter}
     */
    static lowPass(frequency, sampleRate, q) {
        q = typeof q !== "undefined" ? q : 0.707;
		const { sn, cs } = getCossin(frequency, sampleRate);
        const alpha = sn / (2.0 * q);
        const b0 = (1.0 - cs) * 0.5;
        const b1 = 1.0 - cs;
        const b2 = (1.0 - cs) * 0.5;
        const a0 = 1.0 + alpha;
        const a1 = -2.0 * cs;
        const a2 = 1.0 - alpha;
        return BiquadFilter(b0, b1, b2, a0, a1, a2);
    }

    /**
     * @param frequency {number}
     * @param sampleRate {number}
     * @param q {number}
     * @return {Filter}
     */
    static highPass(frequency, sampleRate, q) {
        q = typeof q !== "undefined" ? q : 0.707;
		const { sn, cs } = getCossin(frequency, sampleRate);
        const alpha = sn / (2.0 * q);
        const b0 = (1.0 + cs) * 0.5;
        const b1 = -(1.0 + cs);
        const b2 = (1.0 + cs) * 0.5;
        const a0 = 1.0 + alpha;
        const a1 = -2.0 * cs;
        const a2 = 1.0 - alpha;
        return BiquadFilter(b0, b1, b2, a0, a1, a2);
    }

    /**
     * @param frequency {number}
     * @param sampleRate {number}
     * @param q {number}
     * @return {Filter}
     */
    static bandPass(frequency, sampleRate, q) {
        q = typeof q !== "undefined" ? q : 0.5;
		const { sn, cs } = getCossin(frequency, sampleRate);
        const alpha = sn / (2.0 * q);
        const b0 = sn * 0.5;   //  = q*alpha
        const b1 = 0.0;
        const b2 = -sn * 0.5;  //  = -q*alpha
        const a0 = 1.0 + alpha;
        const a1 = -2.0 * cs;
        const a2 = 1.0 - alpha;
        return BiquadFilter(b0, b1, b2, a0, a1, a2);
    }

    /**
     * @param frequency {number}
     * @param sampleRate {number}
     * @param q {number}
     * @return {Filter}
     */
    static bandReject(frequency, sampleRate, q) {
        q = typeof q !== "undefined" ? q : 0.5;
		const { sn, cs } = getCossin(frequency, sampleRate);
        const alpha = sn / (2.0 * q);
        const b0 = 1.0;
        const b1 = -2.0 * cs;
        const b2 = 1.0;
        const a0 = 1.0 + alpha;
        const a1 = -2.0 * cs;
        const a2 = 1.0 - alpha;
        return BiquadFilter(b0, b1, b2, a0, a1, a2);
    }

}
