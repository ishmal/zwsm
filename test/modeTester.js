
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
		mode.sendText(RAVEN);
		while(true) {
			const data = mode.transmit();
			const outBytes = mode.receive(data); //receiver needs to see the final null
			outBuf = outBuf.concat(outBytes);
			if (!data) {
				break;
			}
		}
	}
}