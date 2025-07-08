import React from "react";
import { GestureResponderEvent, TouchableOpacity, UIManager, ViewStyle } from "react-native";
import { SImage, SText, SUuid } from "servisofts-component";


export default class DropZoneWeb extends React.Component<{ children: any, handleDropFiles?: (files: File[]) => void }> {
    key: string = SUuid();
    componentDidMount(): void {
        // @ts-ignore
        const dropzone = document.getElementById("DropZone_" + this.key);
        if (dropzone) {
            this.configureDropZone(dropzone);
        } else {
            console.error("DropZone element not found");
        }
    }


    configureDropZone = (dropzone: any) => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e: any) => e.preventDefault());
            dropzone.addEventListener(eventName, (e: any) => e.stopPropagation());
        });
        dropzone.addEventListener('dragover', () => dropzone.classList.add('hover'));
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('hover'));
        dropzone.addEventListener('drop', () => dropzone.classList.remove('hover'));
        dropzone.addEventListener('drop', (e: any) => {
            const files = e.dataTransfer.files;
            if(this.props.handleDropFiles) {
                this.props.handleDropFiles(Array.from(files));
            }
        });
    }


    render() {
        return <div id={"DropZone_" + this.key} style={{
            width: "100%",
            height: "100%",
        }}>
            {this.props.children}
        </div>
    }
}