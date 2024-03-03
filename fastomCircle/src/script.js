const percentageContainer = document.getElementById('percentageContainer');
let idealRadius = 0;

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let drawingCoordinates = [];
let previousVector = null;



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function paintCentralPoint() {
    ctx.fillStyle = "#ff1111";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, 2 * Math.PI);
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

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing);

const lineWidth = 5;
const lineColor = "#0000ff";
const directionChangeThreshold = 45;

function startDrawing(e) {
    isDrawing = true;
    drawingCoordinates = [];

    previousVector = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    paintCentralPoint()
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
}

function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    drawingCoordinates.push({ x, y });
    ctx.lineTo(x, y);
    checkDirectionChange();

    updatePercentage()
    ctx.stroke();
}

function endDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        updatePercentage()


        calculateDeviationPercentage()
        console.log(drawingCoordinates);

        drawIdealCircle()
    }
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
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    if (Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI) > 40) {
        console.log(vector1, vector2, Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI))
    }
    return Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI);
}

function checkDirectionChange() {
    const numPoints = drawingCoordinates.length;

    const vectorLength = 5
    const angleThreshold = 45
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

        if (angleChange > angleThreshold) {
            drawRedCircle(drawingCoordinates[numPoints - vectorLength * 2].x, drawingCoordinates[numPoints - vectorLength * 2].y);
            drawRedCircle(drawingCoordinates[numPoints - vectorLength].x, drawingCoordinates[numPoints - vectorLength].y);
            drawRedCircle(drawingCoordinates[numPoints - 1].x, drawingCoordinates[numPoints - 1].y);

            endDrawing();
            percentageContainer.textContent = "Ты изменил направление!";
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
    ctx.fillStyle = "#ffAA80";
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

    let totalPercentage = 0;

    for (let i = 0; i < numPoints; i++) {
        const userRadius = calculateDistanceToCenter(drawingCoordinates[i].x, drawingCoordinates[i].y);
        const deviation = Math.abs(userRadius - idealRadius);
        const percentage = Math.max(0, Math.min(100, (1 - deviation / idealRadius) * 100));
        totalPercentage += percentage;
    }

    const averagePercentage = totalPercentage / numPoints;
    percentageContainer.textContent = `Совпадение: ${averagePercentage}%`;

    return averagePercentage;
}