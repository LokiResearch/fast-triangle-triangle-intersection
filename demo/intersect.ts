import {GUI, GUIController} from 'dat.gui';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {trianglesIntersect} from '../src/trianglesIntersect';


const t1 = new THREE.Triangle();
const t2 = new THREE.Triangle();

const params = {
  scale: 0.05,
  t1Text: "",
  t2Text: "",
};

t1.a.set(-1, 0, 0);
t1.b.set(2, 0, -2);
t1.c.set(2, 0, 2);
t2.a.set(1, 0, 0);
t2.b.set(-2, -2, 0);
t2.c.set(-2, 2, 0);

const bgColor = 0x555555;

// Init renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(bgColor, 1);
document.body.appendChild(renderer.domElement);

// Init scene
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Init camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(10, 10, 10);
camera.far = 100;
camera.updateProjectionMatrix();

// Init material
const interMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const t1Material = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
const t2Material = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

// Init tri meshes
const triGeometry = new THREE.BufferGeometry();
triGeometry.setAttribute('position', new THREE.BufferAttribute(
  new Float32Array([1, 1, 1, 2, 2, 2, 3, 3, 3]), 3)); // Only need 9 floats to be updated later on

const t1Mesh = new THREE.Mesh(triGeometry.clone(), t1Material);
scene.add(t1Mesh);
const t2Mesh = new THREE.Mesh(triGeometry.clone(), t2Material);
scene.add(t2Mesh);


// Init controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

orbitControls.addEventListener('change', function () {
  render(false);
});


window.addEventListener('resize', function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  render(false);

}, false);


// Intersection
const interInfo = {
  type: "",
  p1: "",
  p2: "",
  p3: "",
  p4: "",
  p5: "",
  p6: "",
};
const interPoints = new Array<THREE.Vector3>();
const interMesh = new THREE.Mesh(new THREE.BufferGeometry(), interMaterial);
scene.add(interMesh);


// Init gui
const gui = new GUI();

gui.add(params, 'scale', 0.0001, 1, 0.0001).onChange(render);
gui.add(params, 't1Text').onFinishChange(updateTriFromTextFields);
gui.add(params, 't2Text').onFinishChange(updateTriFromTextFields);

// TriSphere positions
const tris = {'t1': t1, 't2': t2};
for (const triName of (['t1', 't2'] as const)) {

  const triFolder = gui.addFolder(triName);

  for (const pName of (['a', 'b', 'c'] as const)) {

    const pFolder = triFolder.addFolder(pName);

    for (const coord of ['x', 'y', 'z']) {

      pFolder.add(tris[triName][pName], coord)
        .min(-10).max(10).step(0.001).onChange(updateTrianglesFromGui);
    }
  }
}

// Intersection gui
const interFolderGui = gui.addFolder("Intersection");
const interPointsGui = new Array<GUIController>();
interFolderGui.add(interInfo, 'type');
interFolderGui.open();

gui.open();


function updateTriFromTextFields() {
  let text1 = params.t1Text;
  let text2 = params.t2Text;

  text1 = text1.replaceAll('),(', ');(',);
  text2 = text2.replaceAll('),(', ');(');
  text1 = text1.replaceAll('(', '').replaceAll(')', '');
  text2 = text2.replaceAll('(', '').replaceAll(')', '');

  const vectors1 = text1.split(';');
  const vectors2 = text2.split(';');
  if (vectors1.length !==3 || vectors2.length !== 3){
    return;
  }

  const triPos = [t1.a, t1.b, t1.c, t2.a, t2.b, t2.c];
  for (let i=0; i<3; i++) {
    const coords1 = vectors1[i].split(',');
    const coords2 = vectors2[i].split(',');
    if (coords1.length !== 3 || coords2.length !== 3) {
      return;
    }

    triPos[i].x = Number.parseFloat(coords1[0])
    triPos[i].y = Number.parseFloat(coords1[1])
    triPos[i].z = Number.parseFloat(coords1[2])

    triPos[i+3].x = Number.parseFloat(coords2[0])
    triPos[i+3].y = Number.parseFloat(coords2[1])
    triPos[i+3].z = Number.parseFloat(coords2[2])

  }

  updateTriangles();
}

function updateTrianglesFromGui() {
  updateTextFields();
  updateTriangles();
}

function vector3toStr(v: THREE.Vector3) {
  return `(${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)})`;
}

function triToStr(tri: THREE.Triangle) {
  return vector3toStr(tri.a)+','+vector3toStr(tri.b)+','+vector3toStr(tri.c);
}

