import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SPage, SText } from 'servisofts-component';
import TextArea from '../Components/QueryTool/TextArea';

import JsSIP from 'jssip';
import Phone from '../Components/SIP/Phone';

const text = `
`


export default class ricky extends Component {

    ua: JsSIP.UA | null = null;
    componentDidMount(): void {
        const socket = new JsSIP.WebSocketInterface('ws://192.168.2.3:8088/ws');

        const configuration = {
            sockets: [socket],
            uri: 'sip:50002@192.168.2.3',
            password: 'servisofts'
        };

        this.ua = new JsSIP.UA(configuration);
        this.ua.start();
        this.ua.on('registered', () => {
            console.log('Registrado correctamente');
        });
        this.ua.on('registrationFailed', (e: any) => {
            console.error('Error al registrarse:', e.cause);
        });

        this.ua.on('newRTCSession', function (e: any) {
            const session = e.session;

            if (session.direction === 'incoming') {
                console.log('Llamada entrante');

                session.on('ended', () => console.log('Llamada terminada'));
                session.on('failed', () => console.log('Llamada fallida'));
                session.on('accepted', () => console.log('Llamada aceptada'));

                // Para responder automáticamente:
                session.answer({
                    mediaConstraints: { audio: true, video: false }
                });

                // O mostrar UI para aceptar/rechazar
                // session.terminate(); // si quieres colgar
            }
        });


    }
    componentWillUnmount(): void {
        if (this.call) {
            this.call.terminate();
        }
    }
    render() {
        return <SPage>
            <SInput ref={ref => this.phone = ref} defaultValue={"75395848"} />
            <SText onPress={() => {
                if (!this.ua) return;
                const session = this.ua.call(`sip:${this.phone.getValue()}@from-internal`, {
                    mediaConstraints: { audio: true, video: false },
                    pcConfig: {
                        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                    },
                    rtcOfferConstraints: {
                        offerToReceiveAudio: 1,
                        offerToReceiveVideo: 0
                    }
                });

                this.call = session;
                session.on('failed', (e) => {

                    console.error('Código de fallo SIP:', e.message, '-', e.cause);
                    // console.error('Llamada fallida:', e.cause);
                });

                session.on("ended", (e: any) => {
                    console.log("Llamada terminada:", e);
                })

                session.on("accepted", (e: any) => {
                    console.log("Llamada aceptada:", e);
                    // Reproducir en el navegador
                    // const remoteAudio = document.createElement("audio");
                    // remoteAudio.autoplay = true;
                    // remoteAudio.srcObject = e.session.connection.getRemoteStreams()[0];
                    // document.body.appendChild(remoteAudio);
                })

                session.connection.addEventListener("track", (event) => {
                    const remoteAudio = document.createElement("audio");
                    remoteAudio.autoplay = true;
                    remoteAudio.srcObject = event.streams[0];
                    document.body.appendChild(remoteAudio);
                    console.log("🔊 Audio conectado");
                });
                // session.on("update", (e: any) => {
                //     console.log("Llamada actualizada:", e);
                // })
                // session.addListener("track", (e: any) => {
                //     console.log("Track recibido:", e.track);
                //     // Reproducir en el navegador
                //     const remoteAudio = document.createElement("audio");
                //     remoteAudio.autoplay = true;
                //     remoteAudio.srcObject = e.streams[0];
                //     document.body.appendChild(remoteAudio);
                // })
                // session.unmute();
                // 
            }}>{"CALL"}</SText>
            <SText onPress={() => {
                if (!this.call) return;
                this.call.terminate();
            }}
            >{"STOP"}</SText>
            {/* <TextArea
                pk="ricky"
                type='MD'
                defaultValue={text}
            /> */}
            <Phone  defaultValue='75395848'/>
        </SPage>
    }
}
