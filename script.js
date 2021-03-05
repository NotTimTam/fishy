let canTick = true;

const ctx = canvas.getContext('2d');

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
        velocity: Math.random() * 1.5,
        talePos: 0,
        taleDir: -0.30
    });
}

for (let i = 0; i < maxFish; i++) {
    createFish(Math.random() * canvas.clientWidth, Math.random() * canvas.clientHeight);
}

// document.addEventListener("click", function (e) {
//     createFish(mouse.x, mouse.y);
// })

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
        // ctx.moveTo(c.x, c.y - 10);
        // ctx.lineTo(c.x + 20, c.y);
        // ctx.lineTo(c.x, c.y + 10);
        // ctx.lineTo(c.x + 20, c.y);
        // ctx.lineTo(c.x, c.y + 10);
        // ctx.lineTo(c.x - 40, c.y);
        // ctx.lineTo(c.x, c.y - 10);
        // ctx.lineTo(c.x - 40, c.y);

        // head
        ctx.beginPath();
        ctx.fillStyle = "#d4d4d4";
        // head
        ctx.moveTo(c.x + 20, c.y);
        ctx.lineTo(c.x + 18, c.y + 3);
        ctx.lineTo(c.x + 10, c.y + 5);
        ctx.lineTo(c.x + 10, c.y - 5);
        ctx.lineTo(c.x + 18, c.y - 3);
        // body
        ctx.moveTo(c.x + 10, c.y + 5);
        ctx.lineTo(c.x + 0, c.y + 5);
        ctx.lineTo(c.x - 10, c.y + 3);
        ctx.lineTo(c.x - 30, curFish.talePos);
        ctx.lineTo(c.x - 10, c.y - 3);
        ctx.lineTo(c.x + 0, c.y - 5);
        ctx.lineTo(c.x + 10, c.y - 5);
        ctx.fill();
        ctx.closePath();
        // fins
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - 3, c.y + 10);
        ctx.lineTo(c.x + 10, c.y);
        ctx.lineTo(c.x - 3, c.y - 10);
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
        curFish.talePos += (curFish.taleDir * curFish.velocity);

        if (curFish.talePos >= 10) {
            curFish.talePos = 10;
            curFish.taleDir *= -1;
        } else if (curFish.talePos <= -5) {
            curFish.talePos = -5;
            curFish.taleDir *= -1;
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
        if (distance(curFish.x, curFish.y, mouse.x, mouse.y) <= 150 && distance(curFish.x, curFish.y, mouse.x, mouse.y) > 50) {
            rotateFish(curFish, Math.atan2(curFish.y - mouse.y, curFish.x - mouse.x) * 180 / Math.PI, 1);
            curFish.velocity = 2;
        }

        // Get the closest neighbor and interact with them.
        let neighbor = getClosestNeighbor(curFish);
        if (neighbor.activeNeighbor != undefined && neighbor.dist < 50) {
            rand = Math.random() * 1000;
            if (rand <= 2) {
                rotateFish(curFish, neighbor.activeNeighbor.angle, 1);
                curFish.velocity = neighbor.activeNeighbor.velocity;
            } else {
                rotateFish(curFish, Math.atan2(curFish.y - neighbor.activeNeighbor.y, curFish.x - neighbor.activeNeighbor.x) * 180 / Math.PI, 0.5);
            }
        }

        // if (curFish.x < 0) {
        //     curFish.x = 0;
        //     rotateFish(curFish, Math.floor(Math.random() * (-90 - 90 +1)) + 90);
        // } else if (curFish.x > canvas.clientWidth) {
        //     curFish.x = canvas.clientWidth;
        //     rotateFish(curFish, Math.floor(Math.random() * (90 - 180 +1)) + 180);
        // }

        // if (curFish.y < 0) {
        //     curFish.y = 0;
        //     rotateFish(curFish, Math.floor(Math.random() * (0 - 180 +1)) + 180);
        // } else if (curFish.y > canvas.clientHeight) {
        //     curFish.y = canvas.clientHeight;
        //     rotateFish(curFish, Math.floor(Math.random() * (180 - 360 +1)) + 360);
        // }

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