function updateTextFields() {
  params.t1Text = triToStr(t1);
  params.t2Text = triToStr(t2);
  params.t1Text.replace(' ', '');
  params.t2Text.replace(' ', '');
}

function updateTrianglesGeometry() {

  const buff1 = t1Mesh.geometry.getAttribute('position');
  buff1.setXYZ(0, t1.a.x, t1.a.y, t1.a.z);
  buff1.setXYZ(1, t1.b.x, t1.b.y, t1.b.z);
  buff1.setXYZ(2, t1.c.x, t1.c.y, t1.c.z);
  buff1.needsUpdate = true;
  t1Mesh.geometry.computeVertexNormals();

  const buff2 = t2Mesh.geometry.getAttribute('position');
  buff2.setXYZ(0, t2.a.x, t2.a.y, t2.a.z);
  buff2.setXYZ(1, t2.b.x, t2.b.y, t2.b.z);
  buff2.setXYZ(2, t2.c.x, t2.c.y, t2.c.z);
  buff2.needsUpdate = true;
  t2Mesh.geometry.computeVertexNormals();

}

function updateInterInfoGui() {

  for(let i=0; i<interPointsGui.length; i++) {
    interPointsGui[i].remove();
  }

  interPointsGui.splice(0, interPointsGui.length);

  for (let i = 0; i < interPoints.length; i ++) {
    const key = 'p'+(i+1) as 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' ;

    interInfo[key] = vector3toStr(interPoints[i]);

    interPointsGui.push(interFolderGui.add(interInfo, 'p'+(i+1)));
  }

}

function updateIntersectionMesh() {

  interMesh.geometry.dispose();
  interMesh.position.set(0,0,0);
  interMesh.rotation.set(0,0,0);

  if (interPoints.length === 1) {

    // Just a sphere
    interMesh.geometry = new THREE.SphereGeometry();
    interMesh.position.copy(interPoints[0]);
    interMesh.geometry.scale(params.scale, params.scale, params.scale);

  } else if (interPoints.length === 2) {

    // Custom cylinder
    const direction = new THREE.Vector3().subVectors(interPoints[0], interPoints[1]);
    interMesh.geometry = new THREE.CylinderGeometry(params.scale, params.scale, direction.length(), 6, 4);
    interMesh.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, direction.length() / 2, 0));
    interMesh.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(90)));
    interMesh.geometry.computeVertexNormals();
    interMesh.position.copy(interPoints[0]);
    interMesh.lookAt(interPoints[1]);

  } else {

    const normal = new THREE.Vector3();
    t1.getNormal(normal).normalize().multiplyScalar(0.001);

    const s = interPoints.length;
    const array = new Float32Array((s-2)*18);

    let idx = 0;

    for (let i=0; i<s-2; i++) {

      // Top face
      array[idx++] = interPoints[0].x + normal.x;
      array[idx++] = interPoints[0].y + normal.y;
      array[idx++] = interPoints[0].z + normal.z;

      array[idx++] = interPoints[i+1].x + normal.x;
      array[idx++] = interPoints[i+1].y + normal.y;
      array[idx++] = interPoints[i+1].z + normal.z;

      array[idx++] = interPoints[i+2].x + normal.x;
      array[idx++] = interPoints[i+2].y + normal.y;
      array[idx++] = interPoints[i+2].z + normal.z;

      // Bottom face

      array[idx++] = interPoints[0].x-normal.x;
      array[idx++] = interPoints[0].y-normal.y;
      array[idx++] = interPoints[0].z-normal.z;

      array[idx++] = interPoints[i+1].x-normal.x;
      array[idx++] = interPoints[i+1].y-normal.y;
      array[idx++] = interPoints[i+1].z-normal.z;

      array[idx++] = interPoints[i+2].x-normal.x;
      array[idx++] = interPoints[i+2].y-normal.y;
      array[idx++] = interPoints[i+2].z-normal.z;

    }

    interMesh.geometry = new THREE.BufferGeometry();
    interMesh.geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(array), 3));

    interMesh.geometry.computeVertexNormals();
  }

}

function updateTriangles() {
  updateTrianglesGeometry();
  render();
}

function render(updateIntersection = true) {

  if (updateIntersection) {

    interMesh.visible = false;

    const inter = trianglesIntersect(t1, t2, interPoints)
    interInfo.type = inter ?? "No-intersection";
    updateInterInfoGui();

    if (inter) {
      updateIntersectionMesh();
      interMesh.visible = true;
    }
  }


  gui.updateDisplay();

  renderer.render(scene, camera);

}

updateTextFields();
updateTrianglesFromGui();
