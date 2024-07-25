import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from '../../Components/SThree';
import Ammo from 'ammojs3';
import Joystick from '../../Components/SThree/Joystick';

const ThreeExample = () => {
  const glRef = useRef(null);
  const dynamicsWorldRef = useRef(null);
  const cubeRef = useRef(null);
  const ammoRef = useRef(null);
  const [ammoReady, setAmmoReady] = useState(false);
  const requestRef = useRef(null);
  useEffect(() => {
    const initPhysics = async () => {
      console.log('Loading Ammo.js...');
      const ammo = await Ammo();
      ammoRef.current = ammo;
      console.log('Ammo.js loaded');

      // Initialize Ammo.js physics
      const collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
      const dispatcher = new ammo.btCollisionDispatcher(collisionConfiguration);
      const overlappingPairCache = new ammo.btDbvtBroadphase();
      const solver = new ammo.btSequentialImpulseConstraintSolver();
      const dynamicsWorld = new ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
      dynamicsWorld.setGravity(new ammo.btVector3(0, -10, 0));
      dynamicsWorldRef.current = dynamicsWorld;

      setAmmoReady(true);
    };

    initPhysics();

  }, []);

  const onContextCreate = (gl) => {
    console.log('GL context created');
    glRef.current = gl;

    if (!ammoReady) {
      console.log('Ammo.js not ready');
      return;
    }

    const renderer = Renderer(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
    // renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();

    const luz = new THREE.AmbientLight(0xff0000, 0);
    scene.add(luz)

    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    // camera.position.z = 5;
    camera.position.set(1, 10, 10)
    const target = new THREE.Vector3(0, 0, 0);
    camera.lookAt(target)
    const geometry = new THREE.BoxGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.set(0, 0, 0)
    cubeRef.current = cube;

    const ammo = ammoRef.current;
    // Ammo.js rigid body for the cube
    const transform = new ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new ammo.btVector3(0, 5, 0));
    const motionState = new ammo.btDefaultMotionState(transform);

    const colShape = new ammo.btBoxShape(new ammo.btVector3(2, 2, 0));
    colShape.setMargin(0.5);

    const mass = 1;
    const localInertia = new ammo.btVector3(2, 2, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    const body = new ammo.btRigidBody(rbInfo);

    dynamicsWorldRef.current.addRigidBody(body);
    cube.userData.physicsBody = body;


    // Create the plane
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / -2;
    //plane.position.y = -1; // Position the plane slightly below the cube
    scene.add(plane);

    // Ammo.js rigid body for the plane
    const planeTransform = new ammo.btTransform();
    planeTransform.setIdentity();
    planeTransform.setOrigin(new ammo.btVector3(2, 2, 0));
    const planeMotionState = new ammo.btDefaultMotionState(planeTransform);

    const planeColShape = new ammo.btBoxShape(new ammo.btVector3(2, 2, 0));
    planeColShape.setMargin(1);

    const planeRbInfo = new ammo.btRigidBodyConstructionInfo(0, planeMotionState, planeColShape, new ammo.btVector3(2, 2, 0));
    const planeBody = new ammo.btRigidBody(planeRbInfo);

    dynamicsWorldRef.current.addRigidBody(planeBody);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      // // Update physics

      const deltaTime = 1 / 60;
      dynamicsWorldRef.current.stepSimulation(deltaTime, 10);

      // Update Three.js object positions based on Ammo.js physics
      const objThree = cube;
      const objAmmo = body;
      const ms = objAmmo.getMotionState();
      if (ms) {
        ms.getWorldTransform(transform);
        const p = transform.getOrigin();
        const q = transform.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  useEffect(() => {
    if (ammoReady && glRef.current) {
      console.log('Initializing Three.js with Ammo.js');
      onContextCreate(glRef.current);
    }
  }, [ammoReady]);



  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (dynamicsWorldRef.current) {
        const numCollisionObjects = dynamicsWorldRef.current.getNumCollisionObjects ? dynamicsWorldRef.current.getNumCollisionObjects() : 0;
        for (let i = 0; i < numCollisionObjects; i++) {
          const obj = dynamicsWorldRef.current.getCollisionObjectArray().at(i);
          dynamicsWorldRef.current.removeCollisionObject(obj);
          ammoRef.current.destroy(obj);
        }
      }
      console.log('Component unmounted, resources cleaned up');
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
      />
      <Joystick
        onMove={e => {
          if (e.x == 0 && e.y == 0) return;
          let scalingFactor = 0.1;
          const ammo = ammoRef.current;
          let resultantImpulse = new ammo.btVector3(e.x, 0, e.y)
          resultantImpulse.op_mul(scalingFactor);
          let physicsBody = cubeRef.current.userData.physicsBody;
          physicsBody.setLinearVelocity(resultantImpulse);
        }} />
    </View>
  );
};

export default ThreeExample;
