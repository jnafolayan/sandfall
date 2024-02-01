function grabContainers() {
  try {
    containers = JSON.parse(localStorage.getItem("containers") ?? "[]");
  } catch (e) {
    containers = [];
  }
}

function getContainerSelf() {
  let c = containers.find(c => c.id === GID);
  if (!c) {
    c = constructContainerSelf();
    containers.push(c);
    saveContainers();
  }
  return c;
}

function constructContainerSelf() {
  return {
    id: GID,
    x: window.screenX,
    y: window.screenY,
    yOffset: window.outerHeight - window.innerHeight,
    width: window.outerWidth,
    height: window.outerHeight,
    receiving: [],
    received: [],
    collisions: [],
  };
}

function upsertContainerSelf() {
  let c = getContainerSelf();
  if (c == null) {
    c = constructContainerSelf();
    containers.push(c);
  }

  c.x = window.screenX;
  c.y = window.screenY;
  c.yOffset = window.outerHeight - window.innerHeight,
  c.width = window.outerWidth;
  c.height = window.outerHeight;


  saveContainers();
}

function saveContainers() {
  localStorage.setItem("containers", JSON.stringify(containers));
}