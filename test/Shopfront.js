var Shopfront = artifacts.require("Shopfront");
var HumanStandardToken = artifacts.require("HumanStandardToken");

contract('Shopfront', function(accounts) {

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

    return Shopfront.new(fee, vendor, vendorName, hub)
      .then(function(instance) {       
        contract = instance; 
      });
  });

  it ("should initialize shopfront data", function() {
    
    return contract.fee.call()
    .then(function(mf){
      assert.equal(fee, mf, "merchant fee is not as expected");
      return contract.vendor.call();
    })    
    .then(vd => {
      assert.equal(vd, vendor, "vendors are different");
      return contract.vendorName.call();
    })    
    .then(vdNm => {
      assert.equal(vdNm, vendorName, "vendors names are different");
      return contract.hub.call()
    })    
    .then(hb => assert.equal(hb, hub, "hubs are different"));
  });


  it ("should only accept product registration from vendor", function() {
    
    contract.addProduct.call(1, fee + 1, 1, {from: user})    
    .catch(function(err){assert.isTrue((err+"").indexOf("Error: Error: VM Exception while executing eth_call: invalid opcode") !== -1, "unexpected error happened")})
  });


  it ("should only accept product whose price is higher than fee", function() {

    contract.addProduct.call(1, fee, 1, {from: owner})    
    .catch(function(err){assert.isTrue((err+"").indexOf("Error: Error: VM Exception while executing eth_call: invalid opcode") !== -1, "unexpected error happened")})
  });


  it ("should reject invalid prices", function() {
    var id = 1;
    var price = 0;
    var stock = 1;
    contract.addProduct.call(id, price, stock, {from: owner})
    .catch(function(err){assert.isTrue((err+"").indexOf("Error: Error: VM Exception while executing eth_call: invalid opcode") !== -1, "unexpected error happened")})
  });


  it ("should be able to add products", function() {
    var id = 2;
    var price = fee + 1;
    var stock = 4;
    var merchant = vendor;
    
    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: owner});})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
    });
  });


  it ("should be able to remove products", function() {
    var id = 5;
    var price = fee + 1;
    var stock = 7;    
    var merchant = vendor;
    var emptyUser = "0x0000000000000000000000000000000000000000";

    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: merchant})})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");      
      return contract.removeProduct(id, {from: merchant});
    })
    .then(function(rr) {      
      return contract.getProductData.call(id, {from: merchant});
    })
    .then(function(pd){      
      assert.equal(3, pd.length, "not all product data were retrievede");
      assert.equal(0, pd[0], "prices are different");
      assert.equal(0, pd[1], "stocks are different");
      assert.equal(emptyUser, pd[2], "merchants are different");            
    });    
  });


  it ("should only allow owner to update product", function() {
    var id = 2;
    var price = fee + 1;
    var stock = 4;
    var merchant = vendor;
    
    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: owner});})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
    })
    .then(function(a) {return contract.updateProduct(id, price + 1, stock, {from: merchant})})
    .then(function(res){return contract.getProductData.call(id, {from: owner});})    
    .then(function(pr) {      
      assert.equal(price + 1, pr[0], "prices are different");
      return contract.updateProduct(id, price + 2, stock, {from: user})
    })
    .catch(function(err){assert.isTrue((err+"").indexOf("invalid opcode") !== -1, "a user that is not the product merchant was able to update it")})    
  });


  it ("should only allow product owners to remove products", function() {
    var id = 7;
    var price = 8;
    var stock = 9;    
    var merchant1 = vendor;
    var merchant2 = user;

    return contract.addProduct(id, price, stock, {from: merchant1})
    .then(function(res){return contract.getProductData.call(id, {from: merchant2})})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrieved");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");      
      return contract.removeProduct(id, {from: merchant2});
    })
    .catch(function(err){assert.isTrue((err+"").length > 0)});
  });


  it ("should allow any user to buy with ether", function() {
    var id = 10;
    var price = fee + 2;
    var stock = 12;
    var merchant = vendor;
    var buyer = user;

    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: user});})
    .then(function(pr){      
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
      return contract.buy(id, {from: user, value: price});
    })
    .then(function(pc) {return contract.getProductData.call(id, {from: user});})
    .then(function(pd){assert.equal(stock - 1, pd[1], "stocks was not decreased")});
  });


  it ("should forbid the purchase of soldout products", function() {
    var id = 10;
    var price = 11;
    var stock = 1;
    var merchant = vendor;
    var buyer = user;

    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: user});})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
      return contract.buy(id, {from: user, value: price});
    })
    .then(function(pc) {return contract.getProductData.call(id, {from: user});})
    .then(function(pd){
      assert.equal(0, pd[1], "stocks was not decreased");
      return contract.buy(id, {from: user, value: price});
    })
    .catch(function(err){assert.isTrue((err+"").length > 0)});
  });


  it ("should forbid the purchase if funds and product price are different", function() {
    var id = 10;
    var price = fee + 3;
    var stock = 1;
    var merchant = vendor;
    var buyer = user;

    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: user});})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
      return contract.buy(id, {from: user, value: price + 1});
    })
    .catch(function(err){assert.isTrue((err+"").length > 0)});
  });


  it ("should allow vendor to withdraw funds", function() {

    var id = "10";
    var price = fee + 10;
    var stock = 1;
    var merchant = vendor;
    var buyer = user;    
    
    return contract.addProduct(id, price, stock, {from: merchant})
    .then(function(res){return contract.getProductData.call(id, {from: user});})
    .then(function(pr){
      assert.equal(3, pr.length, "not all product data were retrievede");
      assert.equal(price, pr[0], "prices are different");
      assert.equal(stock, pr[1], "stocks are different");
      assert.equal(merchant, pr[2], "merchants are different");
      return contract.buy(id, {from: user, value: price});
    })
    .then(function (f){return contract.vendorBalance.call()})
    .then(function(cf){assert.equal(price - fee, cf.toNumber(), "incorrect merchant balance")})        
    .then(function(an){return contract.withdraw({from: merchant})})
    .then(function (f){return contract.vendorBalance.call()})
    .then(function(cf){assert.equal(0, cf.toNumber(), "incorrect remaining balance")})    
  });


  it ("should forbid purchases with unacceptable tokens", function() {

    var initialAmount = 1000;
    var tokenName = "Shopfront Token";
    var decimalUnits = 9;
    var tokensSymbol = "TKN";

    var id = "10";
    var price = fee + 10;
    var stock = 10;
    var merchant = vendor;
    var buyer = user;
    
    return contract.addProduct(id, price, stock, {from: merchant})
      .then(res => contract.getProductData.call(id, {from: owner}))
      .then(function(rs) {        
          return HumanStandardToken.new(initialAmount, tokenName, decimalUnits, tokensSymbol)
          .then(function(token) {
              token.assignTokens(buyer, price)                                    
              .then(rs2 => token.approveAndCall(contract.address, price, id, {from: buyer}))       
              .then(vt => {
                var result = JSON.stringify(vt);
                assert.isTrue(result.indexOf("\"event\":\"Transfer\"") == -1, "Transfer method from token was reached but token is not accepted");
              })
              .catch(function(err){assert.isTrue((err+"").indexOf("invalid opcode") !== -1, "a user that is not the product merchant was able to update it")});
          });                 
      });
  });  


  it ("should allow products to be bought with tokens", function() {

    var initialAmount = 1000;
    var tokenName = "Shopfront Token";
    var decimalUnits = 9;
    var tokensSymbol = "TKN";

    var id = "10";
    var price = fee + 10;
    var stock = 10;
    var merchant = vendor;
    var buyer = user;

    return contract.addProduct(id, price, stock, {from: merchant})
      .then(function(res){return contract.getProductData.call(id, {from: owner});})
      .then(function(rs) {          
          return HumanStandardToken.new(initialAmount, tokenName, decimalUnits, tokensSymbol)
          .then(function(token) {
              token.assignTokens(buyer, price)                      
              .then(rs1 => contract.addAcceptedToken(token.address, {from: vendor}))
              .then(rs2 => token.approveAndCall(contract.address, price, id, {from: buyer}))       
              .then(vt => {
                var result = JSON.stringify(vt);                
                assert.isTrue(result.indexOf("\"event\":\"Transfer\"") !== -1, "did not reach the Transfer method from token contract");
                return token.balanceOf.call(contract.address);
              })
              .then(blc => assert.equal(price, blc.toNumber(), "transferred tokens and required value do not match."));
          });         
      });
  });  
});
