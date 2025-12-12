/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates drawing skeletons on poses for the MoveNet model.
 * Refactored for Vite.js using p5 instance mode.
 */

import { sharedState } from "./sharedState";

const bodyPoseSketch = (p) => {
  let video;
  let bodyPose;
  let poses = [];
  let connections;

  p.preload = () => {
    // Load the bodyPose model
    bodyPose = ml5.bodyPose();
  };

  p.setup = () => {
    p.createCanvas(640, 480);

    // Create the video and hide it
    video = p.createCapture(p.VIDEO);
    video.size(640, 480);
    video.hide();

    // Start detecting poses in the webcam video
    bodyPose.detectStart(video.elt, gotPoses);
    // Get the skeleton connection information
    connections = bodyPose.getSkeleton();
  };

  p.draw = () => {
    // Draw the webcam video
    p.image(video, 0, 0, p.width, p.height);

    // Draw the skeleton connections
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];
      for (let j = 0; j < connections.length; j++) {
        let pointAIndex = connections[j][0];
        let pointBIndex = connections[j][1];
        let pointA = pose.keypoints[pointAIndex];
        let pointB = pose.keypoints[pointBIndex];
        // Only draw a line if both points are confident enough
        if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
          p.stroke(255, 0, 0);
          p.strokeWeight(2);
          p.line(pointA.x, pointA.y, pointB.x, pointB.y);
        }
      }
    }

    // Draw all the tracked landmark points
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];
      for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        // Only draw a circle if the keypoint's confidence is bigger than 0.1
        if (keypoint.confidence > 0.1) {
          p.fill(0, 255, 0);
          p.noStroke();
          p.circle(keypoint.x, keypoint.y, 10);
        }
      }
    }

    // if(poses.length > 0) {
    //   sharedState.facePosition = {
    //         x: poses[0].keypoints3D[0].x,
    //         y: poses[0].keypoints3D[0].y,
    //         z: poses[0].keypoints3D[0].z
    //     };     
    // };     
  };

  // Callback function for when bodyPose outputs data
  function gotPoses(results) {
    // Save the output to the poses variable
    poses = results;
  }

  p.mousePressed = () => {
    //access poses[first person in the frame.keypoints3D[index of the "nose"].z]
    // console.log(poses[0].keypoints[0].x);
    // sharedState.facePosition.z = poses[0].keypoints3D[0].z
    // console.log(poses[0].keypoints3D[0].x);
    // console.log(poses[0].keypoints3D[0].y);
    // console.log(poses[0].keypoints3D[0].z);
  };
};

// Create p5 instance
new p5(bodyPoseSketch);