window.getScreenDetails = (() => {
  if (!('getScreenDetails' in window)) {
    window.screen.isExtended = false;
    return async () => [window.screen];
  }
  
  return window.getScreenDetails;
})();