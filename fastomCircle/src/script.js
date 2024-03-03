const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let drawingCoordinates = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "#ff1111"; 
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, 2 * Math.PI);
ctx.fill();

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

function startDrawing(e) {
    isDrawing = true;
    drawingCoordinates = []; 
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
    ctx.stroke();
}

function endDrawing() {
    isDrawing = false;
    ctx.closePath();

    console.log(drawingCoordinates);
}
