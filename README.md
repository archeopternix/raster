# Raster - a model railroad control panel creator

The application consists of a webserver that serves static content files and handles API requests. It provides a web based (HTML + pure Javascript) frontend,
that consists of a grid, where different icons (schematic track items like turnouts, straights, curves..) can be places, moved and deleted. Every change in the
frontend triggers a http API call to the webserver that processes these changes.

## Function Descriptions

### Event Listeners

1. `DOMContentLoaded`: Initializes the script once the DOM is fully loaded. Sets up the canvas size, prevents the default context menu, and adds other event listeners for icon drag-and-drop, canvas interactions, and context menu actions.
2. `resize`: Adjusts the canvas size when the browser window is resized. Calls the `adjustCanvasSize` function.
3. `contextmenu`: Prevents the default context menu from appearing on right-click. Attached to the document object.
4. `dragstart`: Makes icons draggable by setting data on the `dragstart` event. Attached to each icon element.
5. `dragover`: Allows dropping by preventing the default behavior of the `dragover` event. Attached to the canvas element.
6. `drop`: Handles the drop event to place an image on the canvas. Attached to the canvas element.
7. `mousedown`: Handles mouse down events on the canvas, differentiating between left and right clicks. On right-click, shows the context menu if an image is clicked. On left-click, initiates dragging or detects double-clicks for image rotation.
8. `mousemove`: Handles mouse move events to drag images on the canvas. Updates the position of the dragged image and redraws the canvas. Attached to the document object.
9. `mouseup`: Handles mouse up events to finalize dragging of images. Checks if the drop position is outside the canvas and removes the image if necessary. Attached to the document object.
10. `click` (rotate-left button): Rotates the selected image to the left by 90 degrees and redraws the canvas. Attached to the "rotate-left" button.
11. `click` (rotate-right button): Rotates the selected image to the right by 90 degrees and redraws the canvas. Attached to the "rotate-right" button.
12. `click` (remove button): Removes the selected image from the canvas and redraws the canvas. Attached to the "remove" button.

### Functions

1. `adjustCanvasSize()`: Adjusts the canvas size to fit the screen with specified gaps.
2. `handleMouseDown(event)`: Handles mouse down events to initiate dragging of an image.
3. `handleDoubleClick(event)`: Handles double-click event to rotate an image to the right.
4. `dragStart(event)`: Makes icons draggable by setting data on the `dragstart` event.
5. `dragOver(event)`: Allows dropping by preventing the default behavior of the `dragover` event.
6. `drop(event)`: Handles the drop event to place an image on the canvas.
7. `drawCanvas()`: Draws the entire canvas including the grid and all images.
8. `drawGrid()`: Draws the grid on the canvas.
9. `showContextMenu(x, y)`: Shows the context menu at the specified position.
10. `hideContextMenu()`: Hides the context menu.
11. `saveState()`: Saves the state of all images and submits it to the server.
12. `submitStateToServer(state)`: Submits the state to the server.
