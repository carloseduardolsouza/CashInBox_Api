const path = require("path");

const htmlPath = path.join(__dirname, "..", "assets", "screen", "telainicial.html");

const home = (req, res) => {
  res.sendFile(htmlPath);
};

module.exports = { home };