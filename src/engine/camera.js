export class Camera { // Definition of 2D orthographic camera class managing screen viewport translation
    constructor(viewportWidth, viewportHeight) { // Constructor initializing viewport limits and position coords
        this.x              = 0;                     // Initial horizontal offset coordinate in 2D space
        this.y              = 0;                     // Initial vertical offset coordinate in 2D space
        this.viewportWidth  = viewportWidth;         // Assign the rendering surface width bounds parameter
        this.viewportHeight = viewportHeight;        // Assign the rendering surface height bounds parameter
    }                                                // End of constructor execution block
//                                                   // Space separator to organize class members
    update(targetX, targetY, targetWidth, targetHeight) { // Translate camera focus position to align with centered target coordinates
        this.x = targetX - (this.viewportWidth - targetWidth) * 0.5;   // Calculate x-axis camera offset to center target horizontally
        this.y = targetY - (this.viewportHeight - targetHeight) * 0.5; // Calculate y-axis camera offset to center target vertically
    }                                                // End of update method execution block
}                                                    // End of Camera class definition
