
const GID = generateUUID();
const CELL_SIZE = 10;
const GRAVITY = 50;

/**
 * @type {Container}
 */
let container, containers;
let width, height, grid, rows, cols;
let canvas, ctx;

let lastTime = 0;
let mouseDown = false;

window.onload = start;

function start() {
  width = window.innerWidth;
  height = window.innerHeight;
  rows = height / CELL_SIZE;
  cols = width / CELL_SIZE;

  grid = makeGrid();

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas(window.innerWidth, window.innerHeight);

  getContainerSelf();
  upsertContainerSelf();

  window.addEventListener("mousedown", () => {
    mouseDown = true;
  });
  
  window.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (mouseDown) {
      emitParticle(e.clientX, e.clientY);
    }
  });

  requestAnimationFrame(animate);
}

function getContainers() {
  try {
    containers = JSON.parse(localStorage.getItem("containers"));
  } catch (e) {
    containers = [];
  }
}

function getContainerSelf() {
  return {
    id: GID,
    x: window.screenX,
    y: window.screenY,
    width: window.outerWidth,
    height: window.outerHeight,
  };
}

function upsertContainerSelf() {
  const c = getContainerSelf();
}

function update(dt) {
  for (let row = rows - 1; row >= 0; row--) {
    for (let col = cols - 1; col >= 0; col--) {
      if (cellAt(row, col) != null) {
        updateParticle(dt, cellAt(row, col));
      }
    }
  }
}


function render() {
  ctx.clearRect(0, 0, width, height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (cellAt(row, col) != null) {
        renderParticle(ctx, cellAt(row, col));
      }
    }
  }
}

function animate(time) {
  const dt = Math.min(1000, (time - (lastTime || 0))) / 1000;
  lastTime = time;

  containers = JSON.parse(localStorage.getItem("containers"));

  update(dt);
  render();
  requestAnimationFrame(animate);
}

function isInBounds(row, col) {
  return !(row < 0 || row >= rows || col < 0 || col >= cols);
}

function cellAt(row, col) {
  if (!isInBounds(row, col)) return null;
  return grid[row][col];
}

function createParticle(row, col, hue) {
  return {
    row,
    col,
    hue
  };
}

function emitParticle(x, y) {
  const row = Math.floor(y / CELL_SIZE);
  const col = Math.floor(x / CELL_SIZE);
  const p = createParticle(row, col, 0);
  const isEmpty = grid[row][col] === null;

  if (isEmpty) {
    grid[row][col] = p; 
  }
}

function renderParticle(ctx, p) {
  ctx.fillStyle = `hsl(${p.hue}, 100%, 45%)`;
  ctx.fillRect(p.col * CELL_SIZE, p.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function updateParticle(dt, p) {
  if (p.type === "solid") return;

  const positions = [
    [p.row + 1, p.col],
    [p.row + 1, p.col + 1],
    [p.row + 1, p.col - 1],
    // [p.row, p.col + 1],
    // [p.row, p.col - 1],
  ];
  positions.some(([trow, tcol]) => {
    if (cellAt(trow, tcol) === null) {
      moveParticleTo(p, trow, tcol);
      return true;
    }
    return false;
  });
}

function moveParticleTo(p, trow, tcol) {
  if (isInBounds(trow, tcol)) {
    grid[p.row][p.col] = null;
    grid[trow][tcol] = p;
    p.row = trow;
    p.col = tcol;
  }
}

function makeGrid() {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push([]);
    for (let j = 0; j < cols; j++) {
      grid[i][j] = null;
    }
  }
  return grid;
}

function resizeCanvas(w, h) {
  width = w;
  height = h;
  canvas.width = width;
  canvas.height = height;
  rows = Math.floor(height / CELL_SIZE);
  cols = Math.floor(width / CELL_SIZE);
}

function drawGrid(ctx) {
  ctx.strokeStyle = '#aaa';
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  } 
}