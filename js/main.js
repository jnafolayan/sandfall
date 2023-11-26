var GID = generateUUID();
console.log("Window connected: %s", GID);

const layers = new LayersManager();

async function setup() {
  const result = await navigator.permissions.query({ name: "window-management" });
  if (result.state === "granted") {
    const screens = await window.getScreenDetails();
    console.log(screens.screens);
  } else if (result.state === "prompt") {
    window.
    console.log("prompt")
  }
}

setup();

