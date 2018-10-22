/**
 * Zws
 *
 * Copyright 2018, Bob Jamison
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http:// www.gnu.org/licenses/>.
 */

/**
 * NOTE:  Complex is { r: number, i: number }
 */

function createCossinTable() {
    const twopi = Math.PI * 2.0;
    const two16 = 65536;
    const delta = twopi / two16;
    const xs = new Array(two16);
    let angle = 0;

    for (let idx = 0; idx < two16; idx++) {
        xs[idx] = { r: Math.cos(angle), i: Math.sin(angle) };
        angle += delta;
    }
    return xs;
}

const ncoTable = createCossinTable();


const TWO32 = 4294967296.0;


/**
 * A simpler Nco for transmitting, etc
 * @param frequency {number}
 * @param sampleRate {number}
 * @return {Nco}
 */
export class Nco {
	constructor(frequency, sampleRate) {
		this.hzToInt = TWO32 / sampleRate;
		this.freq = 0 | 0;
		this.phase = 0 | 0;
		this.setFrequency(frequency);
	}

    setFrequency(v) {
        this.freq = (v * this.hzToInt) | 0;
    }

    next() {
        this.phase += this.freq;
        return ncoTable[this.phase >>> 16];
    }

    mixReal(v) {
        this.phase += this.freq;
        const cs = ncoTable[this.phase >>> 16];
        return { r: v * cs.r, i: -v * cs.i };
    }

    mixRealBuf(inb) {
        const xs = [];
        for (let i=0, len = inb.length ; i < len ; i++) {
          const v = inb[i];
          this.phase += this.freq;
          const cs = ncoTable[this.phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    };

    mixComplexBuf(inb) {
        const xs = [];
        for (let i=0, len = inb.length ; i < len ; i++) {
          const v = inb[i];
          this.phase += this.freq;
          const cs = ncoTable[this.phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    };

}

