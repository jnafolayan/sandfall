
const GID = generateUUID();
const CELL_SIZE = 8;
const HUE_RANGE = [randomInteger(0, 351), randomInteger(0, 351)].sort();

let containers;
let width, height, grid, rows, cols;
let canvas, ctx;

let lastTime = 0;
let mouseDown = false;

window.onload = start;

localStorage.clear();

function start() {
  width = window.innerWidth;
  height = window.innerHeight;
  rows = Math.round(height / CELL_SIZE);
  cols = Math.round(width / CELL_SIZE);

  grid = makeGrid();

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas(window.innerWidth, window.innerHeight);

  grabContainers();
  upsertContainerSelf();
  setupEvents();

  requestAnimationFrame(animate);
}

function setupEvents() {
  // window.onunload = () => localStorage.clear();

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
}

function update(dt) {  
  // Check if we're receiving any particles
  const cSelf = getContainerSelf();
  for (const p of cSelf.receiving) {
    const [px, py, pcell, psrc] = p;
    const x = px - cSelf.x;
    const y = py - cSelf.y - cSelf.yOffset;

    const src = containers.find(c => c.id === psrc);
    if (!src) continue;

    const placed = emitParticle(
      Math.max(0, Math.min(width, x)), 
      Math.max(0, Math.min(height, y)),
      pcell.hue);
      
    if (placed) {
      src.received.push([pcell.row, pcell.col, pcell.id]);
    }
  }

  cSelf.receiving.length = 0;

  for (const [row, col, id] of cSelf.received) {
    const cell = cellAt(row, col);
    if (cell === null) continue;
    if (cell.id !== id) continue;
    grid[row][col] = null;
  }

  cSelf.received.length = 0;

  for (let row = rows - 1; row >= 0; row--) {
    for (let col = cols - 1; col >= 0; col--) {
      if (cellAt(row, col) != null) {
        updateParticle(cellAt(row, col), dt);
      }
    }
  }

  checkWorld();
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

  navigator.locks.request("update", async () => {
    grabContainers();
    update(dt);
    upsertContainerSelf();
  }).then(() => {
    render();
    requestAnimationFrame(animate);
  });
  
}

function checkWorld() {
  const otherContainers = containers.filter(c => c.id !== GID);
  const cSelf = getContainerSelf();

  let marked = {};

  // Check for collisions
  for (const c of otherContainers) {
    // Dont collide with another container more than once
    if (cSelf.collisions.includes(c.id)) continue;

    const oldReceivingCount = c.receiving.length;

    if (intersects(cSelf, c)) {      
      const bounds = {
        bottom: c.y > cSelf.y,
        left: c.x < cSelf.x,
        right: c.x + c.width > cSelf.x + cSelf.width,
      };

      if (bounds.bottom) {
        for (let col = 0; col < cols; col++) {
          const cell = cellAt(rows - 1, col);
          if (cell !== null && !marked[`${cell.row}_${cell.col}`]) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell, GID]);
              marked[`${cell.row}_${cell.col}`] = true;
            }
          }
        }
      }

      if (bounds.left) {
        for (let row = 0; row < rows; row++) {
          const cell = cellAt(row, 0);
          if (cell !== null && !marked[`${cell.row}_${cell.col}`]) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell, GID]);
              marked[`${cell.row}_${cell.col}`] = true;
            }
          }
        }
      }

      if (bounds.right) {
        for (let row = 0; row < rows; row++) {
          const cell = cellAt(row, cols - 1);
          if (cell !== null && !marked[`${cell.row}_${cell.col}`]) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell, GID]);
              marked[`${cell.row}_${cell.col}`] = true;
            }
          }
        }
      }
    }

    if (oldReceivingCount != c.receiving.length) {
      c.collisions.push(GID);
      c.collisions = [...new Set(c.collisions)];
    }
  }

  marked = null;
  cSelf.collisions.length = 0;
}


function resizeCanvas(w, h) {
  width = w;
  height = h;
  canvas.width = width;
  canvas.height = height;
  rows = Math.round(height / CELL_SIZE);
  cols = Math.round(width / CELL_SIZE);
}

