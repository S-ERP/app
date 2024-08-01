import React, { Component } from 'react'
import { SoundsType, SoundsPlayPropsType } from './type'
import { SThread } from 'servisofts-component';
export default class Sounds extends Component<SoundsType> {
    static play(obj: SoundsPlayPropsType) {
        const audio = new Audio(obj.src);
        let loopCount = 0;

        // Función para manejar la reproducción en bucle
        const playAudio = () => {
            audio.play();
            loopCount++;
            if ((loopCount < (obj.loops ?? 1)) || obj.loops < 0) {
                audio.addEventListener('ended', playAudio, { once: true });
            }
        };

        // Iniciar la reproducción
        playAudio();

        return audio;

    }
    render() {
        // return 
    }
}