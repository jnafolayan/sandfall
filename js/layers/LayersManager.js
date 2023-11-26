class LayersManager {
  constructor() {
    /**
     * @type {Record<string, Layer>}
     */
    this.layers = {};
  }

  create(x, y, width, height) {
    const id = generateUUID();
    this.layers[id] = new Layer(id, x, y, width, height);
    return this.layers[id];
  }

  get(id) {
    return this.layers[id] ?? undefined;
  }
}
