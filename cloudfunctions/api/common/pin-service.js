function verifyPin({ storedPin, enteredPin }) {
  return String(storedPin) === String(enteredPin);
}

module.exports = {
  verifyPin
};
