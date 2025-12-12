import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// To control what frequency range FFT analyzes and Eye Size Range
var rangeMin = 50;
var rangeMax = 200;
var eyeSizeMin = 0.8;
var eyeSizeMax = 1.4;


class eyeModel {
constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.scale = options.scale || { x: 1, y: 1, z: 1 };
    this.rotation = options.rotation || { x: 0, y: 0, z: 0 };

    this.model = null;
    this.isLoaded = false;

    this.intersectionPoint = new THREE.Vector3();
    this.planeNormal = new THREE.Vector3();
    this.plane = new THREE.Plane();
    this.mousePosition = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.centroidX = 0;
    this.centroidY = 0;
    this.centroidZ = 0;
    this.scrollPos = { x: 1920, y: 1080 };

    // this is coefs for video cam position from screen center. 
    this.cameraCoefY = -0.145;
    this.cameraCoefZ = 0.0219;
    // This is the coefs for calibration based on object's position from screen center. Find a way to calibrate this. U stopped here.
        // Additionally try doing +/- for centroid.Z instead of *
        // Make button controls to calibrate this
        // We multiply it by position, to unnormalize the normalized coef(0.164) for each object(just like u did with NDC).
    this.objectCoefX = 0.164 * this.position.x;
    this.objectCoefY = 0.255 * this.position.y;

    this.wheelListener();
    this.loadModel();

    this.clock = new THREE.Clock();
    this.time;
    //To make each eye's starting point unique
    this.noiseOffsetX = Math.random() * 1000;
    this.noiseOffsetY = Math.random() * 1000

    // UNCOMMENT to disable mouseDetection
    // this.mouseDetection();
}

loadModel() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./models/humanEye/scene.gltf', (gltfModel) => {
        this.model = gltfModel.scene;
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.scale.set(this.scale.x, this.scale.y, this.scale.z);
        this.targetScale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
        this.scene.add(this.model);
        this.isLoaded = true;
    });
}

wheelListener() {
    window.addEventListener('wheel', (e) => {
        this.objectCoefX += this.position.x * e.deltaX / 1000;
        this.objectCoefY += this.position.y * e.deltaY / 1000;
    });
}

mouseDetection(){  
  const intersectionPoint = new THREE.Vector3();
  const planeNormal = new THREE.Vector3();
  const plane = new THREE.Plane();
  const mousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  window.addEventListener('mousemove', (e) => {
      mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
      planeNormal.copy(this.camera.position).normalize();
      plane.setFromNormalAndCoplanarPoint(planeNormal, this.scene.position);
      raycaster.setFromCamera(mousePosition, this.camera);
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      if (this.model) this.model.lookAt(intersectionPoint.x, intersectionPoint.y, 2);
  });   
}

update() {
  // Random movement. UNCOMMENT to remove randomness
//   this.time = this.clock.getElapsedTime();
//   //Change the numbers to increase/decrease rotation speed
//   let x = THREE.MathUtils.mapLinear(Math.cos(this.time * 0.5 + this.noiseOffsetX) * Math.sin(this.time * 0.7 + this.noiseOffsetX), -1, 1, -2, 2);
//   let y = THREE.MathUtils.mapLinear(Math.sin(this.time * 0.2 + this.noiseOffsetY) * Math.cos(this.time * 0.8 + this.noiseOffsetY), -1, 1, -2, 2);
//   if (this.model) this.model.lookAt(x, y, 2);
    if(this.isLoaded && this.model){
        this.centroidX = THREE.MathUtils.mapLinear(sharedState.facePosition.x, 0, 640, 0, 1920);
        this.centroidY = THREE.MathUtils.mapLinear(sharedState.facePosition.y, 0, 480, 0, 1080);
        // this.centroidZ = mapFunc(sharedState.facePosition.z, -150, 0, 0, 50); // Introducing Z-axis

        
        // this.mousePosition.x = THREE.MathUtils.mapLinear(((this.centroidX/1920) * 2 -1), -1, 1, -1*this.cameraCoefZ*this.centroidZ + this.objectCoefX, 1*this.cameraCoefZ*this.centroidZ + this.objectCoefX);
        // this.mousePosition.y =  THREE.MathUtils.mapLinear((-(this.centroidY/1080) * 2 + 1), -1, 1, -1*this.cameraCoefZ*this.centroidZ + this.cameraCoefY + this.objectCoefY, 1*this.cameraCoefZ*this.centroidZ + this.cameraCoefY + this.objectCoefY);
        this.mousePosition.x = (this.centroidX/1920) * 2 -1;
        this.mousePosition.y = -(this.centroidY/1080) * 2 + 1;
        
        
        this.planeNormal.copy(this.camera.position).normalize();
        this.plane.setFromNormalAndCoplanarPoint(this.planeNormal, this.scene.position);
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);
        
        if (this.model) this.model.lookAt(this.intersectionPoint.x, this.intersectionPoint.y, 2);
    }
}

dispose() {
    if (this.model) {
        this.scene.remove(this.model);
    }
}
}


// =============== MAIN.JS ===============
const lerpSpeed = 0.2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
camera.position.setZ(5);

// Create eyes
const eye0 = new eyeModel(scene, camera, { position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } });
const eye1 = new eyeModel(scene, camera, { position: { x: 3.5, y: 1.5, z: 0.5 }, scale: { x: 1, y: 1, z: 1 } });
const eye2 = new eyeModel(scene, camera, { position: { x: -3.5, y: -0.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } });
const eye3 = new eyeModel(scene, camera, { position: { x: 0, y: -2, z: 0.5 }, scale: { x: 1, y: 1, z: 1 } });
const eye4 = new eyeModel(scene, camera, { position: { x: -1.5, y: 2, z: 0.5 }, scale: { x: 0.8, y: 0.8, z: 0.8 } });
const eye5 = new eyeModel(scene, camera, { position: { x: 3.75, y: -2, z: 0.5 }, scale: { x: 0.5, y: 0.5, z: 0.5 } });
const eyes = [eye0, eye1, eye2, eye3, eye4, eye5];

// Lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
const pointLight = new THREE.PointLight(0xFFFFFF, 3, 0, 0.5);
pointLight.position.set(-0.25, 0.5, 1);
scene.add(pointLight, ambientLight);

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    let fftSize = THREE.MathUtils.mapLinear(sharedState.fftData.size, rangeMin, rangeMax, eyeSizeMin, eyeSizeMax);
    // console.log(sharedState.fftData.size);
    eyes.forEach((eye) => {
      eye.update();
      if (eye.model && eye.targetScale){
        eye.targetScale.set(fftSize, fftSize, fftSize);
        eye.model.scale.lerp(eye.targetScale, lerpSpeed);
      }
    })
    
    // let coef = THREE.MathUtils.mapLinear(Math.sin(time / 800), -1, 1, 1, 1.01);
    // eyes.forEach((eye) => {
    //     eye.update();
    //     if (eye.model && eye.targetScale) {
    //         eye.model.scale.lerp(eye.targetScale, lerpSpeed);
    //         eye.model.scale.set(
    //             eye.model.scale.x *= coef,
    //             eye.model.scale.y *= coef,
    //             eye.model.scale.z *= coef
    //         );
    //     }
    // });
}

animate();
