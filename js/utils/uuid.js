/**
 * @type
 */
const uuidCache = {};

const generateUUID = () => {
  let uuid;
  do {
    uuid = Math.random().toString(32).substring(2);
  } while (!uuidCache[uuid]);

  uuidCache[uuid] = true;
  return uuid;
};