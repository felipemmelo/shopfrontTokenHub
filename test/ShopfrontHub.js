var Shopfront = artifacts.require("Shopfront");
var ShopfrontContractsHub = artifacts.require("ShopfrontContractsHub");

contract('ShopfrontHub', function(accounts) {

  var shopfrontAbi = Shopfront.abi;

  var contract;

  var owner    = accounts[0];
  var admin1   = accounts[1];
  var vendor   = accounts[2];
  var user     = accounts[3];
  var hub      = accounts[4];

  var vendorName = "Shopfront Test";

  var fee = 2;

  console.log("TEST DATA:");
  console.log("Owner: " + owner);
  console.log("Vendor: " + vendor);  
  console.log("User: " + user);
  console.log("Fee: " + fee);

  beforeEach(function() {        

    return ShopfrontContractsHub.new()
      .then(function(instance) {       
        contract = instance; 
      });
  });


  it ("should allow the creation of a new Shopfront", function(){

    var address;

    return contract.newShopfront(vendorName, fee, {from: vendor})
    .then(tx => {
      address = tx.logs[0].args.shopfront;
      return contract.existingShopfronts.call(address);
    })    
    .then(existing => {
      assert.isTrue(existing, "Shopfront created but not registered in Hub");
      web3.eth.contract(shopfrontAbi).at(address, function (err, shopfront) {        
        shopfront.fee(function(err, res) {assert.equal(fee, res, "fees are different")});        
        shopfront.vendor(function(err, res) {assert.equal(vendor, res, "vendors are different")});        
        shopfront.vendorName(function(err, res) {assert.equal(vendorName, res, "vendors names are different")});
        shopfront.hub(function(err, res) {assert.equal(contract.address, res, "hubs are different")});        
      });      
    });
  });


  it ("should count the number of Shopfronts created", function(){
    return contract.newShopfront(vendorName, fee, {from: vendor})
    .then(created1 => contract.newShopfront(vendorName + "2", fee + 1, {from: user}))
    .then(created2 => contract.getShopfrontsCount.call())
    .then(numSf => assert.equal(2, numSf, "two shopfronts created but not accounted by hub"));
  });  


  it ("should allow Shopfronts to be stopped and resumed if they exist", function(){

    var address;

    var id = "10";
    var price = fee + 10;
    var stock = 1;        

    return contract.newShopfront(vendorName, fee, {from: vendor})  
    .then(tx => {
      address = tx.logs[0].args.shopfront;        
      return contract.stopShopfront(address);
    })        
    .then(res => {

      var expectedError = "Error: VM Exception while processing transaction: invalid opcode";
      web3.eth.contract(shopfrontAbi).at(address, function (err, shopfront) {                    
        
        shopfront.addProduct(id, price, stock, {from: vendor}, function(err, res) {
          assert.isTrue((err+"").indexOf(expectedError) !== -1, "product added with contract stopped");

          contract.startShopfront(address)
          .then(started => {
              shopfront.addProduct(id, price, stock, {from: vendor}, function(err2, res2) {
                  assert.isNull(err2, "could not add product after contract was resumed");
                  shopfront.getProductData(id, function(err3,res3) {                    
                    assert.equal(vendor, res3[2], "vendors are different")
                  });                  
              });
          });
        });
      });      
    });    
  });  


  it ("should allow Shopfronts owners to be changed", function(){

    var address;

    return contract.newShopfront(vendorName, fee, {from: vendor})  
    .then(tx => {
      address = tx.logs[0].args.shopfront;              
      
      web3.eth.contract(shopfrontAbi).at(address, function (err, shopfront) {  

        shopfront.owner(function(err, res) {

          assert.equal(contract.address, res, "vendors are different");

          contract.changeShopfrontOwner(address, user)
          .then(changed => {
              shopfront.owner(function(err2, res2) {
                assert.equal(user, res2, "owner was not changed");
              }); 
          })
        });
      });       
    });
  });    


  it ("should allow Hub to change owner", function(){

      return contract.owner.call()
      .then(own => {
        assert.equal(own, owner, "owners are different");
        contract.changeOwner(user);
      })
      .then(res => contract.owner.call())
      .then(newOwn => assert.equal(newOwn, user, "owners did not change"));
  });  
});