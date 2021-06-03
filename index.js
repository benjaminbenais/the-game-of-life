const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// === CONSTANTS ===

// UNITS
const FPS = 4;
const GRID_UNIT = 10;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// COLORS
// const CANVAS_BACKGROUND = '#bbbbbb';
const CANVAS_BACKGROUND = '#9a9a9a';
const GRID_COLOR = '#ffffff';
const CELL_COLOR = 'yellow';

// Fill canvas with background color
ctx.fillStyle = CANVAS_BACKGROUND;
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

// GAME STATE
let GAME_STARTED = false;
let cells = [];

const hasGameStarted = () => {
  return GAME_STARTED;
};

// === CONTROLS METHODS ===

// Start/Pause button handlers
const startGame = () => {
  if (!GAME_STARTED) {
    GAME_STARTED = true;
  }
};

const stopGame = () => {
  if (GAME_STARTED) {
    GAME_STARTED = false;
  }
};

const handleStartClick = () => {
  if (startButton.innerText === 'Start') {
    startButton.innerText = 'Pause';
    startGame();
  } else {
    startButton.innerText = 'Start';
    stopGame();
  }
};

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', handleStartClick, false);

// Clear button handler
const clearPattern = () => {
  cells = generateCells();
  drawCells();
};

// Next button handler
const nextPattern = () => {
  if (startButton.innerText === 'Start') {
    gameLoop();
  }
};

// === INITIALIZE THE GAME ===

const generateCells = () => {
  const numberOfCells =
    (CANVAS_WIDTH / GRID_UNIT) * (CANVAS_HEIGHT / GRID_UNIT);

  const tempCells = [];

  // Cell coordinates (updated each time loop terminate)
  let x = 0;
  let y = 0;
  // Reference to the current column
  let currentXPosition = 0;
  // Reference to the current row
  let currentYPosition = 0;

  for (let i = 0; i < numberOfCells; i++) {
    // When the end of a row is reached
    // Increment the current row reference
    // Set current X position to 0
    if (x + GRID_UNIT === CANVAS_WIDTH) {
      currentYPosition++;
      currentXPosition = 0;
    }

    x = currentXPosition * GRID_UNIT;
    y = currentYPosition * GRID_UNIT;

    tempCells.push({
      x,
      y,
      isAlive: false,
    });

    currentXPosition++;
  }

  return tempCells;
};

// Initialize all the cells
cells = generateCells();

// Click event listener
const handleCanvasClick = e => {
  // Mouse position relative to the canvas
  const { offsetX, offsetY } = e;

  // Math.floor(offsetX / GRID_UNIT) gives the column number of the cell
  // Mutliply by GRID_UNIT to know the x position of the cell
  const xPosition = Math.floor(offsetX / GRID_UNIT) * GRID_UNIT;
  const yPosition = Math.floor(offsetY / GRID_UNIT) * GRID_UNIT;

  const tempCells = [];

  for (let i = 0; i < cells.length; i++) {
    if (cells[i].x === xPosition && cells[i].y === yPosition) {
      tempCells.push({
        x: cells[i].x,
        y: cells[i].y,
        isAlive: !cells[i].isAlive,
      });
    } else {
      tempCells.push(cells[i]);
    }
  }
  cells = tempCells;
  drawCells();
};

canvas.addEventListener('click', handleCanvasClick, false);

const drawCells = () => {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].isAlive) {
      ctx.fillStyle = CELL_COLOR;
      ctx.fillRect(cells[i].x + 0.5, cells[i].y + 0.5, GRID_UNIT, GRID_UNIT);
      ctx.strokeStyle = CANVAS_BACKGROUND;
      ctx.lineWidth = 0.1;
      ctx.strokeRect(cells[i].x + 0.5, cells[i].y + 0.5, GRID_UNIT, GRID_UNIT);
    } else {
      ctx.fillStyle = CANVAS_BACKGROUND;
      ctx.fillRect(cells[i].x + 0.5, cells[i].y + 0.5, GRID_UNIT, GRID_UNIT);
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.1;
      ctx.strokeRect(cells[i].x + 0.5, cells[i].y + 0.5, GRID_UNIT, GRID_UNIT);
    }
  }
};

drawCells();

// Return the number of neighbours cells for a given cell
// NOTE: For performances issue, instead of looping through the cells array, I prefer to use imperative style with if statements for each cases
// Since we already loop through each cell in the gameLoop function
const getNumberOfNeighbours = (cells, i) => {
  const numberOfCols = CANVAS_WIDTH / GRID_UNIT;
  let neighbours = 0;

  // Check if
  // If the cell not on the left border (x = 0), inspect its left cells
  if (cells[i].x > 0) {
    // top left neighbourg is alive
    if (cells[i - numberOfCols - 1] && cells[i - numberOfCols - 1].isAlive) {
      neighbours++;
    }

    // left neighbour is alive
    if (cells[i - 1] && cells[i - 1].isAlive) {
      neighbours++;
    }

    // bottom left cell is alive
    if (cells[i + numberOfCols - 1] && cells[i + numberOfCols - 1].isAlive) {
      neighbours++;
    }
  }

  // If cell is not on the top border (y = 0), inspect its top cells
  if (cells[i].y > 0) {
    // top neighbour is alive
    if (cells[i - numberOfCols] && cells[i - numberOfCols].isAlive) {
      neighbours++;
    }

    // top right neighbour is alive
    if (cells[i - numberOfCols + 1] && cells[i - numberOfCols + 1].isAlive) {
      neighbours++;
    }
  }

  // If cell is not on the right border, inspect its right cells
  if (cells[i].x < CANVAS_WIDTH - GRID_UNIT) {
    // right cell neighbourg is alive
    if (cells[i + 1] && cells[i + 1].isAlive) {
      neighbours++;
    }

    // bottom right cell is alive
    if (cells[i + numberOfCols + 1] && cells[i + numberOfCols + 1].isAlive) {
      neighbours++;
    }
  }

  // If cell is not on the bottom border, inspect its bottom cells
  if (cells[i].y < CANVAS_HEIGHT - GRID_UNIT) {
    // bottom cell is alive
    if (cells[i + numberOfCols] && cells[i + numberOfCols].isAlive) {
      neighbours++;
    }
  }

  return neighbours;
};

// GAME LOOP
const gameLoop = () => {
  let tempCells = cells.map((cell, i) => {
    const neighbours = getNumberOfNeighbours(cells, i);
    // For cells that is 'populated'
    if (cell.isAlive) {
      // If 1 or no neighbour, OR 4 or more neighbours, cell dies
      if (neighbours <= 1 || neighbours >= 4) {
        return {
          ...cell,
          isAlive: false,
        };
      }
      return cell;
      // For cells that is 'empty' or 'unpopulated'
    } else {
      if (neighbours === 3) {
        return {
          ...cell,
          isAlive: true,
        };
      }
      return cell;
    }
  });
  cells = tempCells;
  drawCells();
};

setInterval(() => {
  const hasStarted = hasGameStarted();

  if (hasStarted) {
    gameLoop();
  }
}, 1000 / FPS);
