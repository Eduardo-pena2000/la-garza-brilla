import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ChestId } from "@/lib/chests";

interface ThreeChestCanvasProps {
  chestId: ChestId;
  state: "idle" | "shaking" | "opening" | "open";
  recoilTrigger?: number;
  onClick?: () => void;
  className?: string;
}

export function ThreeChestCanvas({
  chestId,
  state,
  recoilTrigger = 0,
  onClick,
  className = "",
}: ThreeChestCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const recoilRef = useRef(recoilTrigger);
  const recoilTimeRef = useRef(0);

  useEffect(() => {
    if (recoilTrigger !== recoilRef.current) {
      recoilRef.current = recoilTrigger;
      recoilTimeRef.current = performance.now();
    }
  }, [recoilTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3d1, 2.2);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Interior glow light inside the chest
    const interiorColor =
      chestId === "legendario"
        ? 0x06b6d4
        : chestId === "magico"
        ? 0xd946ef
        : chestId === "oro"
        ? 0xfbbf24
        : 0xf59e0b;

    const interiorLight = new THREE.PointLight(interiorColor, 0, 8);
    interiorLight.position.set(0, 0.2, 0);
    scene.add(interiorLight);

    // --- Materials depending on chestId ---
    let woodColor = 0x6e3d1b; // Warm walnut
    let metalColor = 0x334155; // Iron
    let metalRoughness = 0.35;
    let metalMetalness = 0.8;
    let gemColor = 0xf59e0b;

    if (chestId === "oro") {
      woodColor = 0xd97706; // Rich golden oak
      metalColor = 0xf59e0b; // Pure gold
      metalRoughness = 0.2;
      metalMetalness = 0.95;
      gemColor = 0xf59e0b;
    } else if (chestId === "plata") {
      woodColor = 0x475569; // Silver slate
      metalColor = 0xe2e8f0; // Polished steel
      metalRoughness = 0.25;
      metalMetalness = 0.9;
      gemColor = 0x38bdf8;
    } else if (chestId === "magico") {
      woodColor = 0x2e1065; // Arcane deep purple
      metalColor = 0x7c3aed; // Violet steel
      metalRoughness = 0.25;
      metalMetalness = 0.85;
      gemColor = 0xd946ef;
    } else if (chestId === "legendario") {
      woodColor = 0x0f172a; // Cosmic obsidian
      metalColor = 0xfbbf24; // Imperial gold
      metalRoughness = 0.15;
      metalMetalness = 0.95;
      gemColor = 0x06b6d4;
    }

    const woodMat = new THREE.MeshStandardMaterial({
      color: woodColor,
      roughness: 0.65,
      metalness: 0.05,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: metalColor,
      roughness: metalRoughness,
      metalness: metalMetalness,
    });

    const gemMat = new THREE.MeshPhysicalMaterial({
      color: gemColor,
      emissive: gemColor,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.95,
    });

    const goldCoinsMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.9,
    });

    // --- Build 3D Chest Model ---
    const chestRoot = new THREE.Group();
    scene.add(chestRoot);

    // Dimensions
    const cw = 2.0; // width
    const ch = 1.1; // base height
    const cd = 1.4; // depth

    // 1. CHEST BASE (BOTTOM)
    const baseGroup = new THREE.Group();
    chestRoot.add(baseGroup);

    // Main base body
    const baseGeo = new THREE.BoxGeometry(cw, ch, cd);
    const baseMesh = new THREE.Mesh(baseGeo, woodMat);
    baseMesh.position.y = ch / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseGroup.add(baseMesh);

    // Base metal bands (horizontal top & bottom rim)
    const bandThick = 0.06;
    const bandDepth = 0.08;

    const botRimGeo = new THREE.BoxGeometry(cw + bandDepth, bandThick * 2, cd + bandDepth);
    const botRim = new THREE.Mesh(botRimGeo, metalMat);
    botRim.position.y = bandThick;
    baseGroup.add(botRim);

    const topRimGeo = new THREE.BoxGeometry(cw + bandDepth, bandThick * 2, cd + bandDepth);
    const topRim = new THREE.Mesh(topRimGeo, metalMat);
    topRim.position.y = ch - bandThick;
    baseGroup.add(topRim);

    // Vertical metal corner brackets
    const cornerSize = bandThick * 2;
    const cornerOffsets = [
      [-cw / 2, -cd / 2],
      [cw / 2, -cd / 2],
      [-cw / 2, cd / 2],
      [cw / 2, cd / 2],
    ];
    cornerOffsets.forEach(([cx, cz]) => {
      const cornerGeo = new THREE.BoxGeometry(cornerSize, ch, cornerSize);
      const cornerMesh = new THREE.Mesh(cornerGeo, metalMat);
      cornerMesh.position.set(cx, ch / 2, cz);
      baseGroup.add(cornerMesh);
    });

    // Middle strap on base
    const midStrapGeo = new THREE.BoxGeometry(0.24, ch + 0.02, cd + bandDepth * 1.2);
    const midStrap = new THREE.Mesh(midStrapGeo, metalMat);
    midStrap.position.set(0, ch / 2, 0);
    baseGroup.add(midStrap);

    // Golden lock plate on front
    const lockPlateGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const lockPlate = new THREE.Mesh(lockPlateGeo, metalMat);
    lockPlate.position.set(0, ch * 0.72, cd / 2 + 0.06);
    baseGroup.add(lockPlate);

    // Gem on the lock
    const gemGeo = new THREE.OctahedronGeometry(0.18, 0);
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(0, ch * 0.72, cd / 2 + 0.14);
    gemMesh.rotation.z = Math.PI / 4;
    baseGroup.add(gemMesh);

    // Side handles
    [-cw / 2 - 0.04, cw / 2 + 0.04].forEach((hx, idx) => {
      const handleGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
      const handleMesh = new THREE.Mesh(handleGeo, metalMat);
      handleMesh.position.set(hx, ch * 0.55, 0);
      handleMesh.rotation.y = Math.PI / 2;
      handleMesh.rotation.x = idx === 0 ? 0.2 : -0.2;
      baseGroup.add(handleMesh);
    });

    // Piles of shiny coins inside base (visible when lid opens)
    const coinsGroup = new THREE.Group();
    coinsGroup.position.set(0, ch * 0.7, 0);
    baseGroup.add(coinsGroup);

    for (let i = 0; i < 28; i++) {
      const coinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12);
      const coin = new THREE.Mesh(coinGeo, goldCoinsMat);
      coin.position.set(
        (Math.random() - 0.5) * (cw - 0.4),
        Math.random() * 0.2,
        (Math.random() - 0.5) * (cd - 0.4)
      );
      coin.rotation.set(
        Math.random() * 0.3,
        Math.random() * Math.PI,
        Math.random() * 0.3
      );
      coinsGroup.add(coin);
    }

    // 2. CHEST LID (TOP HINGE)
    // The lid pivot group is positioned at the REAR TOP EDGE of the base!
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, ch, -cd / 2);
    chestRoot.add(lidPivot);

    const lidContainer = new THREE.Group();
    lidContainer.position.set(0, 0, cd / 2); // Shift so center of lid aligns with chest
    lidPivot.add(lidContainer);

    // Rounded barrel lid dome (cylinder rotated on X)
    const lidRadius = cd / 2;
    const lidCylGeo = new THREE.CylinderGeometry(
      lidRadius,
      lidRadius,
      cw,
      24,
      1,
      false,
      0,
      Math.PI
    );
    const lidMesh = new THREE.Mesh(lidCylGeo, woodMat);
    lidMesh.rotation.z = Math.PI / 2;
    lidMesh.rotation.y = -Math.PI / 2;
    lidMesh.position.set(0, 0, 0);
    lidMesh.castShadow = true;
    lidContainer.add(lidMesh);

    // Lid metal bands (left, center, right)
    [-cw / 2 + 0.1, 0, cw / 2 - 0.1].forEach((bx) => {
      const bandArcGeo = new THREE.CylinderGeometry(
        lidRadius + 0.02,
        lidRadius + 0.02,
        bx === 0 ? 0.26 : 0.14,
        24,
        1,
        false,
        0,
        Math.PI
      );
      const bandArc = new THREE.Mesh(bandArcGeo, metalMat);
      bandArc.rotation.z = Math.PI / 2;
      bandArc.rotation.y = -Math.PI / 2;
      bandArc.position.set(bx, 0, 0);
      lidContainer.add(bandArc);
    });

    // Lid front latch tongue
    const latchGeo = new THREE.BoxGeometry(0.3, 0.4, 0.08);
    const latchMesh = new THREE.Mesh(latchGeo, metalMat);
    latchMesh.position.set(0, -0.1, cd / 2 + 0.04);
    lidContainer.add(latchMesh);

    // 3. 3D PARTICLE BURST (CHISPAS Y ESTRELLAS)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = ch + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2.8,
          Math.random() * 3.5 + 1.2,
          (Math.random() - 0.5) * 2.8
        )
      );
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: interiorColor,
      size: 0.18,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();
    let currentLidAngle = 0;
    let targetLidAngle = 0;
    let lidVelocity = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      const currentState = stateRef.current;

      // Handle Lid Target Angle
      if (currentState === "idle" || currentState === "shaking") {
        targetLidAngle = 0;
        interiorLight.intensity = THREE.MathUtils.lerp(interiorLight.intensity, 0, delta * 8);
        particleMat.opacity = THREE.MathUtils.lerp(particleMat.opacity, 0, delta * 6);
      } else {
        // "opening" or "open"
        targetLidAngle = -Math.PI * 0.65; // ~117 degrees open backwards!
        interiorLight.intensity = THREE.MathUtils.lerp(interiorLight.intensity, 12, delta * 5);
        particleMat.opacity = THREE.MathUtils.lerp(particleMat.opacity, 0.95, delta * 6);
      }

      // Spring physics on the Lid hinge
      const springStiffness = 180;
      const springDamping = 14;
      const force = (targetLidAngle - currentLidAngle) * springStiffness;
      lidVelocity += force * delta;
      lidVelocity *= Math.max(0, 1 - springDamping * delta);
      currentLidAngle += lidVelocity * delta;
      lidPivot.rotation.x = currentLidAngle;

      // Body motion based on state
      if (currentState === "idle") {
        // Gentle 3D floating and breathing
        chestRoot.position.y = Math.sin(time * 2.2) * 0.08 - 0.2;
        chestRoot.rotation.y = Math.sin(time * 1.2) * 0.12;
        chestRoot.rotation.x = 0.05 + Math.cos(time * 1.5) * 0.03;
        chestRoot.scale.set(1, 1, 1);
      } else if (currentState === "shaking") {
        // Heavy anticipation wobble and squash
        const shakeFreq = 40;
        chestRoot.position.y = -0.25 + Math.sin(time * shakeFreq) * 0.05;
        chestRoot.rotation.z = Math.sin(time * shakeFreq * 0.8) * 0.12;
        chestRoot.rotation.y = Math.cos(time * shakeFreq * 0.6) * 0.1;
        chestRoot.scale.set(1.12, 0.88, 1.12);
      } else if (currentState === "opening") {
        // Burst jump
        chestRoot.position.y = THREE.MathUtils.lerp(chestRoot.position.y, 0.1, delta * 12);
        chestRoot.rotation.y = THREE.MathUtils.lerp(chestRoot.rotation.y, 0, delta * 8);
        chestRoot.rotation.z = 0;
        chestRoot.scale.set(1, 1, 1);
      } else if (currentState === "open") {
        // Open chest breathing gently at lower vantage point
        chestRoot.position.y = -0.3 + Math.sin(time * 2) * 0.04;
        chestRoot.rotation.y = Math.sin(time * 0.9) * 0.08;
        chestRoot.rotation.x = 0.1;
      }

      // Recoil bounce effect when user taps for a new reward card!
      if (recoilTimeRef.current > 0) {
        const elapsedSinceRecoil = (performance.now() - recoilTimeRef.current) / 1000;
        if (elapsedSinceRecoil < 0.45) {
          const recoilProgress = elapsedSinceRecoil / 0.45;
          const recoilSquash = Math.sin(recoilProgress * Math.PI) * 0.18;
          chestRoot.scale.set(1 + recoilSquash, 1 - recoilSquash, 1 + recoilSquash);
          chestRoot.position.y -= recoilSquash * 0.5;
        }
      }

      // Update 3D particles
      if (particleMat.opacity > 0.05) {
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let y = posAttr.getY(i) + velocities[i].y * delta;
          let x = posAttr.getX(i) + velocities[i].x * delta;
          let z = posAttr.getZ(i) + velocities[i].z * delta;

          // Gravity
          velocities[i].y -= 4.2 * delta;

          // Reset if fallen below ground
          if (y < -0.4) {
            y = ch + 0.1;
            x = (Math.random() - 0.5) * 0.3;
            z = (Math.random() - 0.5) * 0.3;
            velocities[i].set(
              (Math.random() - 0.5) * 2.5,
              Math.random() * 3.2 + 1.5,
              (Math.random() - 0.5) * 2.5
            );
          }

          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 360;
      const nh = container.clientHeight || 360;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      baseGeo.dispose();
      lidCylGeo.dispose();
      particleGeo.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [chestId]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}
