function cellAt(row, col) {
  if (!isInBounds(row, col)) return null;
  return grid[row][col] === undefined ? null : grid[row][col];
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

function drawGrid(ctx) {
  ctx.strokeStyle = '#aaa';
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  } 
}