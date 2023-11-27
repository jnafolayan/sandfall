
const GID = generateUUID();
const CELL_SIZE = 8;
const HUE_RANGE = [Math.random() * 350, Math.random() * 350].sort();

/**
 * @type {Container}
 */
let containers;
let width, height, grid, rows, cols;
let canvas, ctx;
let shakeX = 0, shakeY = 0;

let lastTime = 0;
let mouseDown = false;

window.onload = start;

localStorage.clear();

function start() {
  width = window.innerWidth;
  height = window.innerHeight;
  rows = height / CELL_SIZE;
  cols = width / CELL_SIZE;

  grid = makeGrid();

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas(window.innerWidth, window.innerHeight);

  grabContainers();
  upsertContainerSelf();

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

  requestAnimationFrame(animate);
}

function grabContainers() {
  try {
    containers = JSON.parse(localStorage.getItem("containers") ?? "[]");
  } catch (e) {
    containers = [];
  }
}

function getContainerSelf() {
  let c = containers.find(c => c.id === GID);
  if (!c) {
    c = constructContainerSelf();
    containers.push(c);
    saveContainers();
  }
  return c;
}

function constructContainerSelf() {
  return {
    id: GID,
    x: window.screenX,
    y: window.screenY,
    yOffset: window.outerHeight - window.innerHeight,
    width: window.outerWidth,
    height: window.outerHeight,
    receiving: [],
    received: [],
    collisions: [],
  };
}

function upsertContainerSelf() {
  let c = getContainerSelf();
  if (c == null) {
    c = constructContainerSelf();
    containers.push(c);
  }

  c.x = window.screenX;
  c.y = window.screenY;
  c.yOffset = window.outerHeight - window.innerHeight,
  c.width = window.outerWidth;
  c.height = window.outerHeight;


  saveContainers();
}

function saveContainers() {
  localStorage.setItem("containers", JSON.stringify(containers));
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


let oldX = window.screenX;
let oldY = window.screenY;

function animate(time) {
  const dt = Math.min(1000, (time - (lastTime || 0))) / 1000;
  lastTime = time;

  shakeX += window.screenX - oldX;
  shakeY += oldY - window.screenY;
  shakeX *= 0.9;
  shakeY *= 0.8;
  if (Math.abs(shakeX) < 10) shakeX = 0;
  if (Math.abs(shakeY) < 10) shakeY = 0;

  oldX = window.screenX;
  oldY = window.screenY;
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

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width
      && y >= rect.y && y <= rect.y + rect.height;
}

function intersects(a, b) {
  return b.x <= a.x + a.width && b.x + b.width >= a.x 
      && b.y <= a.y + a.height && b.y + b.height >= a.y;
}

function isInBounds(row, col) {
  return !(row < 0 || row >= rows || col < 0 || col >= cols);
}

function cellAt(row, col) {
  if (!isInBounds(row, col)) return null;
  return grid[row][col];
}

let PID = 0;
function createParticle(row, col, hue) {
  return {
    id: PID++,
    rand: Math.random(),
    row,
    col,
    hue,
  };
}

function emitParticle(x, y, hue) {
  let row = Math.floor(y / CELL_SIZE);
  let col = Math.floor(x / CELL_SIZE);
  let placed = false;

  if (isInBounds(row, col) && cellAt(row, col) === null) {
    const p = createParticle(row, col, hue || Math.floor(HUE_RANGE[0] + (col / cols) * HUE_RANGE[1] - HUE_RANGE[0]));
    grid[p.row][p.col] = p;
    placed = true;
  }

  return placed;

  while (!placed && isInBounds(row, col)) {
    if (cellAt(row, col) === null) {
      const p = createParticle(row, col, hue || Math.floor(col / cols * 250));
      grid[p.row][p.col] = p;
      placed = true;
      break;
    } else {
      const positions = [
        [row, col + 1],
        [row, col - 1],
      ];

      placed = positions.some(([trow, tcol]) => {
        if (cellAt(trow, tcol) === null) {
          const p = createParticle(trow, tcol, hue || Math.floor(col / cols * 250));
          return moveParticleTo(p, trow, tcol);
        }
        return false;
      });
    }
    
    row--;
  }

  return placed;
}

function renderParticle(ctx, p) {
  ctx.fillStyle = `hsl(${p.hue}, 100%, 45%)`;
  ctx.fillRect(p.col * CELL_SIZE, p.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function updateParticle(p, dt) {
  if (p.type === "solid") return;

  const positions = [
    [p.row + 1, p.col],
    [p.row + 1, p.col + 1],
    [p.row + 1, p.col - 1],
    p.rand < .5 ? null :
      p.rand < .8 ? [p.row, p.col + 1] : [p.row, p.col - 1],
  ].filter(Boolean);

  const couldMove = positions.some(([trow, tcol]) => {
    if (cellAt(trow, tcol) === null) {
      moveParticleTo(p, trow, tcol);
      return true;
    }
    return false;
  });


  const neighbors = [
    // [p.row - 1, p.col - 1],
    // [p.row - 1, p.col],
    // [p.row - 1, p.col + 1],
    [p.row, p.col - 1],
    [p.row, p.col + 1],
    [p.row + 1, p.col - 1],
    [p.row + 1, p.col],
    [p.row + 1, p.col + 1],
  ];

  let hueSum = p.hue, count = 1;
  neighbors.forEach(([row, col]) => {
    if (cellAt(row, col) !== null) {
      hueSum += cellAt(row, col).hue;
      count++;
    }
  });

  const avgHue = hueSum / count;
  p.hue = Math.floor(p.hue + (avgHue - p.hue) * 0. * dt) % 360;
}

function moveParticleTo(p, trow, tcol) {
  if (isInBounds(trow, tcol)) {
    grid[p.row][p.col] = null;
    grid[trow][tcol] = p;
    p.row = trow;
    p.col = tcol;
    return true;
  }
  return false;
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
  rows = Math.round(height / CELL_SIZE);
  cols = Math.round(width / CELL_SIZE);
}

function drawGrid(ctx) {
  ctx.strokeStyle = '#aaa';
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  } 
}