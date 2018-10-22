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

/**
 * Base class for Numerically-controlled oscillators
 */
export class Nco {

    /**
     * @param v {number}
     */
    setFrequency(v) {}

    /**
     * @param v {number}
     */
    setError(v) {}

    /**
     * @return {Complex}
     */
    next() {
      return {
        r: 0,
        i: 0
      };
    }

    /**
     * @param v {number}
     */
    mixNext(v) {
      return {
        r: 0,
        i: 0
      };
    }

    /**
     * @param inb {number[]}
     * @return {number[]}
     */
    mixBuf(inb) {
      return [];
    }
}

const TWO32 = 4294967296.0;

/**
 * A sine generator with a 31-bit accumulator and a 16-bit
 * lookup table.  Much faster than Math.whatever
 * @param frequency {number}
 * @param sampleRate {number}
 * @return {Nco}
 */
function NcoCreate(frequency, sampleRate) {

    const hzToInt = TWO32 / sampleRate;
    const freq = 0 | 0;
    const phase = 0 | 0;
    const table = ncoTable;
    const err = 0;
    const maxErr = (50 * hzToInt) | 0;  // in hertz
    console.log("NCO maxErr: " + maxErr);
    const minErr = -(50 * hzToInt) | 0;  // in hertz

    const newNco = new Nco();
    newNco.setFrequency = function(v) {
        freq = (v * hzToInt) | 0;
    };

    setFrequency(frequency);

    newNco.setError = function(v) {
        err = (err * 0.9 + v * 100000.0) | 0;
        // console.log("err:" + err + "  v:" + v);
        if (err > maxErr) {
            err = maxErr;
        } else if (err < minErr) {
            err = minErr;
        }
    };

    newNco.next = function() {
        phase += freq + err;
        return table[phase >>> 16];
    };

    /**
     * @param v mumber
     * @return Complex
     */
    newNco.mixNext = function(v) {
        phase += freq + err;
        const cs = table[phase >>> 16];
        return { r: v * cs.r, i: -v * cs.i };
    };

    newNco.mixBuf = function(inb) {
        const len = inb.length;
        const xs = new Array(len);
        for (let i=0 ; i < len ; i++) {
          const v = inb[i];
          phase += freq + err;
          const cs = table[phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    };

    return newNco;
}

/**
 * A simpler Nco for transmitting, etc
 * @param frequency {number}
 * @param sampleRate {number}
 * @return {Nco}
 */
function NcoCreateSimple(frequency, sampleRate) {

    const hzToInt = TWO32 / sampleRate;
    let freq = 0 | 0;
    let phase = 0 | 0;
    const table = ncoTable;

    const nco = new Nco();
    nco.setFrequency = function(v) {
        freq = (v * hzToInt) | 0;
    };
    nco.setFrequency(frequency);

    nco.next = function() {
        phase += freq;
        return table[phase >>> 16];
    };

    nco.mixNext = function(v) {
        phase += freq;
        const cs = table[phase >>> 16];
        return { r: v * cs.r, i: -v * cs.i };
    };

    nco.mixBuf = function(inb) {
        const len = inb.length;
        const xs = new Array(len);
        for (let i=0 ; i < len ; i++) {
          const v = inb[i];
          phase += freq;
          const cs = table[phase >>> 16];
          xs[i] = v * cs.r - v * cs.i;
        }
        return xs;
    };

    return nco;
}

export const Nco = {
	create: NcoCreate,
	createSimple: NcoCreateSimple
};
