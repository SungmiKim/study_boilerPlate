if (process.env.NODE_END === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
}
