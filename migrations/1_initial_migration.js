var Migrations = artifacts.require("./Migrations.sol");
var ShopfrontContractsHub = artifacts.require("ShopfrontContractsHub");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ShopfrontContractsHub);

  ShopfrontContractsHub.deployed()
  .then(instance => console.log("Shopfront Hub deployed at "+instance.address))
  .catch(error => console.log("Error deploying ShopfrontContractsHub: "+error));
};
