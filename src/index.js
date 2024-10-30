import Rectangle from "./rectangle";
import Circle from "./circle";

const canvas = document.getElementById("cnvs");

const gameState = {};

// Create div elements to display FPS and figure count
let fpsDisplay = document.createElement("div");
let figuresDisplay = document.createElement("div");

// Add basic styling to make the displays visible on the screen
fpsDisplay.style.position = 'fixed';
fpsDisplay.style.top = '10px';
fpsDisplay.style.left = '10px';
fpsDisplay.style.color = 'black';
fpsDisplay.style.backgroundColor = 'white';
fpsDisplay.style.padding = '5px';

figuresDisplay.style.position = 'fixed';
figuresDisplay.style.top = '40px';
figuresDisplay.style.left = '10px';
figuresDisplay.style.color = 'black';
figuresDisplay.style.backgroundColor = 'white';
figuresDisplay.style.padding = '5px';

// Append the div elements to the document body
document.body.appendChild(fpsDisplay);
document.body.appendChild(figuresDisplay);

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS(tFrame) {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    // Calculate FPS based on the deltaTime
    fps = Math.round(1000 / deltaTime);

    // Reset lastFrameTime for the next frame
    lastFrameTime = currentTime;

    // Display FPS and number of figures in real-time
    fpsDisplay.innerHTML = `FPS: ${fps}`;
    figuresDisplay.innerHTML = `Figures: ${gameState.figures.length}`;
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw figures
    gameState.figures.forEach((figure) => {
        context.fillStyle = figure.color;
        if (figure instanceof Rectangle) {
            context.fillRect(figure.x, figure.y, figure.w, figure.h);
        } else if (figure instanceof Circle) {
            context.beginPath();
            context.arc(figure.x, figure.y, figure.radius, 0, Math.PI * 2);
            context.fill();
        }
    });

    // Update FPS and figure count display
    updateFPS(tFrame);
}

function update(tick) {
    gameState.figures.forEach((figure) => {
        // Update position
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        // Collision with canvas borders
        if (figure.x <= 0 || figure.x + (figure.w || figure.radius * 2) >= canvas.width) {
            figure.speed.x *= -1;
            handleCollision(figure);
        }
        if (figure.y <= 0 || figure.y + (figure.h || figure.radius * 2) >= canvas.height) {
            figure.speed.y *= -1;
            handleCollision(figure);
        }
    });

    // Collision detection between figures
    for (let i = 0; i < gameState.figures.length; i++) {
        for (let j = i + 1; j < gameState.figures.length; j++) {
            if (checkCollision(gameState.figures[i], gameState.figures[j])) {
                // Reverse direction on collision
                gameState.figures[i].speed.x *= -1;
                gameState.figures[i].speed.y *= -1;
                gameState.figures[j].speed.x *= -1;
                gameState.figures[j].speed.y *= -1;
                handleCollision(gameState.figures[i]);
                handleCollision(gameState.figures[j]);
            }
        }
    }

    // Remove figures that have collided 3 times
    gameState.figures = gameState.figures.filter((figure) => figure.collisionCount < 3);
}

function checkCollision(figureA, figureB) {
    if (figureA instanceof Rectangle && figureB instanceof Rectangle) {
        return figureA.intersects(figureB);
    } else if (figureA instanceof Circle && figureB instanceof Circle) {
        const dx = figureA.x - figureB.x;
        const dy = figureA.y - figureB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < figureA.radius + figureB.radius;
    } else {
        // Rectangle-circle collision
        const rect = figureA instanceof Rectangle ? figureA : figureB;
        const circle = figureA instanceof Circle ? figureA : figureB;
        const distX = Math.abs(circle.x - rect.x - rect.w / 2);
        const distY = Math.abs(circle.y - rect.y - rect.h / 2);

        if (distX > (rect.w / 2 + circle.radius) || distY > (rect.h / 2 + circle.radius)) {
            return false;
        }
        if (distX <= (rect.w / 2) || distY <= (rect.h / 2)) {
            return true;
        }

        const dx = distX - rect.w / 2;
        const dy = distY - rect.h / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }
}

function handleCollision(figure) {
    figure.collisionCount++;
    figure.color = getRandomColor();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms

    gameState.figures = [];

    // Add 100 circles with fixed radius of 20
    for (let i = 0; i < 100; i++) {
        const radius = 20;  // Fixed radius
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const circle = new Circle(x, y, radius);
        circle.setSpeed(Math.random() * 6 - 3, Math.random() * 6 - 3);
        gameState.figures.push(circle);
    }

    // Add 100 rectangles with fixed size of 30x30
    for (let i = 0; i < 100; i++) {
        const w = 30;  // Fixed width
        const h = 30;  // Fixed height
        const x = Math.random() * (canvas.width - w);
        const y = Math.random() * (canvas.height - h);
        const rectangle = new Rectangle(x, y, w, h);
        rectangle.setSpeed(Math.random() * 6 - 3, Math.random() * 6 - 3);
        gameState.figures.push(rectangle);
    }
}

setup();
run();
