let PID = 0;
function createParticle(row, col, hue) {
  return {
    id: PID++,
    rand: random(0, 1),
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

  // while (!placed && isInBounds(row, col)) {
  //   if (cellAt(row, col) === null) {
  //     const p = createParticle(row, col, hue || Math.floor(col / cols * 250));
  //     grid[p.row][p.col] = p;
  //     placed = true;
  //     break;
  //   } else {
  //     const positions = [
  //       [row, col + 1],
  //       [row, col - 1],
  //     ];

  //     placed = positions.some(([trow, tcol]) => {
  //       if (cellAt(trow, tcol) === null) {
  //         const p = createParticle(trow, tcol, hue || Math.floor(col / cols * 250));
  //         return moveParticleTo(p, trow, tcol);
  //       }
  //       return false;
  //     });
  //   }
    
  //   row--;
  // }

  return placed;
}

function renderParticle(ctx, p) {
  ctx.fillStyle = `hsl(${Math.floor(p.hue)}, 100%, 45%)`;
  ctx.fillRect(p.col * CELL_SIZE, p.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function updateParticle(p, dt) {
  if (p.type === "solid") return;

  const positions = [
    [p.row + 1, p.col],
    [p.row + 1, p.col + 1],
    [p.row + 1, p.col - 1],
    [p.row + 1, p.col + Math.sign(random(-1, 1))],
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
  if (!couldMove) {
    neighbors.forEach(([row, col]) => {
      if (cellAt(row, col) !== null) {
        hueSum += cellAt(row, col).hue;
        count++;
      }
    });
  }

  const avgHue = hueSum / count;
  p.hue = (p.hue + (avgHue - p.hue));
  if (p.hue < 0) p.hue += 360;
  if (p.hue > 360) p.hue -= 360;
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