class Container {
  /**
   * @param {string} id
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   * @param {number} cellWidth 
   * @param {number} cellHeight 
   */
  constructor(id, x, y, width, height, cellWidth, cellHeight) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    this.emitter = new ParticleEmitter(
      this.width / 2, -cellHeight, cellWidth, cellHeight, 1);

    this.grid = [];

    this.initGrid();

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
  }

  getRowsCols() {
    const cols = Math.round(this.width / this.cellWidth);
    const rows = Math.round(this.height / this.cellHeight);
    return { rows, cols };
  }

  initGrid() {
    const { rows, cols } = this.getRowsCols();
    console.log(rows * cols)

    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid.push([]);
      for (let j = 0; j < cols; j++) {
        this.grid[i][j] = null;
      }
    }
  }

  resizeCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  drawGrid(ctx) {
    const { rows, cols } = this.getRowsCols();

    ctx.strokeStyle = '#aaa';
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.strokeRect(j * this.cellWidth, i * this.cellHeight, this.cellWidth, this.cellHeight);
      }
    } 
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawGrid(this.ctx);
    this.emitter.render(this.ctx);
  }

  update(dt) {
    this.emitter.update(dt);
  }

  toJSON() {
    return pick(this, ["id", "x", "y", "width", "height"]);
  }
}