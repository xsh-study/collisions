export default class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = { x: 0, y: 0 };
        this.collisionCount = 0;
        this.color = "#0000FF"; // Default color
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }
}