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

import {Window} from "./window";
import {Complex} from "./complex";


/**
 * Hardcoded filter for size 13.  Pick 13!
 * @param coeffs: {number[]}
 * @return {Filter}
 */
function newFilter13(coeffs) {

    const c0 = coeffs[0], c1 = coeffs[1], c2 = coeffs[2], c3 = coeffs[3],
        c4 = coeffs[4], c5 = coeffs[5], c6 = coeffs[6], c7 = coeffs[7],
        c8 = coeffs[8], c9 = coeffs[9], c10 = coeffs[10], c11 = coeffs[11],
        c12 = coeffs[12];

    const r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0,
        r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0;
    const i0 = 0, i1 = 0, i2 = 0, i3 = 0, i4 = 0, i5 = 0, i6 = 0,
        i7 = 0, i8 = 0, i9 = 0, i10 = 0, i11 = 0, i12 = 0;

    return {
        update: function(v) {
            r12 = r11;
            r11 = r10;
            r10 = r9;
            r9 = r8;
            r8 = r7;
            r7 = r6;
            r6 = r5;
            r5 = r4;
            r4 = r3;
            r3 = r2;
            r2 = r1;
            r1 = r0;
            r0 = v;

            return c0 * r12 + c1 * r11 + c2 * r10 + c3 * r9 + c4 * r8 + c5 * r7 + c6 * r6 +
                c7 * r5 + c8 * r4 + c9 * r3 + c10 * r2 + c11 * r1 + c12 * r0;
        },

        updatex: function(v) {
            r12 = r11;
            r11 = r10;
            r10 = r9;
            r9 = r8;
            r8 = r7;
            r7 = r6;
            r6 = r5;
            r5 = r4;
            r4 = r3;
            r3 = r2;
            r2 = r1;
            r1 = r0;
            r0 = v.r;
            i12 = i11;
            i11 = i10;
            i10 = i9;
            i9 = i8;
            i8 = i7;
            i7 = i6;
            i6 = i5;
            i5 = i4;
            i4 = i3;
            i3 = i2;
            i2 = i1;
            i1 = i0;
            i0 = v.i;

            return {
                r: c0 * r12 + c1 * r11 + c2 * r10 + c3 * r9 + c4 * r8 + c5 * r7 + c6 * r6 +
                c7 * r5 + c8 * r4 + c9 * r3 + c10 * r2 + c11 * r1 + c12 * r0,
                i: c0 * i12 + c1 * i11 + c2 * i10 + c3 * i9 + c4 * i8 + c5 * i7 + c6 * i6 +
                c7 * i5 + c8 * i4 + c9 * i3 + c10 * i2 + c11 * i1 + c12 * i0
            };
        }
    };
}

/**
 * @return {number[]}
 */
function genCoeffs(size, window, func) {
    window = window || Window.hann;
    const W = window(size);
    const center = size * 0.5;
    const sum = 0.0;
    const arr = [];
    for (const i = 0; i < size; i++) {
        const v = func(i - center) * W[i];
        sum += v;
        arr[arr.length] = v;
    }
    for (const j = 0; j < size; j++) {
        arr[j] /= sum;
    }
    return arr;
}

function newFilter(size, coeffs) {
    const sizeless = size - 1;
    const dlr = new Array(size);
    const dli = new Array(size);
    const dptr = 0;

    const filter = {
        update: function(v) {
            dlr[dptr++] = v;
            dptr %= size;
            const ptr = dptr;
            const sum = 0;
            for (const i = 0; i < size; i++) {
                sum += coeffs[i] * dlr[ptr];
                ptr = (ptr + sizeless) % size;
            }
            return sum;
        },

        updatex: function(v) {
            dlr[dptr] = v.r;
            dli[dptr++] = v.i;
            dptr %= size;
            const ptr = dptr;
            const sumr = 0;
            const sumi = 0;
            for (const i = 0; i < size; i++) {
                sumr += coeffs[i] * dlr[ptr];
                sumi += coeffs[i] * dli[ptr];
                ptr = (ptr + sizeless) % size;
            }
            return { r: sumr, i: sumi };
        }
    };
    return filter;
}

export class FIR {

    /**
     * @param size {number}
     * @param window {Window}
     * @return {Filter}
     */
    static average(size, window) {
        const omega = 1.0 / size;
        const coeffs = genCoeffs(size, window, (i) => {
            return omega;
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param window {Window}
     * @return {Filter}
     */
    static boxcar(size, window) {
        const coeffs = genCoeffs(size, window, (i) => {
            return 1.0;
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param cutoffFreq {number}
     * @param sampleRate {number}
     * @param window {Window}
     * @return {Filter}
     */
    static lowpass(size, cutoffFreq, sampleRate, window) {
        const omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
        const coeffs = genCoeffs(size, window, (i) => {
            return (i === 0) ? omega / Math.PI : Math.sin(omega * i) / (Math.PI * i);
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param cutoffFreq {number}
     * @param sampleRate {number}
     * @param window {Window}
     * @return {Filter}
     */
    static highpass(size, cutoffFreq, sampleRate, window) {
        const omega = 2.0 * Math.PI * cutoffFreq / sampleRate;
        const coeffs = genCoeffs(size, window, (i) => {
            return (i === 0) ? 1.0 - omega / Math.PI : -Math.sin(omega * i) / (Math.PI * i);
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param loCutoffFreq {number}
     * @param hiCutoffFreq {number}
     * @param sampleRate {number}
     * @param window {Window}
     * @return {Filter}
     */
    static bandpass(size, loCutoffFreq, hiCutoffFreq, sampleRate, window) {
        const omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
        const omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
        const coeffs = genCoeffs(size, window, (i) => {
            return (i === 0) ? (omega2 - omega1) / Math.PI :
                (Math.sin(omega2 * i) - Math.sin(omega1 * i)) / (Math.PI * i);
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param loCutoffFreq {number}
     * @param hiCutoffFreq {number}
     * @param sampleRate {number}
     * @param window {Window}
     * @return {Filter}
     */
    static bandreject(size, loCutoffFreq, hiCutoffFreq, sampleRate, window) {
        const omega1 = 2.0 * Math.PI * hiCutoffFreq / sampleRate;
        const omega2 = 2.0 * Math.PI * loCutoffFreq / sampleRate;
        const coeffs = genCoeffs(size, window, (i) => {
            return (i === 0) ? 1.0 - (omega2 - omega1) / Math.PI :
                (Math.sin(omega1 * i) - Math.sin(omega2 * i)) / (Math.PI * i);
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

    /**
     * @param size {number}
     * @param roloff {number}
     * @param symbolFreq {number}
     * @param sampleRate {number}
     * @param window {Window}
     * @return {Filter}
     */
    static raisedcosine(size, rolloff, symbolFreq, sampleRate, window) {
        const T = sampleRate / symbolFreq;
        const a = rolloff;

        const coeffs = genCoeffs(size, window, (i) => {
            const nT = i / T;
            const anT = a * nT;
            const c = 0;
            if (i === 0) {
                c = 1.0;
            } else if (anT === 0.5 || anT === -0.5) { // look at denominator below
                c = Math.sin(Math.PI * nT) / (Math.PI * nT) * Math.PI / 4.0;
            } else {
                c = Math.sin(Math.PI * nT) / (Math.PI * nT) * Math.cos(Math.PI * anT) /
                    (1.0 - 4.0 * anT * anT);
            }
            return c;
        });
        return (size === 13) ? newFilter13(coeffs) : newFilter(size, coeffs);
    }

}





