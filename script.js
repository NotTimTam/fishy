"use strict";

let canTick = true;

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;

function tick() {
    if (canTick) {
        canTick = false;

        clearCanvas();
        displayFish();
        updateFish();

        canTick = true;
    } else { 
        return;
    }

    if (fish.length > maxFish) {
        fish.shift();
    } if (fish.length < maxFish) {
        createFish(Math.random() * canvas.clientWidth, Math.random() * canvas.clientHeight);
    }

    if (maxFish < 0) {
        maxFish = 0;
    } else if (maxFish > 300) {
        maxFish = 300;
    }
}
window.setInterval(tick, 5);

let mouse = {
    x: 0,
    y: 0
};
document.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function resizeCanvas() {
    canvas.setAttribute("width", canvas.clientWidth);
    canvas.setAttribute("height", canvas.clientHeight);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
function radianToDegree(radian) {
    return radian * (180 / Math.PI);
}
function degreeToRadian(degree) {
    return degree * (Math.PI / 180);
}
function vectorToPosition(angle, velocity) {
    return {
        x: velocity * Math.cos(degreeToRadian(angle)),
        y: velocity * Math.sin(degreeToRadian(angle))
    };
}
function positionToVector(x, y) {
    return {
        dirRadian: Math.atan2(y, x),
        dirDegree: radianToDegree(Math.atan2(y, x)),
        velocity: Math.sqrt(x ** 2 + y ** 2)
    };
}

let fish = [];
let maxFish = 25;

function createFish(x, y) {
    fish.push({
        x: x,
        y: y,
        angle: Math.random() * 360,
        scale: (Math.random() * (1 - 0.8 +1)) + 0.8,
        velocity: Math.random() * 1.5,
        talePos: 0,
        taleDir: -0.30,
        followNeighbors: false,
        color: `#131313`
    });
}

for (let i = 0; i < maxFish; i++) {
    createFish(Math.random() * canvas.clientWidth, Math.random() * canvas.clientHeight);
}

function displayFish() {
    for (let i = 0; i < fish.length; i++) {
        let curFish = fish[i];

        ctx.save(); 
        ctx.translate(curFish.x, curFish.y);
        ctx.rotate(degreeToRadian(curFish.angle));

        // center of object.
        let c = {
            x: 10,
            y: 5
        };

        // head
        ctx.beginPath();
        ctx.fillStyle = curFish.color;
        // head
        ctx.moveTo(c.x + (20 * curFish.scale), c.y);
        ctx.translate(0.5,0.5);
        ctx.lineTo(c.x + (18 * curFish.scale), c.y + (3 * curFish.scale));
        ctx.lineTo(c.x + (10 * curFish.scale), c.y + (5 * curFish.scale));
        ctx.lineTo(c.x + (10 * curFish.scale), c.y - (5 * curFish.scale));
        ctx.lineTo(c.x + (18 * curFish.scale), c.y - (3 * curFish.scale));
        ctx.fill();

        // body
        ctx.moveTo(c.x + (10 * curFish.scale), c.y + (5 * curFish.scale));
        ctx.translate(0.5,0.5);
        ctx.lineTo(c.x + (0 * curFish.scale), c.y + (5 * curFish.scale));
        ctx.lineTo(c.x - (10 * curFish.scale), c.y + (3 * curFish.scale));
        ctx.lineTo(c.x - (22 * curFish.scale), c.y + (curFish.talePos * curFish.scale));
        ctx.lineTo(c.x - (10 * curFish.scale), c.y - (3 * curFish.scale));
        ctx.lineTo(c.x + (0 * curFish.scale), c.y - (5 * curFish.scale));
        ctx.lineTo(c.x + (10 * curFish.scale), c.y - (5 * curFish.scale));
        ctx.fill();
        
        // fins
        ctx.moveTo(c.x, c.y);
        ctx.translate(0.5,0.5);
        ctx.lineTo(c.x - (3 * curFish.scale), c.y + (10 * curFish.scale));
        ctx.lineTo(c.x + (10 * curFish.scale), c.y);
        ctx.lineTo(c.x - (3 * curFish.scale), c.y - (10 * curFish.scale));
        ctx.lineTo(c.x, c.y);
        ctx.fill();
        ctx.closePath();
        
        ctx.restore(); 
    }
}

function angleDiff(angle1, angle2) {
    return Math.abs(angle1 - angle2);
}

function rotateFish(fish, angle, speed=3) {
    fish.angle %= 360;
    angle = (angle + 360) % 360;
    if(fish.angle != angle)
    {
        var netAngle = (fish.angle - angle + 360) % 360;
        var delta = Math.min(Math.abs(netAngle - 360), netAngle, speed);
        var sign  = (netAngle - 180) >= 0 ? 1 : -1;
        fish.angle += sign * delta + 360;
        fish.angle %= 360;
    }
}

function getClosestNeighbor(curFish) {
    let dist = Infinity;
    let activeNeighbor;
    for (let n = 0; n < fish.length; n++) {
        let neighbor = fish[n];
        let dt = distance(neighbor.x, neighbor.y, curFish.x, curFish.y);
        
        if (neighbor == curFish) {
            continue;
        } else {
            if (dt < dist) {
                dist = dt;
                activeNeighbor = neighbor;
            }
        }
    }

    return {
        dist: dist,
        activeNeighbor: activeNeighbor
    };
}

function updateFish() {
    for (let i = 0; i < fish.length; i++) {
        // Get the current fish.
        let curFish = fish[i];

        // Update its position based on its speed and direction.
        let newFishPos = vectorToPosition(curFish.angle, curFish.velocity);
        curFish.x += newFishPos.x;
        curFish.y += newFishPos.y;

        // Animate its tale.
        curFish.talePos += (curFish.taleDir * (curFish.velocity / 2));

        if (curFish.talePos >= 9) {
            curFish.talePos = 9;
            curFish.taleDir = -1;
        } else if (curFish.talePos <= -5) {
            curFish.talePos = -5;
            curFish.taleDir = 1;
        }

        // At random points in time the fish can change directions.
        let rand = Math.ceil(Math.random() * 1000);
        if (rand <= 2) {
            rotateFish(curFish, Math.random() * 360);
        }

        // Speed up and slow down the fish at random.
        // curFish.velocity += Math.floor(Math.random() * (0.1 - -0.1 +1)) + -0.1;

        // Check that it isn't going too fast or too slow.
        if (curFish.velocity > 1) {
            curFish.velocity = 1;
        } else if (curFish.velocity < 0.5) {
            curFish.velocity = 0.5;
        }

        // Get scared by the mouse.
        let neighbor = getClosestNeighbor(curFish);
        if (neighbor.dist > 25) {
            if (distance(curFish.x, curFish.y, mouse.x, mouse.y) <= 150 && distance(curFish.x, curFish.y, mouse.x, mouse.y) > 50) {
                rotateFish(curFish, Math.atan2(curFish.y - mouse.y, curFish.x - mouse.x) * 180 / Math.PI, 3);
                curFish.velocity = 1.1;
            } else {
                // Get the closest neighbor and interact with them.
                if (neighbor.activeNeighbor != undefined && neighbor.dist < 50) {
                    rand = Math.ceil(Math.random() * 1000);
                    if (rand <= 5) {
                        curFish.followNeighbors = !curFish.followNeighbors;
                    }
                    
                    if (curFish.followNeighbors) {
                        rotateFish(curFish, neighbor.activeNeighbor.angle, 1);
                    } else {
                        rotateFish(curFish, Math.atan2(curFish.y - neighbor.activeNeighbor.y, curFish.x - neighbor.activeNeighbor.x) * 180 / Math.PI, 0.5);
                    }
                }
            }
        } else {
            rotateFish(curFish, Math.atan2(curFish.y - neighbor.activeNeighbor.y, curFish.x - neighbor.activeNeighbor.x) * 180 / Math.PI, 0.5);
        }

        // Keep the fish in bounds.
        if (curFish.x <= -50) {
            curFish.x = canvas.clientWidth + 40;
        } else if (curFish.x >= canvas.clientWidth + 50) {
            curFish.x = -40;
        }
        if (curFish.y <= -50) {
            curFish.y = canvas.clientHeight + 40;
        } else if (curFish.y >= canvas.clientHeight + 50) {
            curFish.y = -40;
        }
    }
}