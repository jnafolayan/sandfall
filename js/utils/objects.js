const pick = (source, props) => {
  return props.reduce((result, prop) => {
    result[prop] = source[prop];
    return result;
  }, {});
};