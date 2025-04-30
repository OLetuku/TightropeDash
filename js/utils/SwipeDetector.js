class SwipeDetector {
    constructor(scene) {
        this.scene = scene;
        
        // Swipe settings
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 500; // ms
        
        // Swipe tracking variables
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isSwiping = false;
        
        // Set up input events
        this.setupInputEvents();
    }
    
    setupInputEvents() {
        // Touch events
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
        this.scene.input.on('pointercancel', this.onPointerUp, this);
        this.scene.input.on('pointermove', this.onPointerMove, this);
    }
    
    onPointerDown(pointer) {
        this.startX = pointer.x;
        this.startY = pointer.y;
        this.startTime = Date.now();
        this.isSwiping = true;
    }
    
    onPointerUp(pointer) {
        if (!this.isSwiping) return;
        
        const endX = pointer.x;
        const endY = pointer.y;
        const endTime = Date.now();
        const swipeTime = endTime - this.startTime;
        
        // Check if it's a valid swipe (not a tap or too slow)
        if (swipeTime < this.maxSwipeTime) {
            const dx = endX - this.startX;
            const dy = endY - this.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance >= this.minSwipeDistance) {
                this.detectSwipeDirection(dx, dy);
            }
        }
        
        this.isSwiping = false;
    }
    
    onPointerMove(pointer) {
        // Optional: Can be used to show swipe feedback
    }
    
    detectSwipeDirection(dx, dy) {
        // Determine if horizontal or vertical swipe based on which has greater magnitude
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        } else {
            // Vertical swipe
            if (dy > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }
    
    onSwipeUp() {
        // Call the jump method in the game scene
        if (this.scene.jump) {
            this.scene.jump();
        }
    }
    
    onSwipeDown() {
        // Call the duck method in the game scene
        if (this.scene.duck) {
            this.scene.duck();
        }
    }
    
    onSwipeLeft() {
        // Call the leanLeft method in the game scene
        if (this.scene.leanLeft) {
            this.scene.leanLeft();
            
            // Auto-reset after a short delay
            this.scene.time.delayedCall(500, () => {
                if (this.scene.stopLeaning) {
                    this.scene.stopLeaning();
                }
            });
        }
    }
    
    onSwipeRight() {
        // Call the leanRight method in the game scene
        if (this.scene.leanRight) {
            this.scene.leanRight();
            
            // Auto-reset after a short delay
            this.scene.time.delayedCall(500, () => {
                if (this.scene.stopLeaning) {
                    this.scene.stopLeaning();
                }
            });
        }
    }
}
