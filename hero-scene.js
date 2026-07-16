/* ================================================================
   ADYVANCE — Hero "The Ascent"
   A sculptural glass growth chart: five frosted-glass slabs rising
   along the brand gradient, threaded by a luminous strategy line
   that draws itself in and ends in an amber goal-light, with signal
   particles flowing along it. Physically-based materials + a tiny
   procedural studio environment, no assets or extra libraries.
   ================================================================ */

(function () {
  'use strict';

  const container = document.getElementById('hero-3d');
  const hero = document.getElementById('hero');
  if (!container || !hero || !window.THREE || !window.WebGLRenderingContext) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const isCompact = window.matchMedia('(max-width: 992px)').matches; // stacked layout, no pointer input
  const isPhone = window.matchMedia('(max-width: 767px)').matches;   // cheapest material path
  const useTransmission = !isPhone;

  const BLUE = new THREE.Color('#0872FF');
  const TEAL = new THREE.Color('#1B97B0');
  const GREEN = new THREE.Color('#29B473');
  const AMBER = new THREE.Color('#F4B740');

  const gradientAt = (t) => (t < 0.5
    ? BLUE.clone().lerp(TEAL, t * 2)
    : TEAL.clone().lerp(GREEN, (t - 0.5) * 2));

  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t) => {
    const s = 1.35;
    const u = t - 1;
    return 1 + (s + 1) * u * u * u + s * u * u;
  };
  const stage = (elapsed, delay, duration) => clamp01((elapsed - delay) / duration);

  // Boot after the preloader lifts so the entrance isn't hidden behind it
  let booted = false;
  window.addEventListener('load', () => setTimeout(boot, 620), { once: true });
  setTimeout(boot, 3200); // mirror the preloader's max-wait fallback
  if (document.readyState === 'complete') boot();

  function boot() {
  if (booted) return;
  booted = true;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    return;
  }
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isPhone ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);

  // ── Procedural studio environment (soft boxes for the glass) ──
  function buildEnvironment() {
    const envScene = new THREE.Scene();
    const addPanel = (color, intensity, width, height, position) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      panel.position.copy(position);
      panel.lookAt(0, 0, 0);
      envScene.add(panel);
    };
    addPanel('#ffffff', 5.5, 8, 4, new THREE.Vector3(0, 7, 2));      // key softbox above
    addPanel('#cfe4ff', 2.6, 5, 6, new THREE.Vector3(-7, 2, 1));     // cool blue left
    addPanel('#d8f5e6', 2.2, 5, 6, new THREE.Vector3(7, 2, -1));     // soft green right
    addPanel('#ffffff', 1.2, 10, 6, new THREE.Vector3(0, 1, -8));    // back fill
    addPanel('#eef4fb', 1.5, 10, 8, new THREE.Vector3(0, -7, 3));    // floor bounce
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene, 0.06).texture;
    pmrem.dispose();
    return envMap;
  }
  scene.environment = buildEnvironment();

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(3.5, 6, 4.5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xbfe3ff, 1.3);
  rimLight.position.set(-4.5, 3, -3.5);
  scene.add(rimLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8f0fa, 0.85));

  // Everything lives in a rig so parallax/scroll tilt one node
  const rig = new THREE.Group();
  scene.add(rig);

  // ── In-scene backdrop so the glass has something bright to refract ──
  function makeRadialTexture(stops, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradientFill = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([offset, color]) => gradientFill.addColorStop(offset, color));
    ctx.fillStyle = gradientFill;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.MeshBasicMaterial({
      map: makeRadialTexture([
        [0, 'rgba(255,255,255,1)'],
        [0.45, 'rgba(238,246,255,0.85)'],
        [0.75, 'rgba(238,246,255,0.25)'],
        [1, 'rgba(238,246,255,0)']
      ], 256),
      transparent: true,
      depthWrite: false,
      toneMapped: false
    })
  );
  backdrop.position.set(0.2, 1.9, -3.6);
  rig.add(backdrop);

  // ── Contact shadow ──
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 2.6),
    new THREE.MeshBasicMaterial({
      map: makeRadialTexture([
        [0, 'rgba(15,23,42,0.30)'],
        [0.55, 'rgba(15,23,42,0.12)'],
        [1, 'rgba(15,23,42,0)']
      ], 256),
      transparent: true,
      depthWrite: false,
      toneMapped: false
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0.1, 0.002, 0.1);
  rig.add(contactShadow);

  // ── The five glass growth slabs ──
  function roundedSlabGeometry(width, height, radius, depth) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    shape.moveTo(x + radius, 0);
    shape.lineTo(x + width - radius, 0);
    shape.quadraticCurveTo(x + width, 0, x + width, radius);
    shape.lineTo(x + width, height - radius);
    shape.quadraticCurveTo(x + width, height, x + width - radius, height);
    shape.lineTo(x + radius, height);
    shape.quadraticCurveTo(x, height, x, height - radius);
    shape.lineTo(x, radius);
    shape.quadraticCurveTo(x, 0, x + radius, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
      curveSegments: 10
    });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  function slabMaterial(tint) {
    if (useTransmission) {
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.34,
        transmission: 1,
        thickness: 1.1,
        ior: 1.45,
        attenuationColor: tint,
        attenuationDistance: 1.6,
        clearcoat: 0.55,
        clearcoatRoughness: 0.3,
        envMapIntensity: 1.15
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: tint.clone().lerp(new THREE.Color(0xffffff), 0.08),
      metalness: 0,
      roughness: 0.38,
      transparent: true,
      opacity: 0.72,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.5,
      depthWrite: false
    });
  }

  const SLAB_HEIGHTS = [0.9, 1.35, 1.85, 2.4, 3.0];
  const SLAB_Z = [0.18, -0.14, 0.12, -0.18, 0.05];
  const slabs = [];
  SLAB_HEIGHTS.forEach((height, index) => {
    const t = index / (SLAB_HEIGHTS.length - 1);
    const slab = new THREE.Mesh(
      roundedSlabGeometry(0.62, height, 0.16, 0.42),
      slabMaterial(gradientAt(t))
    );
    slab.position.set((index - 2) * 0.88, 0, SLAB_Z[index]);
    slab.scale.y = 0.001;
    slab.userData = { index: index, lift: 0, targetLift: 0, phase: index * 0.9, appearDelay: 0.15 + index * 0.11 };
    rig.add(slab);
    slabs.push(slab);
  });

  // ── The strategy line ──
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.65, 0.45, 0.6),
    new THREE.Vector3(-1.76, 0.8, -0.3),
    new THREE.Vector3(-0.88, 1.1, 0.55),
    new THREE.Vector3(0, 1.5, -0.35),
    new THREE.Vector3(0.88, 1.95, 0.5),
    new THREE.Vector3(1.76, 2.55, -0.25),
    new THREE.Vector3(2.5, 3.25, 0.3),
    new THREE.Vector3(2.85, 3.85, 0.12)
  ], false, 'catmullrom', 0.6);

  const TUBE_SEGMENTS = 220;
  const tubeGeometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.05, 10, false);
  const vertexCount = tubeGeometry.attributes.position.count;
  const tubeColors = new Float32Array(vertexCount * 3);
  const ringSize = 11; // radialSegments + 1
  for (let i = 0; i < vertexCount; i += 1) {
    const t = Math.floor(i / ringSize) / TUBE_SEGMENTS;
    const color = gradientAt(t);
    tubeColors[i * 3] = color.r;
    tubeColors[i * 3 + 1] = color.g;
    tubeColors[i * 3 + 2] = color.b;
  }
  tubeGeometry.setAttribute('color', new THREE.BufferAttribute(tubeColors, 3));
  const tubeIndexCount = tubeGeometry.index.count;
  const tube = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
  tube.geometry.setDrawRange(0, 0);
  rig.add(tube);

  // ── The goal light at the tip ──
  const tipPosition = curve.getPointAt(1);
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 20, 20),
    new THREE.MeshBasicMaterial({ color: AMBER, toneMapped: false })
  );
  tip.position.copy(tipPosition);
  tip.scale.setScalar(0.001);
  rig.add(tip);

  const tipGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTexture([
      [0, 'rgba(244,183,64,0.85)'],
      [0.35, 'rgba(244,183,64,0.28)'],
      [1, 'rgba(244,183,64,0)']
    ], 128),
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    opacity: 0
  }));
  tipGlow.position.copy(tipPosition);
  tipGlow.scale.setScalar(0.95);
  rig.add(tipGlow);

  // ── Signal particles flowing along the line ──
  const PARTICLE_COUNT = isPhone ? 50 : 110;
  const curvePoints = curve.getSpacedPoints(511);
  const particleData = [];
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleColors = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    const t0 = Math.random();
    particleData.push({ t0: t0, speed: 0.045 + Math.random() * 0.055, offset: offset });
    const color = gradientAt(t0);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.07,
    map: makeRadialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.4, 'rgba(255,255,255,0.6)'],
      [1, 'rgba(255,255,255,0)']
    ], 64),
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  rig.add(particles);

  // ── Floating accent spheres ──
  const accents = [];
  [
    { radius: 0.09, color: TEAL, position: [-2.3, 2.7, -0.7], bob: 0.9 },
    { radius: 0.055, color: BLUE, position: [-1.1, 3.3, 0.4], bob: 1.7 },
    { radius: 0.07, color: AMBER, position: [2.0, 1.0, 0.75], bob: 2.6 }
  ].forEach((config) => {
    const accent = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius, 18, 18),
      useTransmission
        ? new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.2, transmission: 1, thickness: 0.5,
          ior: 1.45, attenuationColor: config.color, attenuationDistance: 0.5, envMapIntensity: 1.2
        })
        : new THREE.MeshPhysicalMaterial({
          color: config.color, roughness: 0.25, transparent: true, opacity: 0.7,
          clearcoat: 0.8, envMapIntensity: 1.2, depthWrite: false
        })
    );
    accent.position.fromArray(config.position);
    accent.userData = { baseY: config.position[1], bob: config.bob };
    accent.scale.setScalar(0.001);
    rig.add(accent);
    accents.push(accent);
  });

  // ── Framing: fit the composition into whatever aspect we get ──
  const LOOK_AT = new THREE.Vector3(0.12, 1.8, 0);
  const HALF_WIDTH = 3.45;
  const HALF_HEIGHT = 2.45;

  function frameScene() {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distanceForHeight = HALF_HEIGHT / halfFov;
    const distanceForWidth = HALF_WIDTH / (halfFov * camera.aspect);
    const distance = Math.max(distanceForHeight, distanceForWidth) + 1.2;
    camera.position.set(LOOK_AT.x + 0.25, LOOK_AT.y + 0.55, distance);
    camera.lookAt(LOOK_AT);
    camera.updateProjectionMatrix();
  }

  // ── Interaction + animation state ──
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let scrollYaw = 0;
  let isVisible = true;
  let animationId = null;
  let raycastPending = false;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const clock = new THREE.Clock();

  function updateScrollYaw() {
    const heroHeight = hero.offsetHeight || 1;
    scrollYaw = clamp01(window.scrollY / heroHeight) * 0.34;
  }

  function renderFrame() {
    animationId = null;
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    const reduced = prefersReducedMotion();

    // Entrance choreography: slabs rise → line draws → goal ignites → signals flow
    const drawProgress = reduced ? 1 : easeOutCubic(stage(elapsed, 0.85, 1.5));
    tube.geometry.setDrawRange(0, Math.floor((drawProgress * tubeIndexCount) / 3) * 3);

    slabs.forEach((slab) => {
      const rise = reduced ? 1 : easeOutBack(stage(elapsed, slab.userData.appearDelay, 0.85));
      const breath = reduced ? 0 : Math.sin(elapsed * 0.7 + slab.userData.phase) * 0.012;
      slab.userData.lift += (slab.userData.targetLift - slab.userData.lift) * 0.09;
      slab.scale.y = Math.max(rise + breath, 0.001);
      slab.position.y = slab.userData.lift;
    });

    const tipPop = reduced ? 1 : easeOutBack(stage(elapsed, 2.25, 0.55));
    const pulse = reduced ? 1 : 1 + Math.sin(elapsed * 2.6) * 0.07;
    tip.scale.setScalar(Math.max(tipPop * pulse * 1, 0.001));
    tipGlow.material.opacity = tipPop * (0.75 + (pulse - 1));
    tipGlow.scale.setScalar(Math.max(tipPop * pulse * 0.95, 0.001));

    const signalFade = reduced ? 0.75 : stage(elapsed, 2.4, 1.0) * 0.75;
    particleMaterial.opacity = signalFade;
    if (signalFade > 0) {
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const data = particleData[i];
        const t = reduced ? data.t0 : (data.t0 + elapsed * data.speed) % 1;
        const point = curvePoints[Math.floor(t * 511)];
        positions[i * 3] = point.x + data.offset.x;
        positions[i * 3 + 1] = point.y + data.offset.y;
        positions[i * 3 + 2] = point.z + data.offset.z;
      }
      particleGeometry.attributes.position.needsUpdate = true;
    }

    accents.forEach((accent, index) => {
      const pop = reduced ? 1 : easeOutBack(stage(elapsed, 1.5 + index * 0.2, 0.7));
      accent.scale.setScalar(Math.max(pop, 0.001));
      if (!reduced) {
        accent.position.y = accent.userData.baseY + Math.sin(elapsed * 0.55 + accent.userData.bob) * 0.09;
      }
    });

    if (!reduced) {
      pointerX += (targetPointerX - pointerX) * 0.05;
      pointerY += (targetPointerY - pointerY) * 0.05;
      const idleSway = Math.sin(elapsed * 0.22) * (isCompact ? 0.06 : 0.035);
      rig.rotation.y = idleSway + pointerX * 0.09 + scrollYaw;
      rig.rotation.x = pointerY * 0.04;

      if (raycastPending && !isCompact) {
        raycastPending = false;
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(slabs, false);
        const hit = hits.length ? hits[0].object : null;
        slabs.forEach((slab) => { slab.userData.targetLift = slab === hit ? 0.14 : 0; });
        renderer.domElement.style.cursor = hit ? 'pointer' : '';
      }
    }

    renderer.render(scene, camera);
    if (isVisible && !reduced) animationId = requestAnimationFrame(renderFrame);
  }

  function requestRender() {
    if (animationId === null && isVisible) animationId = requestAnimationFrame(renderFrame);
  }

  if (!isCompact) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      targetPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      targetPointerX = 0;
      targetPointerY = 0;
    });
    renderer.domElement.addEventListener('pointermove', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycastPending = true;
    }, { passive: true });
    renderer.domElement.addEventListener('pointerleave', () => {
      slabs.forEach((slab) => { slab.userData.targetLift = 0; });
      renderer.domElement.style.cursor = '';
    });
  }

  window.addEventListener('scroll', updateScrollYaw, { passive: true });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting && !document.hidden;
    if (isVisible) {
      clock.getDelta();
      requestRender();
    } else if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }, { threshold: 0.02 });
  visibilityObserver.observe(hero);

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden && hero.getBoundingClientRect().bottom > 0;
    requestRender();
  });

  if (window.ResizeObserver) {
    new ResizeObserver(() => { frameScene(); requestRender(); }).observe(container);
  }
  window.addEventListener('resize', () => { frameScene(); requestRender(); });
  reducedMotionQuery.addEventListener('change', requestRender);

  updateScrollYaw();
  frameScene();
  renderFrame();
  hero.classList.add('three-ready');
  requestRender();
  }
})();
