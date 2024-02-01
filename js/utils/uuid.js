/**
 * @type {Record<string, boolean>}
 */
const uuidCache = {};

/**
 * Generates a unique hex identifier. Does check to ensure the uuid hasn't been 
 * generated before.
 * @returns {string} a uuid
 */
const generateUUID = () => {
  let uuid;
  do {
    uuid = random(0, 1).toString(16).substring(2);
  } while (uuidCache[uuid]);

  uuidCache[uuid] = true;
  return uuid;
};