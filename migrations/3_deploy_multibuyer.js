var MultiBuyerCollector = artifacts.require("MultiBuyerCollector");


module.exports = function(deployer) {

	deployer.deploy(MultiBuyerCollector);

	MultiBuyerCollector.deployed()
	.then(instance => console.log("MultiBuyerCollector deployed at "+instance.address))
	.catch(error => console.log("Error deploying MultiBuyerCollector: "+error));	
};
