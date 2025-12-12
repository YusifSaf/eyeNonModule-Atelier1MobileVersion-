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
                this.cameraCoefY = -0.145;
                this.cameraCoefZ = 0.0219;
                this.objectCoefX = 0.164 * this.position.x;
                this.objectCoefY = 0.255 * this.position.y;

                this.wheelListener();
                this.loadModel();
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

            update() {
                if (this.isLoaded && this.model) {
                    this.centroidX = mapFunc(sharedState.facePosition.x, 0, 640, 0, 1920);
                    this.centroidY = mapFunc(sharedState.facePosition.y, 0, 480, 0, 1080);
                    this.centroidZ = mapFunc(sharedState.facePosition.z, -150, 0, 0, 1);

                    this.mousePosition.x = THREE.MathUtils.mapLinear(
                        ((this.centroidX / 1920) * 2 - 1), -1, 1,
                        -1 * this.cameraCoefZ * this.centroidZ + this.objectCoefX,
                        1 * this.cameraCoefZ * this.centroidZ + this.objectCoefX
                    );
                    this.mousePosition.y = THREE.MathUtils.mapLinear(
                        (-(this.centroidY / 1080) * 2 + 1), -1, 1,
                        -1 * this.cameraCoefZ * this.centroidZ + this.cameraCoefY + this.objectCoefY,
                        1 * this.cameraCoefZ * this.centroidZ + this.cameraCoefY + this.objectCoefY
                    );

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

export default eyeModel;

//Old
// import * as THREE from 'three';
// // import { sharedState } from './sharedState';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // this is how to import GLTFImporter to import models
// import { sharedState } from './sharedState';
// import { mapFunc } from './sharedState';
// import { debug } from 'three/tsl';

// class eyeModel {
//     constructor(scene, camera, options = {}) {
//         this.scene = scene;
//         this.camera = camera;
//         this.position = options.position || { x:0, y:0, z:0 };
//         this.scale = options.scale || { x:1, y:1, z:1 };
//         this.rotation = options.rotation || { x:0, y:0, z:0 };

//         this.model = null;
//         this.isLoaded = false;
        
//         //Raycast Setup
//         this.intersectionPoint = new THREE.Vector3();
//         this.planeNormal = new THREE.Vector3();
//         this.plane = new THREE.Plane();
//         this.mousePosition = new THREE.Vector2();
//         this.raycaster = new THREE.Raycaster();
//         this.centroidX;
//         this.centroidY;
//         this.centroidZ;
//         this.calibrationValue = 0;
//         this.scrollPos = {
//             x: 1920,
//             y: 1080
//         };

//         // this is coefs for video cam position from screen center. 
//         this.cameraCoefY = -0.145;
//         this.cameraCoefZ = 0.0219;

//         // This is the coefs for calibration based on object's position from screen center. Find a way to calibrate this. U stopped here.
//         // Additionally try doing +/- for centroid.Z instead of *
//         // Make button controls to calibrate this
//         // We multiply it by position, to unnormalize the normalized coef(0.164) for each object(just like u did with NDC).
//         this.objectCoefX = 0.164*this.position.x;//1000;
//         this.objectCoefY = 0.255*this.position.y;//1000;

//         // this.objectCoefX = this.position.x/1000
//         // this.objectCoefY = this.position.y/1000

//         this.wheelListener();
//         // this.myElement = document.querySelector('input[type="range"]')
        
//         this.loadModel();
//     }

//     loadModel(){
//         const gltfLoader = new GLTFLoader();
//         gltfLoader.load('./models/humanEye/scene.gltf', (gltfModel) => {
//           this.model = gltfModel.scene;
//           this.model.position.set(this.position.x, this.position.y, this.position.z); 
//           this.model.scale.set(this.scale.x, this.scale.y, this.scale.z); 
//           // this.model.rotation.set(0, 90, 0);

//           this.targetScale = new THREE.Vector3(this.scale.x, this.scale.y, this.scale.z);
//           this.scene.add(this.model);
//           this.isLoaded = true;
//           // console.log('Model loaded:', this.modelPath);
//         });
//     }

//     // wheel(){
//     //     myRange.addEventListener('wheel', function(event) {
//     //         event.preventDefault(); 

//     //         if (event.deltaY < 0) {
//     //             // Scrolling up: increment the range input value
//     //             myRange.valueAsNumber++; 
//     //         } else {
//     //             // Scrolling down: decrement the range input value
//     //             myRange.valueAsNumber--;
//     //         }
//     // }

//     wheelListener() {
//         window.addEventListener('wheel', (e) => {
//             // this.scrollPos.x += e.deltaX,
//             // this.scrollPos.y += e.deltaY;

//             // To control objectCoefs accroding to unique position of each class object. 
//             // Central ones don't change
//             // Other ones change based on how far they are from the center
//             this.objectCoefX += this.position.x*e.deltaX / 1000;
//             this.objectCoefY += this.position.y*e.deltaY / 1000;
//         })
//     }

//     update(){
//         if(this.isLoaded && this.model){
//             this.centroidX = mapFunc(sharedState.facePosition.x, 0, 640, 0, 1920);
//             this.centroidY = mapFunc(sharedState.facePosition.y, 0, 480, 0, 1080);
//             // this.centroidX = sharedState.facePosition.x;
//             // this.centroidY = sharedState.facePosition.y;
//             this.centroidZ = mapFunc(sharedState.facePosition.z, -150, 0, 0, 1);
//             // These are coefs normalized by positions
//             // console.log(`X: ${this.objectCoefX/this.position.x}`);
//             // console.log(`Y: ${this.objectCoefY/this.position.y}`);
        

//             // this.mousePosition.x = (this.centroidX/1920) * 2 -1;
//             // this.mousePosition.y = -(this.centroidY/1080) * 2 + 1;

//             this.mousePosition.x = THREE.MathUtils.mapLinear(((this.centroidX/1920) * 2 -1), -1, 1, -1*this.cameraCoefZ*this.centroidZ + this.objectCoefX, 1*this.cameraCoefZ*this.centroidZ + this.objectCoefX);
//             this.mousePosition.y =  THREE.MathUtils.mapLinear((-(this.centroidY/1080) * 2 + 1), -1, 1, -1*this.cameraCoefZ*this.centroidZ + this.cameraCoefY + this.objectCoefY, 1*this.cameraCoefZ*this.centroidZ + this.cameraCoefY + this.objectCoefY);

//             // this.mousePosition.x = THREE.MathUtils.mapLinear(((this.centroidX/1920) * 2 -1), -1, 1, -1 + this.centroidZ * this.coef, 1 - this.centroidZ * this.coef);
//             // this.mousePosition.y =  THREE.MathUtils.mapLinear((-(this.centroidY/1080) * 2 + 1), -1, 1, -1 + this.centroidZ * this.coef, 1 - this.centroidZ * this.coef)
            
            
//             // this.centroidX = THREE.MathUtils.mapLinear(sharedState.centroidPosition.x, 0, 640, 0, this.scrollPos);
//             // this.centroidY = THREE.MathUtils.mapLinear(sharedState.centroidPosition.Y, 0, 480, 0, 1080);

//             // EYE TRACK DEBUG
//             // console.log(`'scrollPos.x:'${this.scrollPos.x}`);
//             // console.log(`'scrollPos.y:'${this.scrollPos.y}`);
//             // console.log(`'mousePosition.x:'${this.mousePosition.x}`);
//             // console.log(`'mousePosition.y:'${this.mousePosition.y}`);

//             // console.log(`facePos.X: ${sharedState.facePosition.x}`);
//             // console.log(`facePosY: ${sharedState.facePosition.y}`);

//             this.planeNormal.copy(this.camera.position).normalize();
//             this.plane.setFromNormalAndCoplanarPoint(this.planeNormal, this.scene.position);
//             this.raycaster.setFromCamera(this.mousePosition, this.camera);
//             this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);
                
//             if (this.model) this.model.lookAt(this.intersectionPoint.x, this.intersectionPoint.y, 2);
//         }
//     }
//     dispose(){
//         if (this.model) {
//             this.scene.remove(this.model);
//         }
//     }
// }

// export default eyeModel;