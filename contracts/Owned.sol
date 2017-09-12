pragma solidity ^0.4.10;

/**
 * Base for contracts that specify special access rules to owners 
 * contract owners.
 */
contract Owned {
    
    event LogNewOwner(address oldOwner, address newOwner);
    
    address public owner;
    
    function Owned() {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(owner == msg.sender);
        _;
    }
    
    function changeOwner(address newOwner)
    onlyOwner
    returns (bool success)
    {
        require(newOwner != 0);
        LogNewOwner(owner, newOwner);
        
        owner = newOwner;
        
        return true;
    }
}