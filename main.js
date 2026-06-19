// --- basic setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.Fog(0x050505, 8, 35);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(3.2, 1.6, 5.5);
camera.lookAt(0, 0.45, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// --- lights ---
const ambient = new THREE.AmbientLight(0x222244, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
keyLight.position.set(8, 6, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 40;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.bias = -0.0001;
keyLight.shadow.normalBias = 0.02;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8899cc, 1.8);
fillLight.position.set(-3, 2, -1);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
rimLight.position.set(0, 2, -6);
scene.add(rimLight);

const underGlow = new THREE.PointLight(0x335577, 3, 3, 2);
underGlow.position.set(0, -0.3, 0);
scene.add(underGlow);

// --- floor ---
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.4, metalness: 0.1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
floor.receiveShadow = true;
scene.add(floor);

// showroom glow under car
const glowGeo = new THREE.PlaneGeometry(4.5, 3);
const glowMat = new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.25, depthWrite: false });
const glowPlane = new THREE.Mesh(glowGeo, glowMat);
glowPlane.rotation.x = -Math.PI / 2;
glowPlane.position.y = -1.19;
scene.add(glowPlane);

// --- car group ---
const car = new THREE.Group();
car.rotation.x = -0.04; // aggressive forward lean
scene.add(car);

// all body parts that change color
const bodyParts = [];

// helper to make a box
function box(w, h, d, color, matType = 'paint', emissive = 0x000000) {
  const geo = new THREE.BoxGeometry(w, h, d);
  let mat;
  if (matType === 'paint') {
    mat = new THREE.MeshPhysicalMaterial({
      color, metalness: 0.95, roughness: 0.28, clearcoat: 0.35, clearcoatRoughness: 0.15,
      emissive, emissiveIntensity: 0.1,
    });
  } else if (matType === 'dark') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
  } else if (matType === 'chrome') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.95 });
  } else if (matType === 'glass') {
    mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.05, metalness: 0.1, opacity: 0.7, transparent: true });
  } else if (matType === 'emissive') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1, emissive: color, emissiveIntensity: 1.2 });
  } else {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (matType === 'paint') bodyParts.push(mesh);
  return mesh;
}

// helper for cylinders
function cyl(rTop, rBot, h, color, matType = 'chrome') {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, 32);
  let mat;
  if (matType === 'chrome') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.95 });
  } else if (matType === 'dark') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
  } else if (matType === 'emissive') {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.1, emissive: color, emissiveIntensity: 1.5 });
  } else {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 });
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// --- lower body ---
const lowerBody = box(1.82, 0.55, 4.6, 0x0066b3);
lowerBody.position.set(0, 0.6, 0);
car.add(lowerBody);

// --- upper cabin ---
const cabin = box(1.72, 0.38, 1.9, 0x0a0a14, 'glass');
cabin.position.set(0, 1.06, 0.15);
car.add(cabin);

// --- hood ---
const hood = box(1.76, 0.08, 1.3, 0x005799);
hood.position.set(0, 0.92, 1.2);
car.add(hood);

// --- trunk ---
const trunk = box(1.76, 0.08, 0.85, 0x005799);
trunk.position.set(0, 0.92, -1.4);
car.add(trunk);

// --- front bumper ---
const frontBumper = box(1.86, 0.3, 0.14, 0x00528a);
frontBumper.position.set(0, 0.32, 2.32);
car.add(frontBumper);

// --- rear bumper ---
const rearBumper = box(1.86, 0.3, 0.14, 0x00528a);
rearBumper.position.set(0, 0.32, -2.32);
car.add(rearBumper);

// --- kidney grille ---
const grilleFrame = box(0.3, 0.3, 0.04, 0x333333, 'chrome');
grilleFrame.position.set(0, 0.7, 2.34);
car.add(grilleFrame);

const grilleL = box(0.1, 0.24, 0.07, 0x111111, 'dark');
grilleL.position.set(-0.08, 0.7, 2.35);
car.add(grilleL);

const grilleR = box(0.1, 0.24, 0.07, 0x111111, 'dark');
grilleR.position.set(0.08, 0.7, 2.35);
car.add(grilleR);

