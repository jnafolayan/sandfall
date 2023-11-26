class Cell {
  /**
   * @param {string} id
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   */
  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.particles = [];
  }

  update() {
    this.particles.forEach(p => p.update());
  }

  toJSON() {
    return pick(this, ["id", "x", "y", "width", "height"]);
  }
}