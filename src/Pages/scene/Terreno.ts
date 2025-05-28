import * as THREE from 'three';
import { loadAsset, TextureLoader } from '../../Components/SThree';
import { AmmoType } from '../../Components/SThree/SAmmoView/index.native';

export default class Terreno extends THREE.Group {
    size = 500;
    mesh: THREE.Mesh;
    material:THREE.MeshStandardMaterial;
    constructor() {
        super();
        this.name = "Terreno"
        const floorGeometry = new THREE.PlaneGeometry(this.size, this.size);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x009900 });
        this.material = floorMaterial;
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.mesh = floor;
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = 0;
        this.mesh.receiveShadow = true;
        this.mesh.name = "TerrenoMesh"
        this.layers.set(1);
        this.add(this.mesh);
        this.init();
    }
    init() {
        const INSTANCE = this;
        loadAsset(require("../../Assets/png/sand_color.png")).then(bm => {
            const textureLoader = new TextureLoader();
            textureLoader.load(bm.localUri, function (texture) {
                // floorMaterial.color = 0xffffff
                INSTANCE.material.color = new THREE.Color(0xffffff)
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(100, 100);
                INSTANCE.material.map = texture;
                INSTANCE.material.needsUpdate = true;
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
        const planeBody:any = new Ammo.btRigidBody(planeRbInfo);
        planeBody.name = "terreno";
        planeBody.id = this.mesh.id;
        // planeBody.setFriction(0.8); // Ajusta este valor según sea necesario
        // planeBody.setRestitution(0.5);
        return planeBody;
    }
}