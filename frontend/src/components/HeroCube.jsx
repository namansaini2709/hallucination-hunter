import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const FACE_COLORS = [
  ["#f6621d", "#ffe7b0"],
  ["#d84912", "#ffb05f"],
  ["#e07a2d", "#fff4c8"],
  ["#f7b55b", "#fff0b7"],
  ["#f1792d", "#fff1d2"],
  ["#cf4c15", "#ffd279"],
];

export function HeroCube({ pointer }) {
  return (
    <div className="hero-cube-shell">
      <div className="hero-cube-glow" />
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 5.5], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#120907", 8, 14]} />
        <ambientLight intensity={1} color="#ffe6ca" />
        <directionalLight position={[4, 3, 4]} intensity={4.5} color="#fff7dc" />
        <pointLight position={[-3.3, 1.8, 3]} intensity={18} distance={12} color="#ff6b37" />
        <pointLight position={[2.6, -0.6, 3]} intensity={8} distance={11} color="#ffc891" />
        <pointLight position={[0, 2.4, 2.7]} intensity={16} distance={9} color="#fff7e0" />
        <Cube pointer={pointer} />
      </Canvas>
    </div>
  );
}

function Cube({ pointer }) {
  const groupRef = useRef(null);
  const materials = useMemo(() => FACE_COLORS.map(([a, b]) => makeGradientMaterial(a, b)), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const time = state.clock.elapsedTime;
    group.position.y = Math.sin(time * 1.25) * 0.08;

    const targetX = 0.34 + Math.sin(time * 0.9) * 0.03 + pointer.current.y * 0.06;
    const targetY = -0.3 + Math.sin(time * 0.7) * 0.04 + pointer.current.x * 0.05;

    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 4.2, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 4.2, delta);
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      -0.08 + Math.sin(time * 0.8) * 0.015 + pointer.current.x * -0.02,
      4.2,
      delta
    );
  });

  return (
    <group ref={groupRef} scale={[1.05, 1.05, 1.05]}>
        <mesh
          position={[0.78, 0.18, -1.06]}
          rotation={[0.08, -0.18, -0.03]}
          scale={[1.98, 2.9, 0.32]}
        >
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshBasicMaterial color="#27130c" transparent opacity={0.84} />
        </mesh>

        <RoundedBox args={[2.04, 2.04, 2.04]} radius={0.2} smoothness={8}>
          {materials.map((material, index) => (
            <primitive key={index} object={material} attach={`material-${index}`} />
          ))}
          <Edges threshold={15} color="#ffffff" scale={1.01} />
        </RoundedBox>

        <RoundedBox
          args={[2.08, 2.08, 2.08]}
          radius={0.2}
          smoothness={8}
          scale={[1.012, 1.012, 1.012]}
        >
          <MeshTransmissionMaterial
            samples={2}
            resolution={256}
            transmission={0.18}
            roughness={0.08}
            thickness={0.42}
            ior={1.08}
            chromaticAberration={0.01}
            anisotropy={0.05}
            distortion={0.02}
            distortionScale={0.04}
            temporalDistortion={0.02}
            clearcoat={1}
            transparent
            opacity={0.16}
          />
        </RoundedBox>
      </group>
  );
}

function makeGradientMaterial(colorA, colorB) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(0.5, "#fff6da");
  gradient.addColorStop(1, colorB);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const highlight = context.createLinearGradient(0, canvas.height * 0.08, canvas.width, canvas.height * 0.42);
  highlight.addColorStop(0, "rgba(255,255,255,0.95)");
  highlight.addColorStop(0.12, "rgba(255,255,255,0.28)");
  highlight.addColorStop(0.36, "rgba(255,255,255,0)");
  context.fillStyle = highlight;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.14,
    metalness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 1,
    sheenColor: new THREE.Color("#fff1cf"),
    sheenRoughness: 0.2,
    emissive: new THREE.Color(colorA),
    emissiveIntensity: 0.05,
  });
}