// m stripes on grille
const stripeB = box(0.07, 0.05, 0.08, 0x0066b3, 'emissive');
stripeB.position.set(-0.16, 0.84, 2.36);
car.add(stripeB);

const stripeP = box(0.07, 0.05, 0.08, 0x4a2080, 'emissive');
stripeP.position.set(-0.16, 0.79, 2.36);
car.add(stripeP);

const stripeR = box(0.07, 0.05, 0.08, 0xe30b20, 'emissive');
stripeR.position.set(-0.16, 0.74, 2.36);
car.add(stripeR);

// --- headlights ---
const headlightL = box(0.35, 0.1, 0.07, 0xffffff, 'emissive');
headlightL.position.set(-0.5, 0.68, 2.33);
car.add(headlightL);

const headlightR = box(0.35, 0.1, 0.07, 0xffffff, 'emissive');
headlightR.position.set(0.5, 0.68, 2.33);
car.add(headlightR);

// angel eyes (thin rings around headlights)
const angelL = box(0.38, 0.14, 0.03, 0xaaccff, 'emissive');
angelL.position.set(-0.5, 0.68, 2.35);
car.add(angelL);

const angelR = box(0.38, 0.14, 0.03, 0xaaccff, 'emissive');
angelR.position.set(0.5, 0.68, 2.35);
car.add(angelR);

// front air intakes
const intakeL = box(0.25, 0.15, 0.08, 0x0a0a0a, 'dark');
intakeL.position.set(-0.55, 0.28, 2.34);
car.add(intakeL);

const intakeR = box(0.25, 0.15, 0.08, 0x0a0a0a, 'dark');
intakeR.position.set(0.55, 0.28, 2.34);
car.add(intakeR);

const intakeCenter = box(0.4, 0.12, 0.08, 0x0a0a0a, 'dark');
intakeCenter.position.set(0, 0.24, 2.34);
car.add(intakeCenter);

// --- taillights (L-shape for BMW look) ---
const taillightL = box(0.35, 0.1, 0.06, 0xff1111, 'emissive');
taillightL.position.set(-0.5, 0.68, -2.33);
car.add(taillightL);

const taillightR = box(0.35, 0.1, 0.06, 0xff1111, 'emissive');
taillightR.position.set(0.5, 0.68, -2.33);
car.add(taillightR);

// vertical part of L-shape
const tailVertL = box(0.06, 0.16, 0.06, 0xff1111, 'emissive');
tailVertL.position.set(-0.66, 0.55, -2.33);
car.add(tailVertL);

const tailVertR = box(0.06, 0.16, 0.06, 0xff1111, 'emissive');
tailVertR.position.set(0.66, 0.55, -2.33);
car.add(tailVertR);

// --- side skirts ---
const skirtL = box(0.06, 0.1, 2.0, 0x111111, 'dark');
skirtL.position.set(-0.92, 0.38, 0);
car.add(skirtL);

const skirtR = box(0.06, 0.1, 2.0, 0x111111, 'dark');
skirtR.position.set(0.92, 0.38, 0);
car.add(skirtR);

// m side gills
const gillL = box(0.04, 0.1, 0.26, 0x333333, 'chrome');
gillL.position.set(-0.93, 0.62, -0.1);
car.add(gillL);

const gillR = box(0.04, 0.1, 0.26, 0x333333, 'chrome');
gillR.position.set(0.93, 0.62, -0.1);
car.add(gillR);

// hood power dome
const domeGeo = new THREE.BoxGeometry(0.4, 0.05, 0.7);
const domeMat = new THREE.MeshPhysicalMaterial({ color: 0x005799, metalness: 0.95, roughness: 0.28, clearcoat: 0.35, clearcoatRoughness: 0.15 });
const dome = new THREE.Mesh(domeGeo, domeMat);
dome.position.set(0, 0.98, 1.05);
dome.castShadow = true;
dome.receiveShadow = true;
bodyParts.push(dome);
car.add(dome);

// --- mirrors ---
const mirrorL = box(0.07, 0.06, 0.13, 0x00528a, 'paint');
mirrorL.position.set(-0.95, 0.98, 0.35);
mirrorL.rotation.z = 0.3;
car.add(mirrorL);

