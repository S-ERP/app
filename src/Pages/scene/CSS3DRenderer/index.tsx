import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Rect, Svg } from 'react-native-svg';
import { SImage } from 'servisofts-component';
import * as THREE from "three"

interface CSS3DRendererProps {
    children: any
}

const initialAnimatedView = {
    width: 0,
    height: 0,
    perspective: 800,
    translateZ: 0,
    translateX: 0,
    translateY: 0,
    scaleX: 1, scaleY: 1,


}

const initialAnimatedObject = {
    width: 0,
    height: 0,
    perspective: 800,
    translateZ: 0,
    translateX: 0,
    translateY: 0,
    scaleX: 1, scaleY: 1,
    matrix: [0]


}
const initialAnimatedCamera = {
    width: 0,
    height: 0,
    perspective: 800,
    translateZ: 0,
    translateX: 0,
    translateY: 0,
    rotateZ: 0,
    rotateX: 0,
    rotateY: 0,
    scaleX: 1, scaleY: 1,
    matrix: [0]
}

function epsilon(value: number) {

    return Math.abs(value) < 1e-10 ? 0 : value;

}
function getCameraCSSMatrix(matrix: THREE.Matrix) {
    const elements = matrix.elements;
    return [
        epsilon(elements[0]),
        epsilon(- elements[1]),
        epsilon(elements[2]),
        epsilon(elements[3]),
        epsilon(elements[4]),
        epsilon(- elements[5]),
        epsilon(elements[6]),
        epsilon(elements[7]),
        epsilon(elements[8]),
        epsilon(- elements[9]),
        epsilon(elements[10]),
        epsilon(elements[11]),
        epsilon(elements[12]),
        epsilon(- elements[13]),
        epsilon(elements[14]),
        epsilon(elements[15])
    ]

}


function getObjectCSSMatrix(matrix: THREE.Matrix) {

    const elements = matrix.elements;
    const matrix3d = [
        epsilon(elements[0]),
        epsilon(elements[1]),
        epsilon(elements[2]),
        epsilon(elements[3]),
        epsilon(- elements[4]),
        epsilon(- elements[5]),
        epsilon(- elements[6]),
        epsilon(- elements[7]),
        epsilon(elements[8]),
        epsilon(elements[9]),
        epsilon(elements[10]),
        epsilon(elements[11]),
        epsilon(elements[12]),
        epsilon(elements[13]),
        epsilon(elements[14]),
        epsilon(elements[15])
    ]
    return matrix3d;

}
interface CSS3DObjectProps {
    width: number,
    height: number,
}

export const CSS3DObjectElement = React.forwardRef((props: CSS3DObjectProps, ref) => {
    const [visible, setVisible] = React.useState(true);
    // const [matrix, setMatrix] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const matrix = useSharedValue([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const translateZ = useSharedValue(0);
    React.useImperativeHandle(ref, () => ({
        isCSS3DObjectElement: true,
        // render: render,
        setMatrix: setMatrix,
        setTranslateX: setTranslateX,
        setTranslateY: setTranslateY,
        setVisible: setVisible,

    }));
    const setTranslateX = (val: number) => {
        // console.log("trnaslaetX", val)
        translateX.value = val;
    }
    const setTranslateY = (val: number) => {
        translateY.value = val;
    }
    const setMatrix = (m: number[]) => {
        // console.log(m);
        matrix.value = [...m]
    }

    const animatedStyle = useAnimatedStyle(() => {
        // Cálculo de las transformaciones
        const _translateX = matrix.value[12];
        const _translateY = matrix.value[13];
        const _translateZ = matrix.value[14];
        const _scaleX = Math.sqrt(matrix.value[0] ** 2 + matrix.value[1] ** 2 + matrix.value[2] ** 2);
        const _scaleY = Math.sqrt(matrix.value[4] ** 2 + matrix.value[5] ** 2 + matrix.value[6] ** 2);
        const _rotateZ = Math.atan2(matrix.value[1], matrix.value[0]); // Rotación en Z
        const _rotateX = Math.atan2(matrix.value[9], matrix.value[10]);
        const _rotateY = Math.atan2(-matrix.value[8], Math.sqrt(matrix.value[9] ** 2 + matrix.value[10] ** 2));
        return {
            transform: [
                // { perspective: perspective.value },
                { translateX: _translateX + (translateX.value - (props.width / 2)) },
                { translateY: _translateY + translateY.value - (props.width / 2) },
                { scaleX: _scaleX },
                { scaleY: _scaleY },
                { rotateX: `${_rotateX}rad` },
                { rotateY: `${_rotateY}rad` },
                { rotateZ: `${_rotateZ}rad` },
            ],
        };
    });
    if (!visible) return null;
    // props.width

    return <Animated.View style={[{ width: props.width, height: props.height, backgroundColor: "#f0f" }, animatedStyle]}>

    </Animated.View>
})
export class CSS3DObject extends THREE.Object3D {

