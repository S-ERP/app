import React, { Component } from 'react'
import { SoundsType, SoundsPlayPropsType } from './type'
import Sound from 'react-native-sound';

export default class Sounds extends Component<SoundsType> {
    static play(obj: SoundsPlayPropsType) {
        var soundPlayer = new Sound(obj.src, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            console.log('duration in seconds: ' + soundPlayer.getDuration() + 'number of channels: ' + soundPlayer.getNumberOfChannels());
            soundPlayer.setNumberOfLoops(obj.loops)
            soundPlayer.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
            
        });
        
        return soundPlayer;
    }
    render() {
        return null;
    }
}