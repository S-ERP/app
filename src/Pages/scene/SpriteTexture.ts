import * as THREE from 'three';

export default class SpriteTexture {

    texture?: THREE.Texture;
    col: number;
    row: number;
    numberOfTiles: number;
    currentTile = 0;
    tileDisplayDuration = 1000 / 24; // Duración de cada frame en milisegundos.
    currentDisplayTime = 0;
    // opacity: number;
    constructor(props: { texture: THREE.Texture, col: number, row: number, tileDisplayDuration?: number }) {
        // const geometry = new THREE.PlaneGeometry(props.width, props.height);
        // super(geometry, new THREE.MeshBasicMaterial({ alphaHash: true, opacity: 0, }))

        if (props.tileDisplayDuration) {
            this.tileDisplayDuration = props.tileDisplayDuration;
        }
        this.texture = props.texture;
        this.col = props.col;
        this.row = props.row;
        this.texture.repeat.set(1 / this.col, 1 / this.row);
        this.numberOfTiles = props.col * props.row;
        // const material = new THREE.MeshBasicMaterial({ map: texture });

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
        // const cameraPosition = props.camera.position.clone();
        // this.lookAt(cameraPosition);
        // TODO: quiero que siempre mire hacia la camara 
    }
}