class Graph {
  constructor() {
    /**
     * @type {Record<string, Cell>}
     */
    this.cellsMap = {};
  }

  persist() {
    const cells = Object.values(this.cellsMap);
    const data = cells.map((cell) => cell.toJSON());
    localStorage.setItem("cells", JSON.stringify(data));
  }

  restore() {
    const data = localStorage.getItem("cells");
    if (data !== null) {
      try {
        const cells = JSON.parse(data);
        this.cellsMap = cells.reduce((cellsMap, cell) => {
          cellsMap[cell.id] = cell;
          return cellsMap;
        }, {});
      } catch (err) {
        this.cellsMap = {};
        console.error(err);
      }
    }
  }
}