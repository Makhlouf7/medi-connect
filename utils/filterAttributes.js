const filterAttributes = (object, allowedAttributes = []) => {
  const filteredObject = Object.assign({}, object);
  Object.keys(filteredObject).forEach((key) => {
    if (!allowedAttributes.includes(key)) delete filteredObject[key];
  });

  return filteredObject;
};

module.exports = filterAttributes;
