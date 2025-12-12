window.sharedState = {
    // For facialTracking
    facePosition: { x:0, y:0, z:0 },
    
    // For fft analyzing
    fftData: {size: 1, fftRangeMin: Infinity, fftRangeMax: -Infinity,}
};

// console.log(sharedState.fftData.x);
// export const sharedState = {
//     // centroidPosition: { x:0, y:0 }

//     // For facialTracking
//     facePosition: { x:0, y:0, z:0 }

//     // For bodyTracking,just didn't change the name
//     // facePosition: { x:0, y:0, z:0 }
// };

// export function mapFunc(value, start1, end1, start2, end2) {
//     let proportion = (value - start1) / (end1 - start1);

//     let mappedValue = start2 + (end2 - start2) * proportion;

//     return mappedValue
// }