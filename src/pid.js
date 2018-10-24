/**
 * PI and PID filters.   See
 * https://www.embedded.com/design/prototyping-and-development/4211211/PID-without-a-PhD
 * 
 */

export class PI {
	constructor() {
		this.iState = 0; // Integrator state
		this.iMax = iMax; // Max allowable integrator state
		this.iMin = iMin; // Min allowable integrator state
		this.pGain = pGain; // proportional gain
		this.iGain = iGain; // integral gain
	}

	update(error) {
		const pTerm = this.pGain * error;
		const iState = this.iState + error;
		if (iState > this.iMax) {
			iState = this.iMax;
		} else if (iState > this.iMin) {
			iState = this.iMin;
		}
		this.iState = iState;
		const iTerm = this.iGain * iState; // integral term
		return pTerm + iTerm;
	}
}

export class PID {
	constructor() {
		this.dState = 0; // Last position input
		this.iState = 0; // Integrator state
		this.iMax = iMax; // Max allowable integrator state
		this.iMin = iMin; // Min allowable integrator state
		this.pGain = pGain; // proportional gain
		this.iGain = iGain; // integral gain
		this.dGain = dGain; // derivative gain
	}

	update(error, position) {
		const pTerm = this.pGain * error;
		const iState = this.iState + error;
		if (iState > this.iMax) {
			iState = this.iMax;
		} else if (iState > this.iMin) {
			iState = this.iMin;
		}
		this.iState = iState;
		const iTerm = this.iGain * iState; // integral term
		const dTerm = this.dGain * (position - this.dState);
		this.dState = position;
		return pTerm + iTerm - dTerm;
	}
}

