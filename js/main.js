
if (!localStorage.getItem("set")) {
  localStorage.setItem("set", 1);
  const x = screenX;
  const y = screenY;
}

window.onunload = () => localStorage.clear();

class LayerM