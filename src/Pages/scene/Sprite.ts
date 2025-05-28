import * as THREE from 'three';
import { TextureLoader } from '../../Components/SThree';

export default class Sprite extends THREE.Mesh {

    url: string;
    texture?: THREE.Texture;
    col: number;
    row: number;
    numberOfTiles: number;
    currentTile = 0;
    tileDisplayDuration = 1000 / 24; // Duración de cada frame en milisegundos.
    currentDisplayTime = 0;
    // opacity: number;
    constructor(props: { url: string, col: number, row: number, width: number, height: number, tileDisplayDuration?: number }) {
        const geometry = new THREE.PlaneGeometry(props.width, props.height);
        super(geometry, new THREE.MeshBasicMaterial({ alphaHash: true, opacity: 0, }))

        if (props.tileDisplayDuration) {
            this.tileDisplayDuration = props.tileDisplayDuration;
        }
        this.url = props.url;
        this.col = props.col;
        this.row = props.row;
        // this.opacity = props.opacity;
        this.numberOfTiles = props.col * props.row;
        this.loadTexture();
        // const material = new THREE.MeshBasicMaterial({ map: texture });

    }

    async loadTexture() {
        const textureLoader = new TextureLoader();
        textureLoader.load(this.url, (newTexture) => {
            this.texture = newTexture;
            this.texture.repeat.set(1 / this.col, 1 / this.row);
            this.material = new THREE.MeshBasicMaterial({ map: this.texture, alphaHash: true, opacity: 1, alphaTest: 0.5 });
        })
    }
    update(props: { delta: any }) {
        this.currentDisplayTime += (props.delta * 1000);
        if (this.currentDisplayTime >= this.tileDisplayDuration) {
            this.currentDisplayTime = 0;
            this.currentTile++;
            this.currentTile = this.currentTile % this.numberOfTiles;

            const currentColumn = this.currentTile % this.col;
            const currentRow = Math.floor(this.currentTile / this.col);
            if (this.texture) {
                this.texture.offset.x = currentColumn / this.col;
                this.texture.offset.y = 1 - (currentRow + 1) / this.row;
            }

        }
    }
    updateToCamera(props: { delta: any, camera: THREE.Camera }) {
        // Hacer que el sprite siempre mire hacia la cámara.
        const cameraPosition = props.camera.position.clone();
        this.lookAt(cameraPosition);
        // TODO: quiero que siempre mire hacia la camara 
    }
}