/**
 * @return {Timer}
 */
function createEarlyLate(samplesPerSymbol) {
    let size = Math.round(samplesPerSymbol);
    let half = Math.floor(samplesPerSymbol * 0.5);
    let buf = new Float32Array(size);
    let bitclk = 0.0;

    function update(r, i, f) {
        let idx = Math.round(bitclk);
        let sum = 0.0;
        let ampsum = 0.0;
        let mag = r * r + i * i;
        buf[idx] = 0.8 * buf[idx] + 0.2 * mag;

        for (let i = 0; i < half; i++) {
            sum += (buf[i] - buf[i + half]);
            ampsum += (buf[i] + buf[i + half]);
        }

        let err = (ampsum === 0.0) ? 0.0 : sum / ampsum * 0.2;
        bitclk += (1.0 - err);
        if (bitclk < 0) {
            bitclk += size;
        } else if (bitclk >= size) {
            bitclk -= size;
            f(r, i);
        }
    }

    return {
        update: update
    };
}

export const Timer = {
	earlyLate: createEarlyLate
}