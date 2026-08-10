import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox, Sparkles } from '@react-three/drei';

function FloatingCard() {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.35;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.2} rotationIntensity={0.75} floatIntensity={0.8}>
        <RoundedBox args={[1.8, 1.8, 0.25]} radius={0.18} smoothness={8}>
          <meshStandardMaterial
            color="#111827"
            emissive="#f59e0b"
            emissiveIntensity={0.45}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </Float>
      <mesh position={[0, 0, 0.24]}>
        <torusKnotGeometry args={[0.55, 0.16, 120, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#fb923c"
          emissiveIntensity={0.35}
          roughness={0.2}
        />
      </mesh>
      <Sparkles count={24} scale={[2.5, 2.5, 2.5]} size={3.5} position={[0, 0, 0.2]} speed={0.1} />
    </group>
  );
}

export default function ProfileIllustration() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#4c1d95] shadow-[0_20px_70px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.3),_transparent_40%)]" />
      <Canvas camera={{ position: [0, 0, 4.4], fov: 40 }}>
        <ambientLight intensity={0.95} />
        <directionalLight position={[3, 4, 2]} intensity={1.6} />
        <directionalLight position={[-4, -2, 1]} intensity={0.5} color="#f59e0b" />
        <Suspense fallback={null}>
          <FloatingCard />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_60%)]" />
    </div>
  );
}
