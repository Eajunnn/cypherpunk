'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function Model(props: any) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/LittlestTokyo.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    Object.values(actions).forEach(action => {
      if (action) action.play();
    });
  }, [actions]);

  return <primitive object={scene} {...props} />;
}

function Scene() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    camera.position.set(10, 6, 10);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <directionalLight position={[-10, 10, -5]} intensity={1.5} />
      <spotLight position={[5, 15, 5]} angle={0.4} penumbra={1} intensity={2} />
      <hemisphereLight args={["#ffffff", "#8888ff", 0.7]} />
      <Model scale={0.017} position={[0, -0.5, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

export default function Building3D() {
  return (
    <div className="w-full h-[500px] bg-transparent rounded-xl overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{
          fov: 50,
          near: 1,
          far: 100,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}