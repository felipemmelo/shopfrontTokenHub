pragma solidity ^0.4.10;

import "./Stoppable.sol";

/**
 * Base for contracts that work with the abstraction of multiple merchants.
 */ 
contract FinanceManager is Stoppable {
    
    event LogVendorWithdrawal(address vendor, uint amount);
    event LogHubWithdrawal   (address hub, uint amount);
    
    uint    public fee;
    address public vendor;
    string  public vendorName;    
    
    uint    public hubBalance;
    uint    public vendorBalance;
    address public hub;
     
    modifier onlyVendor {
        require(msg.sender == vendor);
        _;
    }       
    
    modifier onlyHub {
        require(msg.sender == hub);
        _;
    }
    
    modifier hasBalance {
        require(this.balance > 0);
        _;
    }
    
    // withdraw funds on behalf of the vendor
    function withdraw() 
    onlyIfRunning
    onlyVendor
    returns(uint)
    {
        LogVendorWithdrawal(vendor, vendorBalance);
        vendorBalance = 0;
        msg.sender.transfer(vendorBalance);
    }     
    
    function withdrawHubFunds()
    onlyHub
    returns(bool) {
        LogHubWithdrawal(msg.sender, hubBalance);
        hubBalance = 0;
        msg.sender.transfer(hubBalance);
    }
}