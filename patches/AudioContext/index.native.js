import RNFS from 'react-native-fs';
import * as FileSystem from 'expo-file-system';
import base64js from 'base64-js';
import Sound from 'react-native-sound';
import { generateUUID } from 'three/src/math/MathUtils';
import { Quaternion, Vector3 } from 'three';
let _context;


class AudioContext {
	static getContext() {
		if (_context === undefined) {
			_context = new AudioContextNative();

		}
		return _context;
	}

	static setContext(value) {

		_context = value;

	}

}

const log = (...e) => {
	console.log(...e);
}


class GainObject {
	value = 1;
	setTargetAtTime(rate, curtime, delta) {
		// Este metodo es para meter el 
		log("GainObject setTargetAtTime")
	}
}

class Gain {
	gain = new GainObject();
	coneccteds = [];
	camera;
	constructor(camera) {
		this.camera = camera;
	}
	getCamera() {
		if (this.camera) return this.camera;
		let camera = null;
		this.coneccteds.forEach(e => {
			const cam = e.getCamera();
			if (cam) camera = cam;
		})
		return camera;

	}
	setAudioNode(au) {
		this.audioNode = au;
	}
	getAudioNode() {
		if (this.audioNode) return this.audioNode;
		let audioNode = null;
		this.coneccteds.forEach(e => {
			const cam = e.getAudioNode();
			if (cam) audioNode = cam;
		})
		return audioNode;

	}
	connect(destination) {
		this.coneccteds.push(destination);
	}
	disconnect(destination) {
		const index = this.coneccteds.indexOf(destination);
		if (index !== -1) {
			this.coneccteds.splice(index, 1);
			// Aquí podrías agregar código para desconectar físicamente el destino, por ejemplo:
			// this.gain.disconnect(destination);
		}
	}



}

class Listener {

	_position = /*@__PURE__*/ new Vector3();
	_forward = /*@__PURE__*/ new Vector3();
	_up = /*@__PURE__*/ new Vector3();

	context;
	constructor(audioContext) {
		this.context = audioContext
	}
	// _quaternion = /*@__PURE__*/ new Quaternion();
	// _scale = /*@__PURE__*/ new Vector3();
	// _orientation = /*@__PURE__*/ new Vector3();

	setPosition(x, y, z) {
		this._position.set(x, y, z)
		// log("Listener setPosition")
	}
	setOrientation(x, y, z, ux, uy, uz) {
		this._forward.set(x, y, z).normalize();
		this._up.set(ux, uy, uz).normalize();
	}
}


class AudioContextNative {

	listener = new Listener(this);
	destination = new Gain(this.listener);
	constructor() {
		log("AudioContextNative constructor")
	}

	// coneccteds = [];
	// connect(destination) {
	// 	this.coneccteds.push(destination);
	// }
	// disconnect(destination) {
	// 	const index = this.coneccteds.indexOf(destination);
	// 	if (index !== -1) {
	// 		this.coneccteds.splice(index, 1);
	// 		// Aquí podrías agregar código para desconectar físicamente el destino, por ejemplo:
	// 		// this.gain.disconnect(destination);
	// 	}
	// }

	createGain() {
		log("AudioContextNative createGain")
		return new Gain();
	}
	createPanner() {
		log("AudioContextNative createPanner")
		return new Panner();
	}
	createBufferSource() {
		return new AudioNode();
	}

	async decodeAudioData(bufferCopy, callback) {
		log("AudioContextNative decodeAudioData")
		callback(bufferCopy)
	}
}
class AudioNode {
	buffer
	loop
	loopStart
	loopEnd
	onended
	player;
	fileUri;
	playbackRate = {
		setTargetAtTime: (rate, curtime, delta) => {
			log("AudioNode playbackRate setTargetAtTime")
		}
	}
	detune = {
		setTargetAtTime: (rate, curtime, delta) => {
			log("AudioNode detune setTargetAtTime")
		}
	}

	gain;

