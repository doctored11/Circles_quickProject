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
    isClosed = false
    is360R = false
    is360L = false;
    drawingCoordinates = [];

    previousVector = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    paintCentralPoint()
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
}

let hasCrossedTrigger = false;
function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;


    if (checkIfCircleFinished()) {
        isDrawing = false;
        endDrawing();
        return;
    }


    drawingCoordinates.push({ x, y });
    ctx.lineTo(x, y);
    checkDirectionChange();
    updatePercentage();
    ctx.stroke();







}



function endDrawing() {

    isDrawing = false;
    ctx.closePath();
    // updatePercentage()



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
    if (!isClosed) {
        percentageContainer.textContent = `Круг не закончен`;
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
    percentageContainer.textContent = `Радиальное совпадение: ${averagePercentage.toFixed(2)}%, Реальное совпадение: ${radialPercentage.toFixed(2)}%`;

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

