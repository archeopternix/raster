document.addEventListener("DOMContentLoaded", function() {
    const icons = document.querySelectorAll(".icon");
    const canvas = document.getElementById("raster");
    const ctx = canvas.getContext("2d");
    const images = [];

    const gridSize = 52; // Each cell is 52x52 pixels

    let draggedElement = null;
    let isDragging = false;
    let startX, startY;

    icons.forEach(icon => {
        icon.addEventListener("dragstart", dragStart);
    });

    canvas.addEventListener("dragover", dragOver);
    canvas.addEventListener("drop", drop);

    // Make dropped images draggable
    canvas.addEventListener("mousedown", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const img of images) {
            if (x >= img.x && x <= img.x + 50 && y >= img.y && y <= img.y + 50) {
                draggedElement = img;
                isDragging = true;
                startX = x - img.x;
                startY = y - img.y;
                break;
            }
        }
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const snappedX = Math.floor((x - startX) / gridSize) * gridSize + (gridSize / 2 - 25);
            const snappedY = Math.floor((y - startY) / gridSize) * gridSize + (gridSize / 2 - 25);

            draggedElement.x = snappedX;
            draggedElement.y = snappedY;

            drawCanvas();
        }
    });

    document.body.addEventListener("mouseup", (event) => {
        if (isDragging) {
            isDragging = false;

            const rect = canvas.getBoundingClientRect();
            const dropX = event.clientX - rect.left;
            const dropY = event.clientY - rect.top;

            // Check if drop position is outside the canvas
            if (dropX < 0 || dropX > canvas.width || dropY < 0 || dropY > canvas.height) {
                console.log("Dropped outside canvas, deleting instance.");

                // Find and remove the image under the cursor
                for (let i = 0; i < images.length; i++) {
                    if (event.clientX >= images[i].x && event.clientX <= images[i].x + 50 &&
                        event.clientY >= images[i].y && event.clientY <= images[i].y + 50) {
                        images.splice(i, 1);
                        break;
                    }
                }

                drawCanvas();
            }
        }
    });

    function dragStart(event) {
        draggedElement = event.target;
        event.dataTransfer.setData("text/plain", event.target.src);
        event.dataTransfer.setData("offsetX", event.offsetX);
        event.dataTransfer.setData("offsetY", event.offsetY);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const iconSrc = event.dataTransfer.getData("text/plain");
        const offsetX = parseInt(event.dataTransfer.getData("offsetX"), 10);
        const offsetY = parseInt(event.dataTransfer.getData("offsetY"), 10);

        const rect = canvas.getBoundingClientRect();
        let dropX = event.clientX - rect.left - offsetX + 25;
        let dropY = event.clientY - rect.top - offsetY + 25;

        console.log(`Drop position: (${dropX}, ${dropY})`);

        // Check if drop position is outside the canvas
        if (dropX < 0 || dropX > canvas.width || dropY < 0 || dropY > canvas.height) {
            console.log("Dropped outside canvas, deleting instance.");

            // Find and remove the image under the cursor
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            for (let i = 0; i < images.length; i++) {
                if (canvasX >= images[i].x && canvasX <= images[i].x + 50 &&
                    canvasY >= images[i].y && canvasY <= images[i].y + 50) {
                    images.splice(i, 1);
                    break;
                }
            }

            drawCanvas();
            return;
        }

        const snappedX = Math.floor(dropX / gridSize) * gridSize + (gridSize / 2 - 25);
        const snappedY = Math.floor(dropY / gridSize) * gridSize + (gridSize / 2 - 25);

        console.log(`Snapped position: (${snappedX}, ${snappedY})`);

        const img = new Image();
        img.src = iconSrc;
        img.onload = function() {
            images.push({ img, x: snappedX, y: snappedY });
            drawCanvas();
        };
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        for (const img of images) {
            ctx.drawImage(img.img, img.x, img.y, 50, 50);
        }
    }

    function drawGrid() {
        ctx.strokeStyle = "#ddd";
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    drawGrid();
});