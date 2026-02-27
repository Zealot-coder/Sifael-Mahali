'use client';

import { Float, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Mesh } from 'three';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function Orb({ animate }: { animate: boolean }) {
  const ref = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.x += delta * 0.08;
    ref.current.rotation.y += delta * 0.14;
  });

  return (
    <Float
      speed={animate ? 1.2 : 0}
      rotationIntensity={animate ? 0.8 : 0}
      floatIntensity={animate ? 0.7 : 0}
    >
      <mesh ref={ref} scale={1.45}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial
          color="#5dff9c"
          wireframe
          emissive="#18c964"
          emissiveIntensity={0.72}
          metalness={0.2}
          roughness={0.28}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  const lowEndDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as NavigatorWithMemory;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    return cores <= 4 || memory <= 4;
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (lowEndDevice) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12%] top-[-18%] h-[48vh] w-[48vh] rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute bottom-[-24%] left-[-8%] h-[42vh] w-[42vh] rounded-full bg-accent/20 blur-3xl" />
      </div>
    );
  }

  const animate = !reduceMotion && isVisible;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={animate ? 'always' : 'never'}
        camera={{ position: [0, 0, 4], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 2, 3]} intensity={1.15} />
        <directionalLight position={[-3, -2, -3]} intensity={0.42} color="#8fff52" />
        <Suspense fallback={null}>
          <Orb animate={animate} />
          {!reduceMotion ? (
            <Stars radius={24} depth={18} count={550} factor={2} fade speed={0.3} />
          ) : null}
        </Suspense>
      </Canvas>
    </div>
  );
}
