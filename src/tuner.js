/**
 * Jdigi
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
/* global window */

import { Constants } from "./constants";

const { BINS } = Constants;

class Draggable {
	/**
	pos0: Point;
	*/

	/**
	 * @param p {Point}
	 */
	constructor(p) {
		this.pos0 = p;
	}

	/**
	 * @param p {Point}
	 */
	drag(p) {}

	/**
	 * @param p {Point}
	 */
	end(p) {}
}

const WATERFALL_ROWS = 128;

/**
 * Provides a Waterfall display and tuning interactivity
 * @param par the parent Digi of this waterfall
 * @canvas the canvas to use for drawing
 */
export class Tuner {
	/**
	 * @param par parent instance of a Digi api
	 * @param canvas {HTMLCanvasElement}
	 */
	constructor(par) {
		window.requestAnimationFrame = window.requestAnimationFrame
			|| window.msRequestAnimationFrame;
		//  || window.mozRequestAnimationFrame
		//  || window.webkitRequestAnimationFrame;
		this.par = par;
		const canvas = document.getElementById("tuner");
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.MAX_FREQ = par.sampleRate * 0.5;
		this.draggable = null;
		this.theFrequency = 1000;
		this.indices = null;
		this.width = canvas.width;
		this.height = canvas.height;
		this.scopeData = [];
		this.tuningRate = 1.0;
		canvas.setAttribute("tabindex", "1");
		this.makePalette();
		this.setupBitmap();
		this.setupEvents();
		this.interval = null;
		this.skip = 0;
	}

	/**
	 * note that this is different from the public method
	 * @param frequency {number}
	 */
	set frequency(freq) {
		this.theFrequency = freq;
		this.par.frequency = freq;
	}

	/**
	 * @return {number}
	 */
	get frequency() {
		return this.theFrequency;
	}

	// ####################################################################
	// #   MOUSE and KEY EVENTS
	// ####################################################################

	/**
	 * Set up interactivity events
	 */
	setupEvents() {

		const canvas = this.canvas;

		let didDrag = false;

		const mouseFreq = (event) => {
			const pt = getMousePos(canvas, event);
			const x = pt.x;
			const freq = this.MAX_FREQ * pt.x / this.width;
			this.frequency = freq;
		};

		const getMousePos = (cnv, evt) => {
			const touches = evt.touches;
			const cx = (touches) ? touches[0].clientX : evt.clientX;
			const cy = (touches) ? touches[0].clientY : evt.clientY;
			const rect = cnv.getBoundingClientRect();
			const x = (cx - rect.left) * cnv.width / rect.width;
			const y = (cy - rect.top) * cnv.height / rect.height;
			return {
				x,
				y,
			};
		};

		const onClick = (event) => {
			if (!didDrag) {
				mouseFreq(event);
			}
			this.draggable = null;
			event.preventDefault();
		};

		/**
		 * Mouse down - move - up make a drag
		 * @param {object} event 
		 */
		const onMouseDown = (event) => {
			didDrag = false;
			const pos = getMousePos(canvas, event);
			const freq0 = this.frequency;
			const d = new Draggable(pos);
			d.drag = (p) => {
				let dx = p.x - d.pos0.x;
				dx *= this.tuningRate; // cool!
				const freqDiff = this.MAX_FREQ * dx / this.width;
				this.frequency = freq0 + freqDiff;
			};
			this.draggable = d;
			event.preventDefault();
		};

		const onMouseUp = (event) => {
			if (this.draggable) {
				const pos = getMousePos(canvas, event);
				this.draggable.end(pos);
			}
			this.draggable = null;
			event.preventDefault();
		};

		const onMouseMove = (event) => {
			const d = this.draggable;
			if (d) {
				didDrag = true;
				const pos = getMousePos(canvas, event);
				d.drag(pos);
			}
			event.preventDefault();
		};

		// fine tuning, + or - one hertz
		const onKeyDown = (evt) => {
			const key = evt.which;
			if (key === 37 || key === 40) {
				this.frequency += 1;
			} else if (key === 38 || key === 39) {
				this.frequency -= 1;
			}
			evt.preventDefault();
			return false;
		};

		const handleWheel = (evt) => {
			const delta = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
			this.frequency += (delta * 1); // or other increments here
			evt.preventDefault();
			return false;
		};

		canvas.onclick = onClick;
		canvas.onmousedown = onMouseDown;
		canvas.onmouseup = onMouseUp;
		canvas.onmousemove = onMouseMove;
		canvas.ontouchstart = onMouseDown;
		canvas.ontouchend = onMouseUp;
		canvas.ontouchmove = onMouseMove;
		canvas.onmousewheel = handleWheel;
		onkeydown = onKeyDown;
		canvas.addEventListener("DOMMouseScroll", handleWheel, false);
	}

	// ####################################################################
	// #  R E N D E R I N G
	// ####################################################################

	makePalette() {
		const red = [0, 255];
		const green = [0, 255];
		const blue = [120, 255];
		const rdelta = (red[1] - red[0]) / 256;
		const gdelta = (green[1] - green[0]) / 256;
		const bdelta = (blue[1] - blue[0]) / 256;
		let r = red[0];
		let g = green[0];
		let b = blue[0];
		const palette = [];
		for (let i = 0; i < 256 ; i++) {
			palette[i] = [
				Math.floor(r),
				Math.floor(g),
				Math.floor(b)
			];
			r += rdelta;
			g += gdelta;
			b += bdelta;
		}
		this.palette = palette;
	}