	connect(gain) {
		this.gain = gain.gain;
		console.log("Insertando audioNode", this.gain)
		this.gain.setAudioNode(this);
		console.log("Insertando audioNode exito", this.gain)

		// this.gain.audioNode = this;
	}
	disconnect(gain) {
		console.log("removiendo audioNode")
		// this.gain.setAudioNode(null);
		this.gain = null;
	}


	getPlayer() {
		return new Promise((resolve, reject) => {
			const INSTANCE = this;
			if (INSTANCE.player) {
				resolve(INSTANCE.player);
				return;
			}
			const byteArray = new Uint8Array(this.buffer);
			const base64String = base64js.fromByteArray(byteArray);
			this.fileUri = `${FileSystem.documentDirectory}${generateUUID()}.mp4`;

			RNFS.writeFile(this.fileUri, base64String, "base64").then(() => {
				const player = new Sound(this.fileUri, Sound.MAIN_BUNDLE, (error) => {
					if (error) {
						console.log('failed to load the sound', error);
						reject(error);
						return;
					}

					INSTANCE.player = player;
					resolve(player);
					return;
				})

			}).catch(e => {
				reject(e);
			})

		})

	}
	start(startAt, progress, duration) {
		log("AudioNode start")
		this.getPlayer().then(player => {
			log("AudioNode start loadPlayer")
			player.setNumberOfLoops(this.loop ? -1 : 1)
			// player.setVolume(0.1);
			// Position the sound to the full right in a stereo field
			// whoosh.setPan(1);
			// player.play((succes) => {
			// 	if (this.onended) {
			// 		this.onended(succes);
			// 	}
			// });
		}).catch(e => {
			console.error(e);
		})

	}
	stop(startAt, progress, duration) {
		log("AudioNode stop")
		this.getPlayer().then(player => {
			player.stop()
		});
	}
}





class Panner {
	panningModel = 'HRTF';
	refDistance;
	rolloffFactor;
	distanceModel;
	maxDistance;
	coneInnerAngle;
	coneOuterAngle;
	coneOuterGain;
	_position = /*@__PURE__*/ new Vector3();
	_orientation = /*@__PURE__*/ new Vector3();
	gain;
	lastCameraCheck = 0;  // Timestamp de la última vez que se ejecutó getCamera
	cameraCheckInterval = 100;  // Intervalo en milisegundos

	connect(gain) {
		this.gain = gain;
		console.log("Connect panner", this.gain);
	}
	disconnect(gain) {
		this.gain = null;
	}


	lastDistance = 0;
	getCamera() {
		const now = Date.now();
		if (now - this.lastCameraCheck < this.cameraCheckInterval) {
			return;  // Salir si no han pasado 100ms desde la última ejecución
		}

		this.lastCameraCheck = now;
		if (!this.gain) return;
		const camera = this.gain.getCamera();
		if (camera) {
			const distance = camera._position.distanceTo(this._position);
			if (this.lastDistance == distance) {
				return;
			}
			this.lastDistance = distance;

			const maxDistance = this.maxDistance ?? 100;
			if (distance >= maxDistance) {
				if (this.isPlaying) {
					const audioNode = this.gain.getAudioNode();
					if (audioNode) {
						if (audioNode.player) {
							audioNode.player.stop()
							this.isPlaying = false;
						}
					}
				}

			} else {
				const audioNode = this.gain.getAudioNode();
				if (audioNode) {
					if (audioNode.player) {
						const player = audioNode.player;
						const volume = 1 - (distance / maxDistance);
						if (distance >= (this.refDistance ?? 0)) {
							player.setVolume(volume);
						} else {
							player.setVolume(1);
						}
						// player.setPan(1);
						if (!this.isPlaying) {
							player.play()
							this.isPlaying = true;
						}

					}
				}

			}


			// calcular la distancia
		}

	}
	setPosition(x, y, z) {
		this._position.set(x, y, z)
		this.getCamera();

	}
	setOrientation(x, y, z) {
		this._orientation.set(x, y, z)
		this.getCamera();
	}
}

export { AudioContext };