    element: any;
    constructor(element: any) {
        if (!element.isCSS3DObjectElement) throw "element no type CSS3DObjectElement"
        super();
        // @ts-ignore
        this.isCSS3DObject = true;

        this.element = element;
        // this.element.style.position = 'absolute';
        // this.element.style.pointerEvents = 'auto';
        // this.element.style.userSelect = 'none';

        // this.element.setAttribute('draggable', false);
        const INSTANCE = this;
        this.addEventListener('removed', function () {
            INSTANCE.traverse((object) => {
                console.log(object);
                // if (object.element instanceof Element && object.element.parentNode !== null) {

                //     object.element.parentNode.removeChild(object.element);

                // }
            });
        });

    }
    copy(source: any, recursive: any) {
        super.copy(source, recursive);
        // this.element = source.element;
        return this;

    }
}

const CSS3DRenderer = React.forwardRef((props: CSS3DRendererProps, ref) => {
    const animatedView = useSharedValue(initialAnimatedView);
    const animatedCamera = useSharedValue(initialAnimatedCamera);
    // const width = useSharedValue(0);
    // const height = useSharedValue(0);

    React.useImperativeHandle(ref, () => ({
        render: render,
        setSize: setSize
    }));

    const cache = {
        camera: { style: '' },
        objects: new WeakMap()
    };

    let _height = 0;
    let _width = 0;
    let _widthHalf = 0;
    let _heightHalf = 0;
    const _this = this;

    const setSize = (w: number, h: number) => {
        _width = w;
        _height = h;
        _widthHalf = w / 2;
        _heightHalf = h / 2;

        animatedView.value.width = _width;
        animatedView.value.height = _height;
        animatedCamera.value.width = _width;
        animatedCamera.value.height = _height;

        animatedView.value = { ...animatedView.value }
        animatedCamera.value = { ...animatedCamera.value }
        // domElement.style.width = width + 'px';
        // domElement.style.height = height + 'px';

        // viewElement.style.width = width + 'px';
        // viewElement.style.height = height + 'px';

        // cameraElement.style.width = width + 'px';
        // cameraElement.style.height = height + 'px';

    };
    const render = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
        const fov = camera.projectionMatrix.elements[5] * _heightHalf;


        if (camera.view && camera.view.enabled) {
            animatedView.value.translateX = - camera.view.offsetX * (_width / camera.view.width);
            animatedView.value.translateX = - camera.view.offsetX * (_width / camera.view.width);
            animatedView.value.scaleX = camera.view.fullWidth / camera.view.width;
            animatedView.value.scaleY = camera.view.fullHeight / camera.view.height;

        } else {
            animatedView.value = initialAnimatedView;

        }

        if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

        let tx, ty;

        // // @ts-ignore
        // if (camera.isOrthographicCamera) {
        //     const ocamera = camera as THREE.OrthographicCamera;
        //     tx = - (ocamera.right + ocamera.left) / 2;
        //     ty = (ocamera.top + ocamera.bottom) / 2;

        // }

        const scaleByViewOffset = camera.view && camera.view.enabled ? camera.view.height / camera.view.fullHeight : 1;

        animatedCamera.value.scaleX = scaleByViewOffset;
        animatedCamera.value.translateZ = fov;
        const cameraCSSMatrix = getCameraCSSMatrix(camera.matrixWorldInverse);
        animatedCamera.value.matrix = cameraCSSMatrix
        if (camera.isPerspectiveCamera) {
            animatedCamera.value.perspective = fov;
        }
        animatedCamera.value.translateX = _widthHalf;
        animatedCamera.value.translateY = _heightHalf;

        animatedView.value = { ...animatedView.value }
        animatedCamera.value = { ...animatedCamera.value }
        renderObject(scene, scene, camera, cameraCSSMatrix);

        // if (cache.camera.style !== style) {
        // cameraElement.style.transform = style;
        // cache.camera.style = style;
        // }

    }

    const hideObject = (object: any) => {
        // @ts-ignore
        if (object.isCSS3DObject) object.element.setVisible(false)

        for (let i = 0, l = object.children.length; i < l; i++) {

            hideObject(object.children[i]);

        }

    }
    const renderObject = (object: THREE.Object3D, scene: THREE.Scene, camera: THREE.PerspectiveCamera, cameraCSSMatrix: number[]) => {


        if (object.visible === false) {

            hideObject(object);

            return;

        }
        // @ts-ignore
        if (object.isCSS3DObject) {
            const visible = (object.layers.test(camera.layers) === true);

            const element = (object as CSS3DObject).element;
            // element.style.display = visible === true ? '' : 'none';

            if (visible === true) {

                // @ts-ignore
                object.onBeforeRender(_this, scene, camera);





                const matrix = getObjectCSSMatrix(object.matrixWorld);
                // translate(-50 %, -50 %)' +
                element.setMatrix(matrix)

                element.setTranslateX(_widthHalf)
                element.setTranslateY(_heightHalf)


                // const cachedObject = cache.objects.get(object);

                // if (cachedObject === undefined || cachedObject.style !== style) {

                // element.style.transform = style;

                // const objectData = { style: style };
                // cache.objects.set(object, objectData);

                // }

                // if (element.parentNode !== cameraElement) {

                //     cameraElement.appendChild(element);

                // }

                // @ts-ignore
                object.onAfterRender(_this, scene, camera);

            }

        }

        for (let i = 0, l = object.children.length; i < l; i++) {

            renderObject(object.children[i], scene, camera, cameraCSSMatrix);

        }
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: animatedView.value.width,
            height: animatedView.value.height,
            transform: [
                { perspective: animatedView.value.perspective },
                { translateX: animatedView.value.translateX },
                { translateY: animatedView.value.translateY },
                { scaleX: animatedView.value.scaleX },
                { scaleY: animatedView.value.scaleY },
                { matrix: animatedCamera.value.matrix }
                // { rotateX: `${rotateX.value}rad` },
                // { rotateY: `${rotateY.value}rad` },
                // { rotateZ: `${rotateZ.value}rad` },

                // { skewX: `${skewX.value}rad` },
                // { skewY: `${skewY.value}rad` },
            ],
        };
    });
    const animatedStyleCamera = useAnimatedStyle(() => {
        const matrix_ = animatedCamera.value.matrix;
        const translateX = matrix_[12]; // m41
        const translateY = matrix_[13]; // m42
        const scaleX = Math.sqrt(matrix_[0] * matrix_[0] + matrix_[1] * matrix_[1]);
        const scaleY = Math.sqrt(matrix_[4] * matrix_[4] + matrix_[5] * matrix_[5]);

        const rotation = Math.atan2(matrix_[1], matrix_[0]); // Asumiendo rotación en Z
        return {
            width: animatedCamera.value.width,
            height: animatedCamera.value.height,
            transform: [
                { perspective: animatedCamera.value.perspective },
                { translateX: translateX + animatedCamera.value.translateX - (animatedCamera.value.width / 2) },
                { translateY: translateY + animatedCamera.value.translateY - (animatedCamera.value.height / 2) },
                { scaleX: animatedCamera.value.scaleX * scaleX },
                { scaleY: animatedCamera.value.scaleY * scaleY },
                { rotateZ: `${rotation}rad` }
                // { matrix: animatedCamera.value.matrix }
            ],
        };
    });
    return <Animated.View style={[styles.container, animatedStyle]} pointerEvents={"none"}>

        <Animated.View style={[styles.camera, animatedStyleCamera]}>
            {props.children}
            {/* <SImage src={"https://drive.servisofts.com/http/texture/ricky.jpeg"} /> */}
        </Animated.View>
    </Animated.View>
})

export default CSS3DRenderer;

const styles = StyleSheet.create({
    container: {

        position: "absolute",
        transform: [
        ]
    },
    camera: {
        backgroundColor: "#ff00ff44",
        transform: [
        ]
    },
    plane: {
        width: 200,
        height: 200,
    }
});
