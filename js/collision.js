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