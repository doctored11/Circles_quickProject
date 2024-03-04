const percentageContainer = document.getElementById('percentageContainer');
const percentageContainer2 = document.getElementById('percentageAbsoluteContainer');
let idealRadius = 0;
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let drawingCoordinates = [];
let previousVector = null;





canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function paintCentralPoint() {
    ctx.fillStyle = "#a8b2b3f5";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 15, 0, 2 * Math.PI);
    ctx.fill();
}
paintCentralPoint()


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff1111";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, 2 * Math.PI);
    ctx.fill();
});




canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseout', handleEnd);
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);
canvas.addEventListener('touchcancel', handleEnd);

function handleStart(e) {
    e.preventDefault();
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    startDrawing(touch);
}

function handleMove(e) {
    e.preventDefault();
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    draw(touch);
}

function handleEnd(e) {
    e.preventDefault();
    endDrawing();
}

const lineWidth = 15;
const lineColor = "#0000ff";
const directionChangeThreshold = 45;

function startDrawing(e) {
    isDrawing = true;
    isClosed = false
    is360R = false
    is360L = false;
    currentRadius = 1.1 * lineWidth
    drawingCoordinates = [];
    
    percentageContainer2.textContent = ``
    previousVector = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    greed();


    paintCentralPoint()
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
}

let hasCrossedTrigger = false;
let currentRadius = 1.1 * lineWidth

function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    if (checkIfCircleFinished()) {
        isDrawing = false;
        endDrawing();
        return;
    }

    const userRadius = calculateDistanceToCenter(x, y);
    const deviation = Math.abs(userRadius - idealRadius);
    const percentage = Math.max(0, Math.min(100, (1 - deviation / idealRadius) * 100)) || 100;

    const gradient = getColorGradient(percentage);

    drawingCoordinates.push({ x, y, gradient });

    if (drawingCoordinates.length > 1) {
        const prevPoint = drawingCoordinates[drawingCoordinates.length - 2];
        ctx.strokeStyle = prevPoint.gradient;
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }


    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, currentRadius / 2, 0, 2 * Math.PI);
    ctx.fill();


    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y);
    checkDirectionChange();
    updatePercentage();
    ctx.stroke();

    if (currentRadius > lineWidth) {
        currentRadius -= 0.01;
    }
}
function getColorGradient(percentage) {
    // Определите границы цветового спектра от голубого до красного
    const blueColor = [13, 255, 255];
    const redColor = [242, 2, 162];

    const t = Math.max(0, (percentage - 40) / 60);
    // Вычислите промежуточный цвет в градиенте от красного до голубого
    const intermediateColor = [
        Math.round(redColor[0] + t * (blueColor[0] - redColor[0])),
        Math.round(redColor[1] + t * (blueColor[1] - redColor[1])),
        Math.round(redColor[2] + t * (blueColor[2] - redColor[2]))
    ];

    // Верните цвет в формате RGB
    return `rgb(${intermediateColor[0]}, ${intermediateColor[1]}, ${intermediateColor[2]})`;
}



function endDrawing() {

    isDrawing = false;
    ctx.closePath();

    console.log(drawingCoordinates);
    calculateDeviationPercentage()
    drawIdealCircle()

}
// 

function updatePercentage() {
    const maxIdealPoints = 50;

    if (drawingCoordinates.length <= maxIdealPoints) {
        idealRadius = calculateDistanceToCenter(
            drawingCoordinates[0].x,
            drawingCoordinates[0].y
        );
    } else {
        let totalRadius = 0;
        // оптимизировать потом - добавляя последнюю точку к старому значению радиус +/2
        for (let i = 0; i < drawingCoordinates.length; i++) {
            totalRadius += calculateDistanceToCenter(
                drawingCoordinates[i].x,
                drawingCoordinates[i].y
            );
        }
        idealRadius = totalRadius / drawingCoordinates.length;
    }
    console.log("идеал рад ", idealRadius)

    const userRadius = Math.sqrt(
        (drawingCoordinates[drawingCoordinates.length - 1].x - canvas.width / 2) ** 2 +
        (drawingCoordinates[drawingCoordinates.length - 1].y - canvas.height / 2) ** 2
    );

    const matchPercentage = Math.floor((1 - Math.abs(idealRadius - userRadius) / idealRadius) * 100);
    // console.log('радиус: ' + (idealRadius))
    percentageContainer.textContent = `${matchPercentage}%`;
}

function calculateDistanceToCenter(x, y) {
    return Math.sqrt((x - canvas.width / 2) ** 2 + (y - canvas.height / 2) ** 2);
}

