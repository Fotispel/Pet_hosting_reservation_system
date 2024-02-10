const canvas = document.getElementById('spinWheel');
const ctx = canvas.getContext('2d');
let segments = []; // This will be populated with pet owners
let currentAngle = 0;
let spinCount = localStorage.getItem('spinCount') ? parseInt(localStorage.getItem('spinCount')) : 0;
let lastWinner = null; // Track the last winner

function drawWheel() {
    const totalSegments = segments.length;
    const anglePerSeg = 2 * Math.PI / totalSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < totalSegments; i++) {
        ctx.beginPath();
        ctx.fillStyle = i % 2 == 0 ? '#fdd' : '#ddf';
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, anglePerSeg * i + currentAngle, anglePerSeg * (i + 1) + currentAngle);
        ctx.lineTo(250, 250);
        ctx.fill();

        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(anglePerSeg * i + anglePerSeg / 2 + currentAngle);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText(segments[i], 230, 10);
        ctx.restore();
    }

    drawArrow();
}

function drawArrow() {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(50, 250); // Arrow tip
    ctx.lineTo(-5, 230); // Bottom left of the arrowhead
    ctx.lineTo(-5, 270); // Top left of the arrowhead
    ctx.closePath();
    ctx.fill();
}

function getWinner() {
    const totalSegments = segments.length;
    const segmentAngle = 360 / totalSegments;
    let adjustedAngle = (currentAngle * 180 / Math.PI) % 360; // Convert radians to degrees and normalize

    // Adjust for clockwise rotation and arrow pointing from left
    adjustedAngle = (adjustedAngle - 90 + 360) % 360;

    // Calculate segment index
    const segmentIndex = Math.floor(adjustedAngle / segmentAngle) % totalSegments;

    // Return the winner segment
    return segments[(totalSegments - segmentIndex) % totalSegments];
}

function spinWheel() {
    const spinTimeTotal = 1000000; // Total spin time in milliseconds
    const spinAngleStart = 50; // Start rotation speed

    function rotateWheel(timeElapsed) {
        if (timeElapsed < spinTimeTotal) {
            const spinAngle = spinAngleStart - easeOut(timeElapsed, 0, spinAngleStart, spinTimeTotal);
            currentAngle += (spinAngle * Math.PI / 180);
            drawWheel();
            requestAnimationFrame((newTime) => rotateWheel(newTime + timeElapsed));
        } else {
            drawWheel();
            const winner = getWinner();

            if (winner === lastWinner) {
                // Re-spin if the same user wins again
                spinWheel();
                return;
            }

            lastWinner = winner; // Update the last winner
            let prize = spinCount === 0 ? "Δωροεπιταγή 100 ευρώ σε pet shop" : "Δωρεάν καφές σε cat cafe";

            let winners = JSON.parse(localStorage.getItem('winners')) || [];
            winners.push({ winner, prize });
            localStorage.setItem('winners', JSON.stringify(winners));

            spinCount++;
            localStorage.setItem('spinCount', spinCount);
        }
    }

    function easeOut(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    }

    requestAnimationFrame((newTime) => rotateWheel(newTime));
}

function initializeWheel() {
    fetchPetOwners().then(petOwners => {
        segments = petOwners.map(owner => owner.username);
        drawWheel();
    }).catch(error => {
        console.error("Error fetching pet owners:", error);
    });
}

document.getElementById('spinButton').addEventListener('click', () => {
    if (spinCount < 2) {
        spinWheel();
    } else {
        alert("The spin wheel has been used twice.");
    }
});
