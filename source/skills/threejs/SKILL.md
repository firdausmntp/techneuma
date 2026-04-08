---
name: threejs
description: Expert Three.js and WebGL development for 3D graphics, animations, and immersive web experiences
---

# Three.js Specialist

You are an expert Three.js developer. Build performant, visually stunning 3D experiences for the web.

## Core Philosophy

- **Performance is visual quality** — 60fps is the baseline, not a goal
- **Scene graph mastery** — Understand the hierarchy: Scene → Group → Mesh → Geometry + Material
- **GPU awareness** — Minimize draw calls, batch geometry, manage texture memory
- **Progressive enhancement** — Graceful fallback for devices without WebGL support

## Scene Setup

### Basic Scene
```typescript
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping

document.body.appendChild(renderer.domElement)

camera.position.z = 5

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()
```

### Responsive Handling
```typescript
function onResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
window.addEventListener('resize', onResize)
```

## Materials and Lighting

### PBR Materials
```typescript
const material = new THREE.MeshStandardMaterial({
  color: 0x4488ff,
  metalness: 0.3,
  roughness: 0.7,
  envMapIntensity: 1.0,
})

// Environment map for realistic reflections
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

new RGBELoader().load('/hdri/studio.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
})
```

### Lighting Setup
```typescript
// Three-point lighting
const key = new THREE.DirectionalLight(0xffffff, 1.5)
key.position.set(5, 5, 5)
key.castShadow = true
key.shadow.mapSize.set(2048, 2048)
scene.add(key)

const fill = new THREE.DirectionalLight(0x8888ff, 0.5)
fill.position.set(-5, 3, -5)
scene.add(fill)

const ambient = new THREE.AmbientLight(0x404040, 0.4)
scene.add(ambient)
```

## Loading Models

### GLTF Loading
```typescript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load('/models/scene.glb', (gltf) => {
  const model = gltf.scene
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(model)
})
```

## Animation

### Animation Loop with Clock
```typescript
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const elapsed = clock.getElapsedTime()
  
  // Smooth rotation
  mesh.rotation.y += delta * 0.5
  
  // Oscillation
  mesh.position.y = Math.sin(elapsed * 2) * 0.5
  
  renderer.render(scene, camera)
}
```

### GSAP Integration
```typescript
import gsap from 'gsap'

gsap.to(mesh.position, {
  x: 2,
  duration: 1.5,
  ease: 'power3.out',
})

gsap.to(mesh.rotation, {
  y: Math.PI * 2,
  duration: 2,
  ease: 'none',
  repeat: -1,
})
```

## React Three Fiber

```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useRef } from 'react'

function RotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4488ff" />
    </mesh>
  )
}

function Scene() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <RotatingBox />
      <OrbitControls />
      <Environment preset="studio" />
    </Canvas>
  )
}
```

## Performance

### Instanced Rendering
```typescript
const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const material = new THREE.MeshStandardMaterial({ color: 0x4488ff })
const mesh = new THREE.InstancedMesh(geometry, material, 10000)

const dummy = new THREE.Object3D()
for (let i = 0; i < 10000; i++) {
  dummy.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  )
  dummy.updateMatrix()
  mesh.setMatrixAt(i, dummy.matrix)
}
scene.add(mesh)
```

### Dispose Resources
```typescript
function cleanup() {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose())
      } else {
        object.material.dispose()
      }
    }
  })
  renderer.dispose()
}
```

## DO

- Limit pixel ratio to 2 — higher values waste GPU with no visible benefit
- Use `InstancedMesh` for repeated geometry (particles, trees, buildings)
- Dispose geometries, materials, and textures when removing objects
- Use Draco compression for GLTF models to reduce file size
- Use `requestAnimationFrame` for the render loop, never `setInterval`
- Profile with `renderer.info` to monitor draw calls and triangles

## DON'T

- Don't create new geometries or materials inside the animation loop
- Don't forget to call `updateProjectionMatrix()` after changing camera properties
- Don't use uncompressed textures — resize and compress before loading
- Don't skip shadow map configuration — default resolution is too low
- Don't add lights without limits — each light increases draw call cost
- Don't ignore mobile GPU constraints — test on real devices
