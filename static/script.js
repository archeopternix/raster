document.addEventListener("DOMContentLoaded", function() {
    const icons = document.querySelectorAll(".icon");
    const deleteIcon = document.querySelector(".delete-icon");
    const canvas = document.getElementById("raster");
    const ctx = canvas.getContext("2d");
    const contextMenu = document.getElementById("context-menu");
    let selectedImage = null;

    const images = [];
    const gridSize = 52; // Each cell is 52x52 pixels

    let draggedElement = null;
    let isDragging = false;
    let startX, startY;

    let clickTimer = null; // Timer to differentiate between single and double clicks

    // Adjust canvas size to fit the screen with specified gaps
    function adjustCanvasSize() {
        const horizontalGap = 50;
        const topGap = 150;
        canvas.width = window.innerWidth - 2 * horizontalGap;
        canvas.height = window.innerHeight - topGap - horizontalGap;
    }

    window.addEventListener('resize', adjustCanvasSize);
    adjustCanvasSize(); // Initial adjustment

    // Prevent the default context menu from appearing
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    icons.forEach(icon => {
        icon.addEventListener("dragstart", dragStart);
    });

    canvas.addEventListener("dragover", dragOver);
    canvas.addEventListener("drop", drop);

    // Make dropped images draggable
    canvas.addEventListener("mousedown", (event) => {
        if (event.button === 2) { // Right-click
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            for (const img of images) {
                if (x >= img.x && x <= img.x + 50 && y >= img.y && y <= img.y + 50) {
                    selectedImage = img;
                    showContextMenu(event.clientX, event.clientY);
                    return;
                }
            }
        } else { // Left-click
            hideContextMenu();
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                handleDoubleClick(event);
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    handleMouseDown(event);
                }, 250); // Delay to detect double-click (250ms)
            }
        }
    });

    function handleMouseDown(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const img of images) {
            if (x >= img.x && x <= img.x + 50 && y >= img.y && y <= img.y + 50) {
                draggedElement = img;
                isDragging = true;
                startX = x - img.x;
                startY = y - img.y;
                return;
            }
        }
    }

    document.addEventListener("mousemove", (event) => {
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

    document.addEventListener("mouseup", (event) => {
        if (isDragging) {
            isDragging = false;

            const rect = canvas.getBoundingClientRect();
            const dropX = event.clientX - rect.left;
            const dropY = event.clientY - rect.top;

            // Check if drop position is outside the canvas
            if (dropX < 0 || dropX > canvas.width || dropY < 0 || dropY > canvas.height) {
                // Find and remove the image under the cursor
                for (let i = 0; i < images.length; i++) {
                    if (draggedElement && images[i] === draggedElement) {
                        images.splice(i, 1);
                        drawCanvas();
                        saveState();
                        break;
                    }
                }
            } else {
                saveState();
            }
        }
    });

    // Handle double-click to rotate image to the right
    function handleDoubleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const img of images) {
            if (x >= img.x && x <= img.x + 50 && y >= img.y && y <= img.y + 50) {
                img.angle = (img.angle || 0) + 90;
                drawCanvas();
                saveState();
                return;
            }
        }
    }

    document.getElementById("rotate-left").addEventListener("click", () => {
        if (selectedImage) {
            selectedImage.angle = (selectedImage.angle || 0) - 90;
            drawCanvas();
            saveState();
            hideContextMenu();
        }
    });

    document.getElementById("rotate-right").addEventListener("click", () => {
        if (selectedImage) {
            selectedImage.angle = (selectedImage.angle || 0) + 90;
            drawCanvas();
            saveState();
            hideContextMenu();
        }
    });

    document.getElementById("remove").addEventListener("click", () => {
        if (selectedImage) {
            const index = images.indexOf(selectedImage);
            if (index > -1) {
                images.splice(index, 1);
                drawCanvas();
                saveState();
                hideContextMenu();
            }
        }
    });

    function dragStart(event) {
        event.dataTransfer.setData("text/plain", event.target.src);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const iconSrc = event.dataTransfer.getData("text/plain");
        const iconName = iconSrc.substring(iconSrc.lastIndexOf('/') + 1, iconSrc.lastIndexOf('.'));

        const rect = canvas.getBoundingClientRect();
        let dropX = event.clientX - rect.left;
        let dropY = event.clientY - rect.top;

        // Check if drop position is outside the canvas
        if (dropX < 0 || dropX > canvas.width || dropY < 0 || dropY > canvas.height) {
            return;
        }

        const snappedX = Math.floor(dropX / gridSize) * gridSize + (gridSize / 2 - 25);
        const snappedY = Math.floor(dropY / gridSize) * gridSize + (gridSize / 2 - 25);

        const img = new Image();
        img.src = iconSrc;
        img.onload = function() {
            images.push({ img, x: snappedX, y: snappedY, name: iconName, angle: 0 });
            drawCanvas();
            saveState();
        };
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        for (const img of images) {
            ctx.save();
            ctx.translate(img.x + 25, img.y + 25);
            ctx.rotate((img.angle || 0) * Math.PI / 180);
            ctx.drawImage(img.img, -25, -25, 50, 50);
            ctx.restore();
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

    function showContextMenu(x, y) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    // Function to save the state of all images and submit to server
    function saveState() {
        const state = images.map(img => ({
            name: img.name,
            gridX: Math.round(img.x / gridSize),
            gridY: Math.round(img.y / gridSize),
            angle: img.angle || 0
        }));
        submitStateToServer(state);
    }

    // Function to submit the state to the server
    function submitStateToServer(state) {
        fetch('/api/grid/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state),
        })
        .then(response => response.json())
        .then(data => {
            console.log('State submitted successfully:', data);
        })
        .catch((error) => {
            console.error('Error submitting state:', error);
        });
    }

    drawGrid();
});