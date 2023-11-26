class Layer {
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

    /**
     * @type {Window?}
     */
    this.handle = null;
  }

  /**
   * Opens a new window to represent this layer.
   * @returns {boolean} 'true' if window was created; 'false', otherwise.
   */
  initialise() {
    const windowFeatures = this._getWindowFeatures();
    this.handle = window.open(".", "_blank", windowFeatures);
    return this.handle !== null;
  }

  resize(width, height) {
    if (!this.handle) return;
    this.handle.resizeTo(width, height);
  }

  /**
   * Constructs the attributes for the new window.
   * @private
   * @returns {string} comma separated attributes for the new window.
   */
  _getWindowFeatures() {
    return [
      `left=${this.x}`,
      `top=${this.y}`,
      `width=${this.width}`,
      `height=${this.height}`,
    ].join(',');
  }
}
