// Manage viewport camera transformations
export class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x              = 0;
        this.y              = 0;
        this.viewportWidth  = viewportWidth;
        this.viewportHeight = viewportHeight;
    }

    // Offset camera viewport center relative to target position
    update(targetX, targetY, targetWidth, targetHeight) {
        this.x = targetX - (this.viewportWidth - targetWidth) * 0.5;
        this.y = targetY - (this.viewportHeight - targetHeight) * 0.5;
    }
}