const mirrorR = box(0.07, 0.06, 0.13, 0x00528a, 'paint');
mirrorR.position.set(0.95, 0.98, 0.35);
mirrorR.rotation.z = -0.3;
car.add(mirrorR);

// --- rear diffuser ---
const diffuser = box(1.7, 0.08, 0.25, 0x151515, 'dark');
diffuser.position.set(0, 0.2, -2.38);
car.add(diffuser);

// diffuser fins
[-0.4, -0.15, 0.15, 0.4].forEach((x) => {
  const fin = box(0.03, 0.12, 0.22, 0x1a1a1a, 'dark');
  fin.position.set(x, 0.13, -2.4);
  car.add(fin);
});

// --- spoiler ---
const spoiler = box(1.66, 0.04, 0.14, 0x1a1a1a, 'chrome');
spoiler.position.set(0, 1.0, -1.76);
car.add(spoiler);

// --- wheels ---
const wheelPositions = [
  { x: -0.88, z: 1.45 }, // front left
  { x: 0.88, z: 1.45 },  // front right
  { x: -0.88, z: -1.45 }, // rear left
  { x: 0.88, z: -1.45 },  // rear right
];

const wheels = [];

wheelPositions.forEach((pos) => {
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(pos.x, 0.29, pos.z);
  car.add(wheelGroup);

  // tire
  const tireGeo = new THREE.TorusGeometry(0.26, 0.09, 16, 32);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85, metalness: 0.05 });
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.rotation.y = Math.PI / 2;
  tire.castShadow = true;
  tire.receiveShadow = true;
  wheelGroup.add(tire);

  // rim
  const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 32);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.9 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.z = Math.PI / 2;
  rim.castShadow = true;
  wheelGroup.add(rim);

  // spokes (simple cross)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spokeGeo = new THREE.BoxGeometry(0.03, 0.03, 0.3);
    const spoke = new THREE.Mesh(spokeGeo, rimMat);
    spoke.rotation.y = angle;
    spoke.position.x = Math.cos(angle) * 0.06;
    spoke.position.y = Math.sin(angle) * 0.06;
    wheelGroup.add(spoke);
  }

  wheels.push(wheelGroup);
});

// --- exhaust tips ---
const exhaustPositions = [-0.38, -0.13, 0.13, 0.38];
exhaustPositions.forEach((x) => {
  const tip = cyl(0.045, 0.05, 0.18, 0x888888, 'chrome');
  tip.rotation.x = Math.PI / 2;
  tip.position.set(x, 0.22, -2.39);
  car.add(tip);
});

// --- front splitter ---
const splitter = box(1.82, 0.03, 0.18, 0x1a1a1a, 'dark');
splitter.position.set(0, 0.15, 2.38);
car.add(splitter);

// --- carbon roof texture (canvas) ---
const texCanvas = document.createElement('canvas');
texCanvas.width = 256;
texCanvas.height = 256;
const ctx = texCanvas.getContext('2d');
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, 256, 256);

// carbon weave pattern
for (let y = 0; y < 256; y += 8) {
  for (let x = 0; x < 256; x += 16) {
    const offset = (y / 8) % 2 === 0 ? 0 : 8;
    ctx.fillStyle = '#252525';
    ctx.fillRect(x + offset, y, 12, 4);
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(x + offset + 4, y + 2, 8, 3);
  }
}

const carbonTex = new THREE.CanvasTexture(texCanvas);
carbonTex.wrapS = THREE.RepeatWrapping;
carbonTex.wrapT = THREE.RepeatWrapping;
carbonTex.repeat.set(3, 3);

// roof with carbon texture
const roofGeo = new THREE.BoxGeometry(1.65, 0.04, 1.8);
const roofMat = new THREE.MeshStandardMaterial({ map: carbonTex, roughness: 0.4, metalness: 0.1, color: 0x333333 });
const roof = new THREE.Mesh(roofGeo, roofMat);
roof.position.set(0, 1.26, 0.15);
roof.castShadow = true;
roof.receiveShadow = true;
car.add(roof);

