// Manage viewport camera transformations with boundary clamping & centering
export class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x              = 0;
        this.y              = 0;
        this.viewportWidth  = viewportWidth;
        this.viewportHeight = viewportHeight;
    }

    // Update camera to center target while strictly preventing viewport scroll into void
    update(targetX, targetY, targetWidth = 32, targetHeight = 40, worldWidth = 1200, worldHeight = 800) {
        // Horizontal camera calculation
        if (this.viewportWidth >= worldWidth) {
            // Screen is wider than the room: center the room on screen
            this.x = (worldWidth - this.viewportWidth) * 0.5;
        } else {
            // Screen is narrower: center on target and clamp between 0 and (worldWidth - viewportWidth)
            const desiredX = targetX - (this.viewportWidth - targetWidth) * 0.5;
            this.x = Math.max(0, Math.min(worldWidth - this.viewportWidth, desiredX));
        }

        // Vertical camera calculation
        if (this.viewportHeight >= worldHeight) {
            // Screen is taller than the room: center the room vertically
            this.y = (worldHeight - this.viewportHeight) * 0.5;
        } else {
            // Screen is shorter: center on target and clamp between 0 and (worldHeight - viewportHeight)
            const desiredY = targetY - (this.viewportHeight - targetHeight) * 0.5;
            this.y = Math.max(0, Math.min(worldHeight - this.viewportHeight, desiredY));
        }
    }
}
