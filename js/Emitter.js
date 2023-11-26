class ParticleEmitter {
  constructor(x, y, particleWidth, particleHeight) {
    this.x = x;
    this.y = y;
    this.particleWidth = particleWidth;
    this.particleHeight = particleHeight;
    this.gravity = 50;
    /**
     * @type {Particle[]}
     */
    this.particles = [];
  }

  emit(x, y) {
    this.
  }

  update(dt) {
    this.particles.forEach(p => {
      p.vy += this.gravity * dt;
      p.update(dt);
    });
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
  }
}