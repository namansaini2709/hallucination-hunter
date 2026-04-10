import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const FACE_COLORS = [
  ["#ff0000", "#ffaa00"], // Sharp Red to Orange
  ["#ff5500", "#00ff66"], // Orange to Lime Green
  ["#ff0055", "#ffff00"], // Pink-Red to Yellow
  ["#00ffcc", "#ff0000"], // Teal to Red
  ["#ffff00", "#ff4400"], // Yellow to Deep Orange
  ["#00ff00", "#ff00ff"], // Green to Magenta
];

export function HeroCube({ pointer }) {
  return (
    <div className="hero-cube-shell">
      <div className="hero-cube-glow" />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#0a0809", 8, 16]} />
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={4} color="#ffffff" />
        <pointLight position={[-4, 2, 4]} intensity={30} distance={15} color="#ff3300" />
        <pointLight position={[4, -2, 4]} intensity={20} distance={15} color="#00ffcc" />
        <pointLight position={[0, 4, 3]} intensity={25} distance={12} color="#ffffff" />
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
    if (!group) return;

    const time = state.clock.elapsedTime;
    
    group.position.y = Math.sin(time * 1.5) * 0.15;
    
    const targetX = 0.45 + Math.sin(time * 0.8) * 0.08 + pointer.current.y * 0.1;
    const targetY = -0.4 + Math.sin(time * 0.6) * 0.1 + pointer.current.x * 0.1;
    const targetZ = Math.sin(time * 0.5) * 0.05;

    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 3.5, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 3.5, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, targetZ, 3.5, delta);
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
        <RoundedBox args={[2, 2, 2]} radius={0.12} smoothness={12}>
          {materials.map((material, index) => (
            <primitive key={index} object={material} attach={`material-${index}`} />
          ))}
          <Edges threshold={20} color="#ffffff" scale={1.002} />
        </RoundedBox>

        <RoundedBox
          args={[2.01, 2.01, 2.01]}
          radius={0.13}
          smoothness={12}
          scale={[1.004, 1.004, 1.004]}
        >
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            transmission={0.45}
            roughness={0.03}
            thickness={0.6}
            ior={1.2}
            chromaticAberration={0.08}
            anisotropy={0.15}
            distortion={0.05}
            distortionScale={0.1}
            temporalDistortion={0.05}
            clearcoat={1}
            transparent
            opacity={0.35}
            color="#ffffff"
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
  gradient.addColorStop(0.35, "#fff");
  gradient.addColorStop(0.5, colorA);
  gradient.addColorStop(0.75, colorB);
  gradient.addColorStop(1, colorA);
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const highlight = context.createRadialGradient(
    canvas.width * 0.3, canvas.height * 0.3, 0,
    canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.7
  );
  highlight.addColorStop(0, "rgba(255,255,255,1)");
  highlight.addColorStop(0.3, "rgba(255,255,255,0.6)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = highlight;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.05,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    sheen: 1,
    sheenColor: new THREE.Color("#ffffff"),
    sheenRoughness: 0.05,
    emissive: new THREE.Color(colorA),
    emissiveIntensity: 0.2,
  });
}
