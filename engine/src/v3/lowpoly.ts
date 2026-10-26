import * as THREE from 'three';

const hash = (a: number, b: number, c: number, s: number) => {
  const h = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + s * 19.31) * 43758.5453;
  return h - Math.floor(h);
};

// Move each vertex by fn; vertices sharing a position move together so faces stay closed.
export const deform = (g: THREE.BufferGeometry, fn: (v: THREE.Vector3) => void) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    fn(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
};

// Seeded jitter for the hand-made low-poly look.
export const facet = (g: THREE.BufferGeometry, amt: number, seed = 1) =>
  deform(g, (v) => {
    const kx = Math.round(v.x * 500), ky = Math.round(v.y * 500), kz = Math.round(v.z * 500);
    v.x += (hash(kx, ky, kz, seed) - 0.5) * 2 * amt;
    v.y += (hash(ky, kz, kx, seed + 1) - 0.5) * 2 * amt;
    v.z += (hash(kz, kx, ky, seed + 2) - 0.5) * 2 * amt;
  });

// One colour per triangle, picked from the triangle centroid.
export const faceColors = (g0: THREE.BufferGeometry, fn: (c: THREE.Vector3, k: number) => THREE.Color) => {
  const g = g0.index ? g0.toNonIndexed() : g0;
  const p = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    c.set(0, 0, 0);
    for (let j = 0; j < 3; j++) c.add(new THREE.Vector3(p.getX(i + j), p.getY(i + j), p.getZ(i + j)));
    c.multiplyScalar(1 / 3);
    const k = fn(c, i / 3);
    for (let j = 0; j < 3; j++) col.set([k.r, k.g, k.b], (i + j) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
};

export const shade = (hex: string, f: number) => new THREE.Color(hex).multiplyScalar(f);
export const mix = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);
export const rnd = (k: number, s = 0) => hash(k, k * 0.37, k * 1.91, s);

// Where a ray along -z hits a mesh: used to sit eyes/brows/mouth on the faceted face.
export const surfaceZ = (mesh: THREE.Mesh, x: number, y: number) => {
  const rc = new THREE.Raycaster(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1));
  const hit = rc.intersectObject(mesh, false)[0];
  return hit ? hit.point.z : 0;
};

export const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const easeIO = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
