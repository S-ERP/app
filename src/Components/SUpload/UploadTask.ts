import { SUuid } from "servisofts-component";
import { DBUploadTask, SUploadProps } from ".";
import { EventEmitter } from "events";

import Functions from "./Functions";

export default class UploadTask extends EventEmitter {
    key: string
    isPaused;
    isUploading;
    isCompleted;
    props: SUploadProps;
    chunkSize;
    currentChunk;
    request: XMLHttpRequest;
    url: string;
    file: any;
    progress;
    constructor(props: SUploadProps) {
        super();
        this.key = SUuid();
        this.props = props;
        this.progress = 0;
        this.url = props.host + props.path
        this.file = props.file
        this.chunkSize = 1024 * 1024; // 1MB
        this.currentChunk = 0;
        this.request = new XMLHttpRequest();
        this.isPaused = false;
        this.isUploading = false;

    }


    // calculateCurrentProgress() {
    //     const start = this.currentChunk * this.chunkSize;

    // }
    async uploadChunk(start) {

        // console.log(this.file)
        const chunk = await Functions.readFileChunk(this.file, start, start + this.chunkSize);
        // const chunk = this.file.slice(start, start + this.chunkSize);
        // const filePath = Platform.OS === 'android' ? this.file.uri : this.file.uri.replace('file://', '')
        // const filePath = this.file.uri;
        // let chunk: any = null;
        // try {
        //     chunk = await this.readFileChunk(filePath, start, start + this.chunkSize);
        // } catch (error) {
        //     console.log(error)
        // }

        // console.log("chunk", chunk)
        this.request = new XMLHttpRequest();

        const chunkNumber = this.currentChunk;
        const totalChunks = Math.ceil(this.file.size / this.chunkSize);
        this.request.open('POST', this.url + `?chunkNumber=${chunkNumber}&totalChunks=${totalChunks}`, true);
        this.request.setRequestHeader('Content-Type', 'application/octet-stream');
        // this.request.setRequestHeader('Access-Control-Allow-Origin', '*');

        this.request.upload.addEventListener('progress', (e) => {
            // console.log("progress", e);
            if (e.lengthComputable) {
                const percentComplete = ((start + e.loaded) / this.file.size) * 100;
                // console.log(`Chunk progress: ${percentComplete}%   ${start} + ${e.loaded} / ${this.file.size}`);
                this.progress = percentComplete;
                this.emit('progress', { type: 'progress', progress: percentComplete, key: this.key });
            }
        });

        this.request.onreadystatechange = () => {
            if (this.request.readyState === XMLHttpRequest.DONE) {
                if (this.request.status === 200) {
                    // console.log('Chunk uploaded');
                    if (start + this.chunkSize < this.file.size && !this.isPaused) {
                        this.currentChunk++;
                        this.uploadChunk(this.currentChunk * this.chunkSize);
                    } else if (this.isPaused) {
                        console.log('Upload paused');
                    } else {
                        this.isCompleted = true;
                        this.emit('complete', { type: 'complete', key: this.key });
                        delete DBUploadTask[this.key]
                        console.log('Upload complete');
                    }
                } else {
                    console.error('Upload error', this.request.statusText);
                }
            }
        };

        // const blob = new Blob([chunk], { type: this.file.type, lastModified: this.file.lastModified });
        this.request.send(chunk);
    }



    start() {

        if (!this.isUploading) {
            this.isUploading = true;
            console.log('start');
            this.uploadChunk(this.currentChunk * this.chunkSize);
        }
    }

    pause() {
        if (this.isUploading) {
            console.log('pause');
            this.isPaused = true;
            this.request.abort();
            this.emit('pause', { type: 'pause', key: this.key });
        }
    }

    resume() {
        if (this.isPaused) {
            console.log('resume');
            this.isPaused = false;
            this.uploadChunk(this.currentChunk * this.chunkSize);
            this.emit('resume', { type: 'resume', key: this.key });

        }
    }
}