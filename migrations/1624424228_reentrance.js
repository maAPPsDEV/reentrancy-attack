const Reentrance = artifacts.require("Reentrance");

module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  _deployer.deploy(Reentrance);
};
