import * as THREE from 'three';
import { loadAsset, TextureLoader } from '../../../Components/SThree';
import { AmmoType } from '../../../Components/SThree/SAmmoView';

export default class Terreno extends THREE.Group {
    size = 500;
    constructor() {
        super();
        this.init();
    }
    init() {
        const floorGeometry = new THREE.PlaneGeometry(this.size, this.size);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x009900 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.add(floor);

        loadAsset(require("../../../Assets/png/pasto2.png")).then(bm => {
            const textureLoader = new TextureLoader();
            textureLoader.load(bm.localUri, function (texture) {
                // floorMaterial.color = 0xffffff
                floor.material.color = new THREE.Color(0x66ff66)
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(100, 100);
                floorMaterial.map = texture;
                floorMaterial.needsUpdate = true;
            }, undefined, (error) => {
                console.log(error)
            });
        })


    }

    createBody(props: { Ammo: AmmoType }) {
        const { Ammo } = props;
        // Ammo.js rigid body for the plane
        const planeTransform = new Ammo.btTransform();
        planeTransform.setIdentity();
        planeTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
        const planeMotionState = new Ammo.btDefaultMotionState(planeTransform);

        const planeColShape = new Ammo.btBoxShape(new Ammo.btVector3(this.size / 2, 0, this.size / 2));
        // planeColShape.setMargin(1);

        const planeRbInfo = new Ammo.btRigidBodyConstructionInfo(0, planeMotionState, planeColShape, new Ammo.btVector3(0, 0, 0));
        const planeBody = new Ammo.btRigidBody(planeRbInfo);
        return planeBody;
    }
}