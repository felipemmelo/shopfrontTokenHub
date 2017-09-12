pragma solidity ^0.4.10;

import "./ProductManager.sol";
import "./TokenContracts.sol";

/**
 * Base for contracts that are payable by Tokens.
 */
contract PayableWithToken is ERC20Extension,ProductManager {
 
    event LogTokenAccepted(address token);
    event LogTokenRemoved (address token);

    mapping(address => bool) public acceptedTokens;    
    mapping(address => uint) public tokensBalances; 
    
    modifier tokenIsAccepted(address token) {
        require(acceptedTokens[token]);
        _;
    }    
    
    //The shop can work with multiple tokens
    function addAcceptedToken(address token)
    onlyVendor
    returns(bool)
    {
        acceptedTokens[token] = true;
        LogTokenAccepted(token);
        return true;
    }     
    
    function removeAcceptedToken(address token)
    onlyVendor
    returns(bool)
    {
        acceptedTokens[token] = false;
        LogTokenRemoved(token);
        return true;
    }     
}