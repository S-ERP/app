
import JsSIP from 'jssip';
import { ConnectingEvent } from 'jssip/lib/RTCSession';


const ws = "ws://192.168.2.3:8088/ws";

const sip = "sip:50002@192.168.2.3";
const sipPassword = "servisofts";


export default class SIP {
    socket = new JsSIP.WebSocketInterface(ws);
    configuration = {
        sockets: [this.socket],
        uri: sip,
        password: sipPassword
    };
    ua = new JsSIP.UA(this.configuration);

    constructor() {
        this.ua.start();
    }
    call(phone: String, onEvent: (e: string, event: any) => void = () => { }) {

        phone = phone.toString().replace(/[^0-9]/g, ""); // Eliminar caracteres no numéricos
        phone = phone.toString().replace(" ", ""); // Eliminar espacios en blanco
        if (phone.startsWith("591")) {
            phone = phone.slice(3);
        }
        const session = this.ua.call(`sip:${phone}@from-internal`, {
            mediaConstraints: { audio: true, video: false },
            pcConfig: {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            },
            rtcOfferConstraints: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 0
            }
        });

        session.on('connecting', (e: ConnectingEvent) => {
            onEvent("connecting", e);
            // console.log("Llamada conectando:", e);
        });
        session.on('failed', (e) => {
            onEvent("failed", e);
            // console.error('Código de fallo SIP:', e.message, '-', e.cause);
            // console.error('Llamada fallida:', e.cause);
        });

        session.on("ended", (e: any) => {
            onEvent("ended", e);
            // console.log("Llamada terminada:", e);
        })

        session.on("accepted", (e: any) => {
            onEvent("accepted", e);
            // console.log("Llamada aceptada:", e);
            // Reproducir en el navegador
            // const remoteAudio = document.createElement("audio");
            // remoteAudio.autoplay = true;
            // remoteAudio.srcObject = e.session.connection.getRemoteStreams()[0];
            // document.body.appendChild(remoteAudio);
        })
        console.log("DIDD", session.id); // Aquí puedes ver el ID de la sesión
        // session.on('', (event, channel) => {
        //     console.log('UNIQUEID:', channel.id); // <-- Este es el que te interesa
        // });
        // @ts-ignore
        session.connection.addEventListener("track", (event) => {
            // @ts-ignore
            const remoteAudio = document.createElement("audio");
            remoteAudio.autoplay = true;
            remoteAudio.srcObject = event.streams[0];
            // @ts-ignore
            document.body.appendChild(remoteAudio);
            console.log("🔊 Audio conectado");
        });
        return session;
    }
}