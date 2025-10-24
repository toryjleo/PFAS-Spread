import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ThreeScene() {
  const mountRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    // Scene and Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071026);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(2.5, 2.0, 4);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 0.25, 0);

    // Resize handling
    const onResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    dir.castShadow = true;
    scene.add(dir);

    // Grid / ground (subtle)
    const grid = new THREE.GridHelper(10, 10, 0x0b6b90, 0x041724);
    grid.material.opacity = 0.08;
    grid.material.transparent = true;
    scene.add(grid);

    // Box (spinning)
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.2, roughness: 0.4 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.5;
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    // Ground plane to receive shadows (optional)
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x071026, roughness: 1, metalness: 0 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      // delta for time-based animation
      const dt = clock.getDelta();

      // rotate the box slowly
      box.rotation.x += dt * 0.5;
      box.rotation.y += dt * 0.6;

      // update controls (damping)
      controls.update();

      // render
      renderer.render(scene, camera);

      rafRef.current = requestAnimationFrame(animate);
    };

    // initial resize + start
    onResize();
    rafRef.current = requestAnimationFrame(animate);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);

      // dispose geometries and materials
      box.geometry.dispose();
      box.material.dispose();
      plane.geometry.dispose();
      plane.material.dispose();
      grid.geometry.dispose();
      if (grid.material) grid.material.dispose();

      // dispose renderer
      renderer.forceContextLoss();
      renderer.dispose();

      // remove canvas
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      // null refs
      rafRef.current = null;
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}