
const GID = generateUUID();
const CELL_SIZE = 10;
const GRAVITY = 50;

/**
 * @type {Container}
 */
let containers;
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

  grabContainers();
  upsertContainerSelf();

  window.onunload = () => localStorage.clear();

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

  getContainerSelf();
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

  checkWorld();
  
  // Check if we're receiving any particles
  const cSelf = getContainerSelf();
  for (const p of cSelf.receiving) {
    const x = p[0] - cSelf.x;
    const y = p[1] - cSelf.y - cSelf.yOffset;

    emitParticle(
      Math.max(0, Math.min(width, x)), 
      Math.max(0, Math.min(height, y)),
      p[2]);
  }

  cSelf.receiving.length = 0;

  for (let row = rows - 1; row >= 0; row--) {
    for (let col = cols - 1; col >= 0; col--) {
      if (cellAt(row, col) != null) {
        updateParticle(cellAt(row, col));
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

  grabContainers();

  update(dt);
  render();
  requestAnimationFrame(animate);

  upsertContainerSelf();
}

function checkWorld() {
  const otherContainers = containers.filter(c => c.id !== GID);
  const cSelf = getContainerSelf();
  // Check for collisions
  for (const c of otherContainers) {
    if (intersects(cSelf, c)) {
      const bounds = {
        bottom: c.y > cSelf.y,
        left: c.x < cSelf.x,
        right: c.x + c.width > cSelf.x + cSelf.width,
      };

      if (bounds.bottom) {
        for (let col = 0; col < cols; col++) {
          const cell = cellAt(rows - 1, col);
          if (cell !== null) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell.hue]);
              grid[cell.row][cell.col] = null;
            }
          }
        }
      }

      if (bounds.left) {
        for (let row = 0; row < rows; row++) {
          const cell = cellAt(row, 0);
          if (cell !== null) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell.hue]);
              grid[cell.row][cell.col] = null;
            }
          }
        }
      }

      if (bounds.right) {
        for (let row = 0; row < rows; row++) {
          const cell = cellAt(row, cols - 1);
          if (cell !== null) {
            const cellX = cell.col * CELL_SIZE + cSelf.x;
            const cellY = cell.row * CELL_SIZE + cSelf.y + cSelf.yOffset;
            if (pointInRect(cellX, cellY, c)) {
              c.receiving.push([cellX, cellY, cell.hue]);
              grid[cell.row][cell.col] = null;
            }
          }
        }
      }

      // break;
    }
  }
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

function createParticle(row, col, hue) {
  return {
    row,
    col,
    hue
  };
}

function emitParticle(x, y, hue) {
  let row = Math.floor(y / CELL_SIZE);
  let col = Math.floor(x / CELL_SIZE);
  let placed = false;

  while (isInBounds(row, col)) {
    if (cellAt(row, col) === null) {
      const p = createParticle(row, col, hue || Math.floor(col / cols * 250));
      grid[p.row][p.col] = p;
      break;
    } else {
      const positions = [
        [row, col + 1],
        [row, col - 1],
      ];

      placed = positions.some(([trow, tcol]) => {
        if (cellAt(trow, tcol) === null) {
          const p = createParticle(trow, tcol, hue || Math.floor(col / cols * 250));
          moveParticleTo(p, trow, tcol);
          return true;
        }
        return false;
      });

      if (placed) {
        break;
      }
    }
    
    row--;
  }
}

function renderParticle(ctx, p) {
  ctx.fillStyle = `hsl(${p.hue}, 100%, 45%)`;
  ctx.fillRect(p.col * CELL_SIZE, p.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function updateParticle(p) {
  if (p.type === "solid") return;

  const positions = [
    [p.row + 1, p.col],
    [p.row + 1, p.col + 1],
    [p.row + 1, p.col - 1],
    // [p.row, p.col + 1],
    // [p.row, p.col - 1],
  ];

  const couldMove = positions.some(([trow, tcol]) => {
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