// --- particles ---
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
  posArray[i] = (Math.random() - 0.5) * 14;
  posArray[i + 1] = Math.random() * 6 - 1;
  posArray[i + 2] = (Math.random() - 0.5) * 14;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({ size: 0.015, color: 0x6688aa, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// --- current state ---
let targetColor = new THREE.Color('#0066b3');
let currentColor = new THREE.Color('#0066b3');
let targetCamPos = new THREE.Vector3(3.2, 1.6, 5.5);
let targetCamLook = new THREE.Vector3(0, 0.45, 0);
let currentLookTarget = new THREE.Vector3(0, 0.45, 0);
let scrollPercent = 0;

// camera positions for each section
const camPositions = [
  { pos: new THREE.Vector3(3.2, 1.6, 5.5), look: new THREE.Vector3(0, 0.45, 0) },       // hero - front 3/4
  { pos: new THREE.Vector3(1.2, 0.55, 4.0), look: new THREE.Vector3(0, 0.55, 1.0) },      // engine - front zoom
  { pos: new THREE.Vector3(5.0, 1.1, 0.2), look: new THREE.Vector3(0, 0.55, 0) },         // design - side
  { pos: new THREE.Vector3(-2.5, 1.0, -5.0), look: new THREE.Vector3(0, 0.45, -1.5) },    // rear
  { pos: new THREE.Vector3(1.5, 4.5, 3.0), look: new THREE.Vector3(0, 0.5, 0) },          // colors - top
];

// --- ui stuff ---
const loadingScreen = document.getElementById('loading');
const navDots = document.querySelectorAll('.nav-dot');
const colorBtns = document.querySelectorAll('.color-btn');
const sections = document.querySelectorAll('.panel');

// hide loading screen
function hideLoader() {
  loadingScreen.classList.add('hidden');
}

// once everything is ready
if (document.readyState === 'complete') {
  setTimeout(hideLoader, 500);
} else {
  window.addEventListener('load', () => setTimeout(hideLoader, 500));
}

// safety fallback — never stuck on loading
setTimeout(hideLoader, 4000);

// color buttons
colorBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    targetColor.set(btn.dataset.color);
  });
});

// nav dots
navDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.section);
    sections[idx].scrollIntoView({ behavior: 'smooth' });
  });
});

// track which section is visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const idx = Array.from(sections).indexOf(entry.target);
      navDots.forEach(d => d.classList.remove('active'));
      if (navDots[idx]) navDots[idx].classList.add('active');
    }
  });
}, { threshold: 0.5 });

sections.forEach((sec) => observer.observe(sec));

// --- scroll handler ---
function updateScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

  // figure out which section and blend
  const sectionCount = camPositions.length;
  const rawIdx = scrollPercent * (sectionCount - 1);
  const idx = Math.min(Math.floor(rawIdx), sectionCount - 2);
  const frac = rawIdx - idx;

  const p1 = camPositions[idx];
  const p2 = camPositions[Math.min(idx + 1, sectionCount - 1)];

  targetCamPos.lerpVectors(p1.pos, p2.pos, frac);
  targetCamLook.lerpVectors(p1.look, p2.look, frac);
}

// --- animation loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);

  updateScroll();

  // smooth camera
  camera.position.lerp(targetCamPos, 3 * dt);
  currentLookTarget.lerp(targetCamLook, 4 * dt);
  camera.lookAt(currentLookTarget);

  // hero section: auto rotate car
  if (scrollPercent < 0.15) {
    car.rotation.y += 0.25 * dt;
  } else if (scrollPercent < 0.3) {
    car.rotation.y += (0.25 * (1 - (scrollPercent - 0.15) / 0.15)) * dt;
  }

  // smooth color
  currentColor.lerp(targetColor, 3 * dt);
  bodyParts.forEach((part) => {
    part.material.color.copy(currentColor);
  });

  // spin the wheels
  wheels.forEach((w) => {
    w.rotation.x += 0.5 * dt;
  });

  // animate particles
  particles.rotation.y += 0.02 * dt;
  particles.rotation.x += 0.005 * dt;

  renderer.render(scene, camera);
}

// --- resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// start
animate();
