var HumanStandardToken = artifacts.require("HumanStandardToken");

var initialAmount = 1000;
var tokenName = "Shopfront Token";
var decimalUnits = 8;
var tokenSymbol = "TNK";

module.exports = function(deployer) {

  deployer.deploy(HumanStandardToken, initialAmount, tokenName, decimalUnits, tokenSymbol);

  console.log("Shopfront Token deployed: initial amount = "+initialAmount+", token name = '"+tokenName+"', decimal units = "+decimalUnits+", symbol = '"+tokenSymbol+"'");
};