function calculateDistanceBetweenPoints(point1, point2) {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}


function calculateVector(point1, point2) {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y
    };
}

function calculateAngle(vector1, vector2) {
    const angle = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);
    return angle >= 0 ? angle * (180 / Math.PI) : (2 * Math.PI + angle) * (180 / Math.PI);
}


function checkDirectionChange() {
    const numPoints = drawingCoordinates.length;

    const vectorLength = 5
    const angleThreshold = 90
    const minPoints = 3 * vectorLength

    if (numPoints >= minPoints) {
        const startVector = calculateVector(
            drawingCoordinates[numPoints - vectorLength * 2],
            drawingCoordinates[numPoints - vectorLength]
        );
        const endVector = calculateVector(
            drawingCoordinates[numPoints - vectorLength],
            drawingCoordinates[numPoints - 1]
        );

        const angleChange = calculateAngle(startVector, endVector);

        console.log(angleChange);

        if (angleChange < 360 - angleThreshold && angleChange > angleThreshold) {
            drawRedCircle(drawingCoordinates[numPoints - vectorLength * 2].x, drawingCoordinates[numPoints - vectorLength * 2].y);
            drawRedCircle(drawingCoordinates[numPoints - vectorLength].x, drawingCoordinates[numPoints - vectorLength].y);
            drawRedCircle(drawingCoordinates[numPoints - 1].x, drawingCoordinates[numPoints - 1].y);

            isDrawing = false
            endDrawing();
            // percentageContainer.textContent = "Ты изменил направление!";
            console.log("Ты изменил направление!", angleChange);
            return;
        }
    }
}

function drawRedCircle(x, y) {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}
function drawIdealCircle() {
    ctx.strokeStyle = "#a8b2b384";
    ctx.lineWidth = 35;
    console.log("ideal rad", idealRadius)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, idealRadius, 0, 2 * Math.PI);
    ctx.stroke();
}

function calculateDeviationPercentage() {
    const numPoints = drawingCoordinates.length;

    if (numPoints === 0) {
        return 0;
    }
    if (!isClosed) {
        percentageContainer.textContent = `XX`;
        return

    }

    let totalPercentage = 0;
    let radialMatchCount = 0;

    for (let i = 0; i < numPoints; i++) {
        const userRadius = calculateDistanceToCenter(drawingCoordinates[i].x, drawingCoordinates[i].y);
        const deviation = Math.abs(userRadius - idealRadius);
        const percentage = Math.max(0, Math.min(100, (1 - deviation / idealRadius) * 100)) || 100;
        // console.log(percentage, userRadius, idealRadius)
        totalPercentage += percentage;

        if (userRadius >= 0.9 * idealRadius && userRadius <= 1.1 * idealRadius) {
            radialMatchCount++;
        }
    }

    const averagePercentage = totalPercentage / numPoints;
    const radialPercentage = (radialMatchCount / numPoints) * 100;
    percentageContainer.textContent = `Радиальное совпадение: ${averagePercentage.toFixed(2)}%`;
    percentageContainer2.textContent = `Реальное совпадение: ${radialPercentage.toFixed(2)}%`

    return averagePercentage;
}

let is360R, is360L = false
function checkIfCircleFinished() {
    const numPoints = drawingCoordinates.length;

    if (numPoints < 20) {
        return false;
    }


    const startVector = calculateVector(
        { x: canvas.width / 2, y: canvas.height / 2 },
        drawingCoordinates[0]
    );

    const endVector = calculateVector(
        { x: canvas.width / 2, y: canvas.height / 2 },
        drawingCoordinates[numPoints - 1]
    );

    const angleChange = calculateAngle(startVector, endVector);
    if (angleChange > 140 && angleChange < 180 && !is360L) is360R = true
    if (angleChange < 210 && angleChange > 180 && !is360R) is360L = true

    console.log("угол круга  = ", angleChange, is360L, is360R);
    result = (((is360R && angleChange < 50) || (is360L && angleChange > 290)))
    isClosed = result

    return result;
}
greed();
function greed() {
    // ctx.fillStyle = 'ffb7ff';

    // ctx.fillRect(0, 0, canvas.width, canvas.height);



    let w = canvas.clientWidth * 0.95;
    let h = canvas.clientHeight;
    let x = 20;
    let y = 20;
    ctx.beginPath();
    ctx.strokeStyle = '#3873fd56';
    for (let i = 0; i <= w; i += x) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);

    }
    for (let i = 0; i <= h; i += y) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.clientWidth, i);

    }
    ctx.lineWidth = 2;
    ctx.stroke();
}

