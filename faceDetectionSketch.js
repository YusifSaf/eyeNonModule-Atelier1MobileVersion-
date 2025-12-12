const faceDetectionSketch = (p) => {
            let video;
            let facemesh;
            let faces = [];
            let cameraReady = false;
            let modelReady = false;

            p.preload = () => {
                facemesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false }, () => {
                    modelReady = true;
                    console.log('FaceMesh model loaded!');
                });
            };

            p.setup = () => {
                let canvas = p.createCanvas(640, 480);
                canvas.id('p5Canvas');

                video = p.createCapture(p.VIDEO, () => {
                    cameraReady = true;
                    if (modelReady) {
                        facemesh.detectStart(video.elt, gotFaces);
                    }
                });
                video.size(640, 480);
                video.hide();
            };

            p.draw = () => {
                // p.clear();

                if (faces.length > 0 && faces[0].keypoints && faces[0].keypoints[0]) {
                    let nose = faces[0].keypoints[0];
                    let noseZ = faces[0].keypoints3D ? faces[0].keypoints3D[0].z : 0;

                    sharedState.facePosition = {
                        x: p.width - nose.x,
                        y: nose.y,
                        z: noseZ
                    };
                }
            };

            function gotFaces(results) {
                faces = results;
            }
        };


        // ==============================================
// ADJUSTABLE PARAMETERS
// ==============================================
let neelum;
let SHOW_VIDEO = true;
let SHOW_ALL_KEYPOINTS = true;
let TRACKED_KEYPOINT_INDEX = 1;  // 1 = nose tip
let CURSOR_SIZE = 30;
let CURSOR_COLOR = [255, 50, 50];
let KEYPOINT_SIZE = 3;

// ==============================================
// GLOBAL VARIABLES
// ==============================================
let cam;
let facemesh;
let faces = [];
let cursor;
let cameraReady = false;

// ==============================================
// PRELOAD (model loaded in setup instead)
// ==============================================
function preload() {}

// ==============================================
// SETUP
// ==============================================
function setup() {
  createCanvas(640, 480);

  // Camera constraints
  let constraints = {
    video: {
      facingMode: 'user'
    },
    audio: false
  };

  cam = createCapture(constraints, videoReady);
  cam.size(640, 480);
  cam.hide();
}

// ==============================================
// VIDEO READY
// ==============================================
function videoReady() {
  cameraReady = true;

  let options = {
    maxFaces: 1,
    refineLandmarks: false,
    runtime: 'mediapipe',
    flipHorizontal: false
  };

  facemesh = ml5.faceMesh(options, modelReady);
}

// ==============================================
// MODEL READY
// ==============================================
function modelReady() {
  console.log('FaceMesh model loaded!');
  facemesh.detectStart(cam.elt, gotFaces);
}

// ==============================================
// GOT FACES
// ==============================================
function gotFaces(results) {
  faces = results;
}

// ==============================================
// DRAW LOOP
// ==============================================
function draw() {
  background(40);

  // Draw video feed
  if (SHOW_VIDEO && cameraReady) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(cam, 0, 0, width, height);
    pop();
  }

  if (faces.length > 0) {
    drawFaceTracking();
  }

  drawUI();
}

// ==============================================
// DRAW FACE TRACKING
// ==============================================
function drawFaceTracking() {
  let face = faces[0];
  if (!face.keypoints || face.keypoints.length === 0) return;

  let trackedKeypoint = face.keypoints[TRACKED_KEYPOINT_INDEX];
  if (!trackedKeypoint) return;

  cursor = mapKeypointToCanvas(trackedKeypoint);

  sharedState.facePosition = {
    x: cursor.x,
    y: cursor.y,
    z: cursor.z
  };

  // Draw cursor + crosshair
  push();
  fill(...CURSOR_COLOR);
  noStroke();
  ellipse(cursor.x, cursor.y, CURSOR_SIZE, CURSOR_SIZE);

  stroke(CURSOR_COLOR[0], CURSOR_COLOR[1], CURSOR_COLOR[2], 150);
  strokeWeight(2);
  line(cursor.x - 15, cursor.y, cursor.x + 15, cursor.y);
  line(cursor.x, cursor.y - 15, cursor.x, cursor.y + 15);
  pop();

  // Coordinates text
  push();
  fill(255);
  stroke(0);
  strokeWeight(3);
  textAlign(CENTER, TOP);
  textSize(14);
  text(
    `x: ${cursor.x.toFixed(0)}, y: ${cursor.y.toFixed(0)}, z: ${(cursor.z || 0).toFixed(0)}`,
    cursor.x,
    cursor.y + CURSOR_SIZE/2 + 10
  );
  pop();

  // Draw all keypoints
  if (SHOW_ALL_KEYPOINTS) {
    push();
    fill(0, 255, 0, 100);
    noStroke();
    for (let kp of face.keypoints) {
      let mapped = mapKeypointToCanvas(kp);
      ellipse(mapped.x, mapped.y, KEYPOINT_SIZE, KEYPOINT_SIZE);
    }
    pop();
  }
}

// ==============================================
// MAP KEYPOINT TO CANVAS
// ==============================================
function mapKeypointToCanvas(keypoint) {
  let x, y, z;

  if (keypoint.x <= 1 && keypoint.y <= 1) {
    x = keypoint.x * width;
    y = keypoint.y * height;
  } else {
    x = map(keypoint.x, 0, cam.width, 0, width);
    y = map(keypoint.y, 0, cam.height, 0, height);
  }

  x = width - x;
  z = keypoint.z || 0;

  return { x, y, z };
}

// ==============================================
// DRAW UI
// ==============================================
function drawUI() {
  push();
  fill(255);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(18);

  if (!cameraReady) {
    text('Starting camera...', width/2, 20);
  } else if (!facemesh) {
    text('Loading FaceMesh model...', width/2, 20);
  } else if (faces.length === 0) {
    text('Show your face to start tracking', width/2, 20);
  } else {
    let keypointNames = {
      1: 'Nose Tip',
      10: 'Top of Face',
      152: 'Chin',
      234: 'Left Eye',
      454: 'Right Eye',
      13: 'Lips'
    };
    let name = keypointNames[TRACKED_KEYPOINT_INDEX] || 'Keypoint ' + TRACKED_KEYPOINT_INDEX;
    text('Tracking: ' + name, width/2, 20);
  }

  // Bottom indicators
  textSize(14);
  fill(200);
  textAlign(CENTER, BOTTOM);
  text('Click to toggle video', width/2, height - 20);

  textSize(12);
  fill(SHOW_VIDEO ? color(0,255,0) : color(150));
  text('Video: ' + (SHOW_VIDEO ? 'ON' : 'OFF'), width/2, height - 40);

  fill(SHOW_ALL_KEYPOINTS ? color(0,255,0) : color(150));
  text('All Keypoints: ' + (SHOW_ALL_KEYPOINTS ? 'ON' : 'OFF'), width/2, height - 55);

  pop();
}

// ==============================================
// INPUT EVENTS
// ==============================================
function mousePressed() {
  SHOW_VIDEO = !SHOW_VIDEO;
  return false;
}

function touchStarted() {
  SHOW_VIDEO = !SHOW_VIDEO;
  return false;
}

// ==============================================
// WINDOW RESIZE
// ==============================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



