/**
 * For reference.  See code below
 */
export function LowPassIIR(cutoff, sampleRate) {
    let b = Math.exp(-2.0 * Math.PI * cutoff / sampleRate);
    let a = 1.0 - b;
    let z = 0.0;

    return {
        update : function(v) {
            z = v * a + z * b;
            return z;
        }
    };
}