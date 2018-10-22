import { Utf8 } from "../src/utf8";

const RAVEN = `
Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore-
    While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
"'Tis some visitor,” I muttered, "tapping at my chamber door-
			Only this and nothing more.”
`;

export class ModeTester {
	constructor(ModeClass) {
		this.sampleRate = 8000.0;
		this.mode = new ModeClass(this);
	}

	execute() {
		const mode = this.mode;
		let outBuf = [];
		const exp = RAVEN;
		mode.receiveOutput = (bytes) => {
			outBuf = outBuf.concat(bytes);
		};
		mode.sendText(exp);
		while(true) {
			const data = mode.transmitSignal();
			mode.receiveSignal(data); //receiver needs to see the final null
			if (!data) {
				break;
			}
		}
		const result = Utf8.toString(outBuf);
		expect(result).toEqual(exp);
	}
}