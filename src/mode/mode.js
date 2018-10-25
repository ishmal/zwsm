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
/* jslint node: true */

import { Complex } from "../complex";
import { Constants } from "../constants";
import { Biquad } from "../biquad";
import { Nco } from "../nco";
import { Utf8 } from "../utf8";



/**
 * Base class for all digimodes
 */
export class Mode {

	/**
	 * @param par instance of parent Digi
	 */
	constructor(par) {
		this.par = par;
		this.frequency = 1000;
		this.symbolRate = 31.25;
		this.rxNco = new Nco(this.frequency, par.sampleRate);
		this.txNco = new Nco(this.frequency, par.sampleRate);
		this.transmitData = [];
	}

	status(msg) {
		if (this.par) {
			this.par.status(msg);
		} else {
			console.log(msg);
		}
	}

	/**
	 * Override this
	 * @return {Properties}
	 */
	getProperties() {
		return {
			name: "mode",
			description: "Base mode class.  Please override this method",
			tooltip: "Base mode class.  Please override this method",
			controls: []
		};
	}

	/**
	 * @param freq {number}
	 */
	setFrequency(freq) {
		this.frequency = freq;
		this.rxNco.setFrequency(freq);
		this.txNco.setFrequency(freq);
	}

	/**
	 * @return {number}
	 */
	getFrequency() {
		return this.frequency;
	}

	/**
	 * @return {number}
	 */
	getBandwidth() {
		return 0;
	}

	/**
	 * There is a known bug in Typescript that will not allow
	 * calling a super property setter.  The work around is to delegate
	 * the setting to s parent class method, and override that.  This
	 * works in ES6.
	 * @param v {number}
	 */
	setSymbolRate(v) {
		this.symbolRate = v;
		const msg = `Fs: ${this.par.sampleRate}  rate: ${v}  sps: ${this.getSamplesPerSymbol()}`;
		this.status(msg);
	}

	/**
	 * @return {number}
	 */
	getRate() {
		return this.rate;
	}


	/**
	 * @return {number}
	 */
	getSamplesPerSymbol() {
		return this.par.sampleRate / this.rate;
	}


	// #######################
	// # R E C E I V E
	// #######################

	/**
	 * @param ps {number[]}
	 */
	receiveSignal(data) {
		if (!data) {
			//we need to turn something off here
			return null;
		}
		const inputBuf = [];
		for (let i = 0, len = data.length; i < len; i++) {
			const v = data[i];
			const cs = this.nco.next();
			inputBuf[i] = {
				r: v * cs.r,
				i: v * cs.i
			};
		}
		this.receive(inputBuf);
	}

	receiveOutput(bytes) {
		// do stuff
	}

	/**
	 * Overload this for each mode.
	 * @param {array<Complex>} buf array of Complex values
	 */
	receive(buf) { }

	// #######################
	// # T R A N S M I T
	// #######################

	transmitClear() {		
		this.trasmitData = [];
		this.cursor = 0;
	}

	sendText(text) {
		const bytes = Utf8.toBytes(text);
		this.sendBytes(bytes);
	}

	sendBytes(bytes) {
		this.trasmitData = this.transmitData.concat(bytes);
	}

	getTransmitData(amount) {
		const cursor = this.cursor;
		const data = this.transmitData || [];
		const len = data.length;
		if (cursor >= len) {
			this.trasmitClear();
			return null;
		}
		const end = Math.min(len, cursor + amount);
		const chunk = data.slice(cursor, end);
		this.cursor = end;
		return chunk;
	}

	/**
	 * @Override this for each mode.  As long as data is available,
	 * transmit.  If none and the mode has an idle signal, transmit
	 * that.  Else return null.
	 * @return {number[]}
	 */
	transmit() {
		return null;
	} 

	transmitSignal() {
		const baseband = this.transmit();
		if (!baseband) {
			return null;
		}
		const xs = this.txNco.mixComplexBuf(baseband);
		return xs;
	}

}