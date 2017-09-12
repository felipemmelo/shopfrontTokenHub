pragma solidity ^0.4.10;

import "./Stoppable.sol";
import "./ShopfrontContract.sol";

/**
 * Hub for the hub/spokes pattern.
 * This hub creates/stops/resumes Shopfronts.
 */ 
contract ShopfrontContractsHub is Stoppable {
    
    event LogNewShopfront     (address vendor, address shopfront, string vendorName);
    event LogShopfrontStarted (address vendor, address shopfront);
    event LogShopfrontStopped (address vendor, address shopfront);
    event LogShopfrontNewOwner(address shopfront, address oldOwner, address newOwner);
    
    address[]                public shopfrontContracts;
    mapping(address => bool) public existingShopfronts;
    
    modifier shopfrontExists(address shopfront) {
        require(existingShopfronts[shopfront]);
        _;
    }
    
    function getShopfrontsCount()
    constant
    returns(uint)
    {
        return shopfrontContracts.length;
    }
    
    function newShopfront(string vendor, uint32 fee) 
    external
    returns (address shopfrontAddress)
    {
        Shopfront trustedShopfront = new Shopfront(fee, msg.sender, vendor, this);
        shopfrontContracts.push(trustedShopfront);
        existingShopfronts[trustedShopfront] = true;
        LogNewShopfront(msg.sender, trustedShopfront, vendor);
        return trustedShopfront;        
    }
    
    function stopShopfront(address shopfront) 
    onlyOwner
    shopfrontExists(shopfront)
    returns (bool success)
    {
        Shopfront trustedShopfront = Shopfront(shopfront);
        LogShopfrontStopped(msg.sender, trustedShopfront);
        return (trustedShopfront.runSwitch(false));
    }
    
    function startShopfront(address shopfront) 
    onlyOwner
    shopfrontExists(shopfront)
    returns (bool success)
    {
        Shopfront trustedShopfront = Shopfront(shopfront);
        LogShopfrontStarted(msg.sender, trustedShopfront);
        return (trustedShopfront.runSwitch(true));        
    }
    
    function changeShopfrontOwner(address shopfront, address newOwner) 
    onlyOwner
    shopfrontExists(shopfront)
    returns (bool success)
    {
        Shopfront trustedShopfront = Shopfront(shopfront);
        LogShopfrontNewOwner(trustedShopfront, msg.sender, newOwner);
        return (trustedShopfront.changeOwner(newOwner));        
    }
}