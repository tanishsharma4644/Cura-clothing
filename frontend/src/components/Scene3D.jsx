import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment, useGLTF, MeshTransmissionMaterial, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ShirtModel = ({ position, rotation = [0, 0, 0], scale = 1, color = '#ffffff' }) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/AvatarParzival/3d/main/Models/shirt.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  
  const meshRef = useRef();
  const { pointer } = useThree();

  // Optionally color the shirt if it has materials
  useMemo(() => {
    copiedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(color);
        child.material.roughness = 0.8; // soft cotton feel
        child.material.metalness = 0.0;
      }
    });
  }, [copiedScene, color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
    meshRef.current.rotation.x += (pointer.y * 0.3 - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (pointer.x * 0.5 - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <primitive object={copiedScene} />
      </group>
    </Float>
  );
};

useGLTF.preload('https://raw.githubusercontent.com/AvatarParzival/3d/main/Models/shirt.glb');

// --- Floating Geometric Shape ---
const FloatingShape = ({ geometry, position, color, speed = 1, distort = 0.3, scale = 1 }) => {
  const meshRef = useRef();
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    // Gentle float
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.1;
    // Mouse influence
    meshRef.current.rotation.x += (pointer.y * 0.3 - meshRef.current.rotation.x) * 0.02;
    meshRef.current.rotation.y += (pointer.x * 0.5 - meshRef.current.rotation.y) * 0.02;
    meshRef.current.rotation.z += 0.002 * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          roughness={0.4}
          metalness={0.2}
          distort={distort}
          speed={2}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
};

// --- Glass Sphere ---
const GlassSphere = ({ position, scale = 1 }) => {
  const meshRef = useRef();
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.2;
    meshRef.current.rotation.x += (pointer.y * 0.2 - meshRef.current.rotation.x) * 0.01;
    meshRef.current.rotation.y += (pointer.x * 0.2 - meshRef.current.rotation.y) * 0.01;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        color="#D7C9BA"
        roughness={0.05}
        metalness={0.1}
        transmission={0.9}
        thickness={1.5}
        transparent
        opacity={0.4}
        ior={1.5}
      />
    </mesh>
  );
};

// --- Ambient Particles ---
const Particles = ({ count = 200 }) => {
  const meshRef = useRef();
  const { pointer } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.3 + pointer.x * 0.5,
        p.position[1] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3,
        p.position[2]
      );
      dummy.scale.setScalar(0.02 + Math.sin(t + p.offset) * 0.01);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#8B5E3C" transparent opacity={0.3} />
    </instancedMesh>
  );
};

// --- Rotating Ring ---
const FloatingRing = ({ position, color = '#8B5E3C', scale = 1 }) => {
  const ref = useRef();
  const { pointer } = useThree();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.5 + pointer.y * 0.3;
    ref.current.rotation.y = t * 0.2 + pointer.x * 0.3;
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.15, 32, 64]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.9}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
};

// ============================
// EXPORTED SCENES
// ============================

// --- ROTATING WARDROBE CAROUSEL ---
const WardrobeCarousel = () => {
  const groupRef = useRef();
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow, luxurious rotation
    groupRef.current.rotation.y += delta * 0.25;
    
    // Interactive tilt
    groupRef.current.rotation.x = pointer.y * 0.15;
    groupRef.current.rotation.z = -pointer.x * 0.15;
  });

  const shirts = [
    { color: '#8B5E3C', angle: 0 }, // Warm Brown
    { color: '#D7C9BA', angle: Math.PI * 2 / 3 }, // Beige
    { color: '#1C1917', angle: Math.PI * 4 / 3 }, // Dark
  ];

  const radius = 3.5;

  return (
    <group ref={groupRef} position={[2, -0.5, -2]}>
      {shirts.map((shirt, i) => {
        const x = Math.cos(shirt.angle) * radius;
        const z = Math.sin(shirt.angle) * radius;
        // Orient the shirts to face outwards from the circle
        const rotY = -shirt.angle + Math.PI / 2;
        
        return (
          <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
            <ShirtModel 
              position={[x, 0, z]} 
              rotation={[0, rotY, 0.1]} 
              scale={2.6} 
              color={shirt.color} 
            />
          </Float>
        );
      })}
    </group>
  );
};

// HERO 3D SCENE — 3D Clothing Carousel
export const HeroScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
      <directionalLight position={[-10, 5, -5]} intensity={1} color="#D7C9BA" />
      <Environment preset="city" />

      {/* The rotating showcase of clothes */}
      <WardrobeCarousel />

      {/* Soft ground shadow for realism */}
      <ContactShadows 
        position={[2, -4.5, -2]} 
        opacity={0.4} 
        scale={25} 
        blur={2.5} 
        far={10} 
        color="#8B5E3C"
      />
    </Canvas>
  );
};

// ENHANCED FABRIC SECTION with better lighting and multiple meshes
export const EnhancedFabricScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -10, -5]} intensity={1} color="#8B5E3C" />
      <pointLight position={[0, 5, 3]} intensity={1} color="#D7C9BA" />
      <spotLight position={[-3, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#8B5E3C" />

      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.2}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[5, 6, 128, 128]} />
          <MeshDistortMaterial
            color="#8B5E3C"
            roughness={0.3}
            metalness={0.15}
            distort={0.6}
            speed={1.5}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>

      {/* Orbiting accent ring */}
      <FloatingRing position={[0, 0, -1]} color="#D7C9BA" scale={0.4} />
    </Canvas>
  );
};

// PARTICLE ATMOSPHERE — subtle background for dark sections
export const ParticleAtmosphere = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      gl={{ antialias: false, alpha: true }}
    >
      <color attach="background" args={['#000000']} />
      <Particles count={100} />
    </Canvas>
  );
};

// 3D TILT CARD — Pure CSS/JS, no Three.js needed
export const Tilt3DCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};
