const particles = [];

function start() {
  requestAnimationFrame(animate);
}

function update() {

}

function render() {

}

function animate() {
  update();
  render();
  requestAnimationFrame(animate);
}