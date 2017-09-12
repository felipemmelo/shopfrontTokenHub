pragma solidity ^0.4.10;

import "./SafeMath.sol";
import "./PayableWithToken.sol";

/**
 * 
 * Implements a multi-merchant and multi-token shopfront.
 * 
 */ 
contract Shopfront is SafeMath,PayableWithToken {

    mapping(uint => bytes32) public multibyersPurchases;
    
    function Shopfront(uint _fee, address _vendor, string _vendorName, address _hub) {
        fee = _fee;    
        vendor = _vendor;
        vendorName = _vendorName;
        hub = _hub;
    }    

    // concludes a purchase by changing balances and stocks and logging the purchase
    function concludePurchase(bytes32 productId, uint value, address buyer, bool fromToken)     
    internal
    {
        Product storage product = products[productId];

        product.stock--;

        hubBalance = safeAdd(hubBalance, fee);
        vendorBalance = safeAdd(vendorBalance, safeSub(value, fee));
        
        // notifies about a new purchase
        LogPurchase(buyer, productId, fromToken);        
    }

    // allows a user to buy a product with ether
    function buy(bytes32 productId) 
    onlyIfRunning
    productInStock(productId)
    purchaseValueIsCorrect(productId, msg.value)
    payable
    external 
    returns(bool)
    {
        concludePurchase(productId, msg.value, msg.sender, false);

        return true;
    }
    
    // allows a multi-buyer purchase
    // this function is expected to be called by the MultiBuyerCollector contract.
    function multibuy(bytes32 productId, uint purchaseId) 
    onlyIfRunning
    productInStock(productId)
    purchaseValueIsCorrect(productId, msg.value)
    payable
    external 
    returns(bool)
    {
        multibyersPurchases[purchaseId] = productId;        

        concludePurchase(productId, msg.value, msg.sender, false);

        return true;
    }

    // allows a user to buy products with a token, as long as the token is accepted by this shop
    // this function is expected to be called by tokens accepted by this contract
    function receiveApproval(address _from, uint256 _value, address _tokenContract, bytes32 _productId)
    onlyIfRunning
    tokenIsAccepted(msg.sender)
    productInStock(_productId)
    purchaseValueIsCorrect(_productId, _value)
    {
        require(_tokenContract.call(bytes4(sha3("transferFrom(address,address,uint256)")), _from, this, _value));        
        
        tokensBalances[_tokenContract] = safeAdd(tokensBalances[_tokenContract], _value);

        concludePurchase(_productId, _value, _from, true);       
    }     
}
