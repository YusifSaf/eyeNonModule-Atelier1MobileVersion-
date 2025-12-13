//FFT Variables
let mic, fft;
// To control what frequency range FFT analyzes
let energyRange = "mid";

//ML5 Variables
let neelum;
let SHOW_VIDEO = true;
let SHOW_ALL_KEYPOINTS = true;
let TRACKED_KEYPOINT_INDEX = 1;  // 1 = nose tip
let CURSOR_SIZE = 30;
let CURSOR_COLOR = [255, 50, 50];
let KEYPOINT_SIZE = 3;

let cam;
let facemesh;
let faces = [];
let cursor;
let cameraReady = false;


function setup() {
    //ML5 Setup
    createCanvas(640, 480);

    showDebug();

    mic = new p5.AudioIn(); // initialize mic
    enableMicTap("Press to Enable Mic");
    initializeCamera();

    // // Camera constraints
    // let constraints = {
    //     video: {
    //     facingMode: 'user'
    //     },
    //     audio: false
    // };

    // cam = createCapture(constraints);
    // cam.size(640, 480);
    // cam.hide();

    
    // FFT Setup
    
    // mic.start();            // start capturing audio

    fft = new p5.FFT();     // initialize FFT
    fft.setInput(mic);      // connect mic to FFT
    
}

function initializeCamera() {
  lockGestures();  // Prevent phone gestures

  // Create phone camera
  cam = createPhoneCamera(this.cameraMode, this.mirror, this.displayMode);
  enableCameraTap();  // Enable tap to toggle video

  // Wait for camera to be ready before creating model
  cam.onReady(() => {
    videoReady();
  });
}

function videoReady() {
  let options = {
    maxFaces: 1,
    refineLandmarks: false,
    runtime: 'mediapipe',
    flipHorizontal: false
  };

  facemesh = ml5.faceMesh(options, () => {
    debug('FaceMesh model loaded!');
    facemesh.detectStart(cam.videoElement, (results) => {
      faces = results;
    });
    cameraReady = true;
  });
}

function draw() {
    //FFT Draw
    background(0);
    let spectrum = fft.analyze(); // get frequency spectrum
    sharedState.fftData.size = fft.getEnergy(energyRange);
    // // FFT Visualiser to debug
    //  fftVisualiserDebug();
    
    //ML5 Draw
    // clear(); // optional
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
    // debug(sharedState.fftData.size);
}

function fftVisualiserDebug(){
    noStroke();
    fill(0, 255, 0);
    for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = map(spectrum[i], 0, 255, 0, height);
    rect(x, height - h, width / spectrum.length, h);
    }
}

// ML5 Functions

// function modelReady() {
//   // console.log('FaceMesh model loaded!');
//   debug('FaceMesh model loaded!');
//   facemesh.detectStart(cam.videoElement, gotFaces);
// }

// function gotFaces(results) {
//   faces = results;
// }

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

// function mousePressed() {
//   SHOW_VIDEO = !SHOW_VIDEO;
//   return false;
// }

// function touchStarted() {
//   SHOW_VIDEO = !SHOW_VIDEO;
//   return false;
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }
