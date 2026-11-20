// Manage viewport camera transformations with boundary clamping & centering
export class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x              = 0;
        this.y              = 0;
        this.viewportWidth  = viewportWidth;
        this.viewportHeight = viewportHeight;
    }

    // Update camera to center target while keeping integer pixel alignment (zero sprite blur)
    update(targetX, targetY, targetWidth = 36, targetHeight = 39, worldWidth = 1200, worldHeight = 800) {
        if (this.viewportWidth >= worldWidth) {
            this.x = Math.round((worldWidth - this.viewportWidth) * 0.5);
        } else {
            const desiredX = targetX - (this.viewportWidth - targetWidth) * 0.5;
            this.x = Math.round(Math.max(0, Math.min(worldWidth - this.viewportWidth, desiredX)));
        }

        if (this.viewportHeight >= worldHeight) {
            this.y = Math.round((worldHeight - this.viewportHeight) * 0.5);
        } else {
            const desiredY = targetY - (this.viewportHeight - targetHeight) * 0.5;
            this.y = Math.round(Math.max(0, Math.min(worldHeight - this.viewportHeight, desiredY)));
        }
    }
}

