'use client';

import { ContactShadows } from '@react-three/drei';

export default function Floor() {
  return (
    <group>
      {/* Dark ground plane - absorbs reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050505" roughness={0.95} metalness={0.0} envMapIntensity={0.05} />
      </mesh>
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={12}
        blur={2.5}
        far={4}
        resolution={512}
        color="#000000"
        frames={1}
      />
    </group>
  );
}