	drawSpectrum(data) {
		const width = this.width;
		const height = this.height;
		const ctx = this.ctx;
		const indices = this.indices;

		ctx.lineWidth = 1;
		ctx.beginPath();
		const base = height - 1;
		ctx.moveTo(0, base);
		const log = Math.log;
		for (let x = 0; x < width; x++) {
			const v = data[indices[x]] * 0.25;
			const y = base - v;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}


    setupBitmap() {
		const ctx = this.ctx;
		const width = this.width;
		const height = this.height;
        const indices = [];
        const ratio = width / BINS;
        for (let i = 0; i < BINS; i++) {
            indices[i] = Math.floor(i * ratio);
        }
        const imgData = ctx.createImageData(width, height);
        const imgLen = imgData.data.length;
        const buf8 = imgData.data;
        for (let i = 0; i < imgLen;) {
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 0;
            buf8[i++] = 255;
        }
        // imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    	const rowSize = imgLen / this.height;
		const lastRow = imgLen - rowSize;
		this.bitmapData = {
			buf8,
			indices,
			imgData,
			imgLen,
			rowSize,
			lastRow
		};
    }

	drawWaterfall(data) {
		const { buf8, rowSize, imgLen, imgData, indices, lastRow } = this.bitmapData;
		const ctx = this.ctx;
        const width = this.width;
        const palette = this.palette;

		// this scrolls up one row
        buf8.set(buf8.subarray(rowSize, imgLen));

		// updata the bottom row
        let idx = lastRow;
        for (let x = 0; x < width; x++) {
            const v = data[indices[x]];
            const pix = palette[v];
            buf8[idx++] = pix[0];
            buf8[idx++] = pix[1];
            buf8[idx++] = pix[2];
            buf8[idx++] = 255;
        }
        imgData.data.set(buf8);
        ctx.putImageData(imgData, 0, 0);
    }


	drawTuner() {
		const MAX_FREQ = this.MAX_FREQ;
		const width = this.width;
		const height = this.height;
		const frequency = this.frequency;
		const ctx = this.ctx;

		const pixPerHz = 1 / MAX_FREQ * width;

		let x = frequency * pixPerHz;
		const bw = 32;  // this.par.bandwidth;
		const bww = bw * pixPerHz;
		const bwlo = (frequency - bw * 0.5) * pixPerHz;

		ctx.fillStyle = "rgba(255,255,255,0.25)";
		ctx.fillRect(bwlo, 0, bww, height);
		ctx.strokeStyle = "rgb(255,64,64)";
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();

		const top = height - 15;

		for (let hz = 0; hz < MAX_FREQ; hz += 100) {
			if ((hz % 1000) === 0) {
				ctx.strokeStyle = "red";
				ctx.beginPath();
				x = hz * pixPerHz;
				ctx.moveTo(x, top);
				ctx.lineTo(x, height);
				ctx.stroke();
			} else {
				ctx.strokeStyle = "white";
				ctx.beginPath();
				x = hz * pixPerHz;
				ctx.moveTo(x, top + 10);
				ctx.lineTo(x, height);
				ctx.stroke();
			}
		}

		ctx.fillStyle = "cyan";
		for (let hz = 0; hz < MAX_FREQ; hz += 500) {
			x = hz * pixPerHz - 10;
			ctx.fillText(hz.toString(), x, top + 14);
		}
	}

	/**
	 * Plot mode-specific decoder graph data.
	 * This method expects the data to be an array of [x,y] coordinates,
	 * with x and y ranging from -1.0 to 1.0.  It is up to the mode generating
	 * this array to determine how to draw it, and what it means.
	 */
	drawScope() {
		const len = this.scopeData.length;
		if (len < 1) {
			return;
		}
		const ctx = this.ctx;
		const boxW = 100;
		const boxH = 100;
		const boxX = this.width - boxW;
		const boxY = 0;
		const centerX = boxX + (boxW >> 1);
		const centerY = boxY + (boxH >> 1);

		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.rect(boxX, boxY, boxW, boxH);
		ctx.stroke();
		ctx.clip();

		ctx.beginPath();
		ctx.moveTo(centerX, boxY);
		ctx.lineTo(centerX, boxY + boxH);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(boxX, centerY);
		ctx.lineTo(boxX + boxW, centerY);
		ctx.stroke();

		ctx.strokeStyle = "yellow";
		ctx.beginPath();
		let pt = this.scopeData[0];
		let x = centerX + pt[0] * 50.0;
		let y = centerY + pt[1] * 50.0;
		ctx.moveTo(x, y);
		for (let i = 1; i < len; i++) {
			pt = this.scopeData[i];
			x = centerX + pt[0] * 50.0;
			y = centerY + pt[1] * 50.0;
			// console.log("pt:" + x + ":" + y);
			ctx.lineTo(x, y);
		}
		ctx.stroke();

		// all done
		ctx.restore();
	}

	/**
	 * @param data {Uint8Array}
	 */
	redraw(data) {
		this.drawWaterfall(data);
		// this.drawSpectrum(data);
		this.drawTuner();
		this.drawScope();
	}

	showScope(data) {
		this.scopeData = data;
	}

	/**
	 * @param data {Uint8Array}
	 */
	update() {
		if (!this.interval) {
			return;
		}
		const data = this.par.audioInput.getFftData();
		requestAnimationFrame(() => {
			this.redraw(data);
		});
	}

	start() {
		this.interval = setInterval(() => {
			this.update();
		}, 100);
	}

	stop() {
		clearInterval(this.interval);
		this.interval = null;
	}

}
