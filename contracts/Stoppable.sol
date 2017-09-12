pragma solidity ^0.4.10;

import "./Owned.sol";

/**
 * Base for contracts that can stopped/resumed.
 */ 
contract Stoppable is Owned {
    
    bool public running;
    
    function Stoppable() {
        running = true;
    }
    
    modifier onlyIfRunning {
        require(running);
        _;
    }
    
    function runSwitch(bool onOff)
    onlyOwner
    returns (bool success)
    {
        running = onOff;
        return true;
    }
}