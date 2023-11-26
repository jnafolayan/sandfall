class Particle {
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   * @param {number} hue
   */
  constructor(x, y, width, height, hue) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hue = hue;
  }

  render(ctx) {
    ctx.fillStyle = `hsl(${this.hue}, 100%, 45%)`;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}