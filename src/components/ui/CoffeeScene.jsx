import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Torus, Cylinder, Sphere } from '@react-three/drei'
import * as THREE from 'three'

/* ============================================================
   STEAM PARTICLE SYSTEM
   Points geometry — each particle rises, fades, resets.
   ============================================================ */
function SteamParticles({ intensity = 1, visible = true }) {
  const meshRef  = useRef(null)
  const COUNT    = 80
  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  // Particle data (position, speed, phase offset)
  const particles = useMemo(() => {
    const pos    = new Float32Array(COUNT * 3)
    const speeds = []
    const phases = []

    for (let i = 0; i < COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.18
      pos[i * 3]     = Math.cos(angle) * radius        // x — cluster over rim
      pos[i * 3 + 1] = Math.random() * 1.2             // y — spread vertically
      pos[i * 3 + 2] = Math.sin(angle) * radius        // z
      speeds.push(0.004 + Math.random() * 0.006)
      phases.push(Math.random() * Math.PI * 2)
    }

    return { pos, speeds, phases }
  }, [])

  useFrame((state) => {
    if (!meshRef.current || !visible || prefersReduced) return

    const t        = state.clock.elapsedTime
    const posArray = meshRef.current.geometry.attributes.position.array

    for (let i = 0; i < COUNT; i++) {
      // Rise
      posArray[i * 3 + 1] += particles.speeds[i] * intensity

      // Sway side-to-side using sine
      const sway = Math.sin(t * 0.8 + particles.phases[i]) * 0.04
      posArray[i * 3]     = sway + Math.cos(particles.phases[i]) * 0.12
      posArray[i * 3 + 2] = Math.cos(t * 0.6 + particles.phases[i]) * 0.04 +
                             Math.sin(particles.phases[i]) * 0.12

      // Reset when particle reaches top
      if (posArray[i * 3 + 1] > 1.8) {
        const angle  = Math.random() * Math.PI * 2
        const radius = Math.random() * 0.14
        posArray[i * 3]     = Math.cos(angle) * radius
        posArray[i * 3 + 1] = Math.random() * 0.2
        posArray[i * 3 + 2] = Math.sin(angle) * radius
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef} position={[0, 0.55, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.pos}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#c8a882"
        transparent
        opacity={visible ? 0.55 * Math.min(intensity, 1.4) : 0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ============================================================
   COFFEE LIQUID FILL
   A capped cylinder that scales from 0 → fillLevel.
   ============================================================ */
function CoffeeLiquid({ fillLevel = 0 }) {
  const meshRef = useRef(null)

  useFrame(() => {
    if (!meshRef.current) return
    // Smooth lerp to target fill
    const current = meshRef.current.scale.y
    const target  = Math.max(0.01, fillLevel)
    meshRef.current.scale.y = current + (target - current) * 0.06
    // Offset so liquid stays at bottom of cup
    meshRef.current.position.y = -0.42 + (meshRef.current.scale.y * 0.36)
  })

  return (
    <mesh ref={meshRef} position={[0, -0.42, 0]} scale={[0.95, 0.01, 0.95]}>
      <cylinderGeometry args={[0.34, 0.28, 0.72, 32, 1, false]} />
      <meshStandardMaterial
        color="#2c1810"
        emissive="#1a0e08"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  )
}

/* ============================================================
   COFFEE CUP — geometric representation
   Cylinder body + torus rim + torus handle + saucer
   ============================================================ */
function CoffeeCupMesh({ fillLevel, steamVisible, onPointerDown, hovered, setHovered }) {
  const groupRef  = useRef(null)
  const { mouse } = useThree()

  // Pour animation state
  const [pouring, setPouring] = useState(false)
  const pourRef  = useRef({ tilt: 0, active: false })

  useEffect(() => {
    if (onPointerDown) {
      // Expose pour trigger
      pourRef.current.trigger = () => {
        if (pourRef.current.active) return
        pourRef.current.active = true
        setPouring(true)
        setTimeout(() => {
          pourRef.current.active = false
          setPouring(false)
        }, 1200)
      }
    }
  }, [onPointerDown])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    if (pouring) {
      // Tilt cup for pour anim
      pourRef.current.tilt = Math.min(pourRef.current.tilt + 0.05, 0.5)
    } else {
      pourRef.current.tilt = Math.max(pourRef.current.tilt - 0.03, 0)
    }

    // Gentle float + mouse-tracking rotation
    const targetX = mouse.y * 0.18 + Math.sin(t * 0.4) * 0.06
    const targetY = mouse.x * 0.25 + pourRef.current.tilt
    const targetZ = Math.sin(t * 0.3) * 0.03

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.05

    // Subtle float
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.06
  })

  const cupColor    = '#6f4e37'
  const cupEmissive = hovered ? '#2c1810' : '#1a0d07'
  const rimColor    = '#8b6347'

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => {
        if (pourRef.current.trigger) pourRef.current.trigger()
        if (onPointerDown) onPointerDown()
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* ── Saucer ── */}
      <mesh position={[0, -0.62, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.65, 0.06, 48]} />
        <meshStandardMaterial
          color="#8b6347"
          emissive="#3d2010"
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Saucer inner ring */}
      <mesh position={[0, -0.58, 0]}>
        <torusGeometry args={[0.36, 0.03, 8, 32]} />
        <meshStandardMaterial color="#5a3821" roughness={0.5} />
      </mesh>

      {/* ── Cup body ── */}
      <mesh position={[0, -0.12, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.28, 0.84, 32, 1, false]} />
        <meshStandardMaterial
          color={cupColor}
          emissive={cupEmissive}
          emissiveIntensity={0.2}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* ── Rim (top torus) ── */}
      <mesh position={[0, 0.31, 0]}>
        <torusGeometry args={[0.38, 0.025, 8, 40]} />
        <meshStandardMaterial
          color={rimColor}
          emissive="#3d2010"
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* ── Coffee liquid fill ── */}
      <CoffeeLiquid fillLevel={fillLevel} />

      {/* ── Handle ── */}
      <mesh position={[0.52, -0.08, 0]}>
        <torusGeometry args={[0.18, 0.04, 10, 24, Math.PI]} />
        <meshStandardMaterial
          color={cupColor}
          emissive={cupEmissive}
          emissiveIntensity={0.15}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* ── Steam particles ── */}
      <SteamParticles
        intensity={0.5 + fillLevel * 0.8}
        visible={fillLevel > 0.1 && steamVisible}
      />

      {/* ── Pour stream (visible when tilted) ── */}
      {pouring && (
        <mesh position={[0.6, -0.0, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.02, 0.01, 0.6, 8]} />
          <meshStandardMaterial
            color="#2c1810"
            emissive="#1a0e08"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* ── Hover glow ring ── */}
      {hovered && (
        <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.80, 40]} />
          <meshBasicMaterial
            color="#d4a017"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

/* ============================================================
   SCENE WRAPPER
   Manages lighting + camera + cup
   ============================================================ */
function Scene({ fillLevel, onCupClick, externalMouse }) {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#f5e6d3" />

      {/* Key light — warm from upper right */}
      <directionalLight
        position={[3, 5, 3]}
        intensity={1.2}
        color="#d4a017"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Fill light — cool from left */}
      <pointLight
        position={[-3, 2, -1]}
        intensity={0.5}
        color="#c8a882"
        distance={8}
        decay={2}
      />

      {/* Rim light — warm from behind */}
      <pointLight
        position={[0, -1, -3]}
        intensity={0.4}
        color="#6f4e37"
        distance={6}
        decay={2}
      />

      {/* Under-glow — amber warm */}
      <pointLight
        position={[0, -2, 0]}
        intensity={0.3}
        color="#d4a017"
        distance={5}
        decay={2}
      />

      {/* Cup */}
      <CoffeeCupMesh
        fillLevel={fillLevel}
        steamVisible={true}
        onPointerDown={onCupClick}
        hovered={hovered}
        setHovered={setHovered}
      />

      {/* Subtle plane for shadow catch */}
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </>
  )
}

/* ============================================================
   COFFEE SCENE — exported component
   Props:
    fillLevel (0–1)  — how full the cup is
    onCupClick       — called when cup is clicked
    className        — wrapper className
   ============================================================ */
const CoffeeScene = forwardRef(function CoffeeScene(
  { fillLevel = 0, onCupClick, className = '' },
  ref
) {
  const canvasRef = useRef(null)

  useImperativeHandle(ref, () => ({
    canvas: canvasRef.current,
  }))

  return (
    <div
      ref={canvasRef}
      className={`relative ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 42 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias:          true,
          alpha:              true,
          powerPreference:    'high-performance',
        }}
        shadows
        style={{ background: 'transparent' }}
      >
        <Scene fillLevel={fillLevel} onCupClick={onCupClick} />
      </Canvas>

      {/* Click hint */}
      <div
        className="
          absolute bottom-3 left-1/2 -translate-x-1/2
          font-mono text-[10px] text-coffee-light/50
          bg-coffee-dark/60 backdrop-blur-sm
          px-3 py-1 rounded-full
          border border-coffee-mid/20
          pointer-events-none
          whitespace-nowrap
        "
      >
        click to pour ☕
      </div>
    </div>
  )
})

export default CoffeeScene
