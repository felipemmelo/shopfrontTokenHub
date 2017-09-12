pragma solidity ^0.4.10;

import "./FinanceManager.sol";

/**
 * This contract keeps track of the products sold at the Shopfront.
 */ 
contract ProductManager is FinanceManager {
    
    event LogPurchase(address indexed buyer, bytes32 indexed product, bool indexed token);

    event LogOutOfStock(bytes indexed product);        

    struct Product {
        uint price;
        uint stock;
        address merchant;
    }    
    
    mapping(bytes32 => Product) public products;    
    
    modifier validPrice(uint price) {
        require(price > fee);
        _;
    }    
    
    modifier productInStock(bytes32 productId) {
        require(products[productId].stock > 0);
        _;
    }
    
    modifier purchaseValueIsCorrect(bytes32 productId, uint value) {
        require(value == products[productId].price);
        _;
    }
    
    modifier idIsAvailable(bytes32 productId) {
        require(products[productId].price == 0);
        _;
    }
    
    function getProductData(bytes32 productId) 
    constant
    external
    returns(uint price, uint stock, address merchant) 
    {
        Product storage product = products[productId];

        price = product.price;
        stock = product.stock;
        merchant = product.merchant;        
    }    
    
    function getProductMerchant(bytes32 productId)
    internal
    constant
    returns(address)
    {
        return products[productId].merchant;
    }
    
    // adds/updates a product 
    function addProduct(bytes32 id, uint price, uint stock)
    onlyIfRunning
    idIsAvailable(id)
    onlyVendor 
    validPrice(price)     
    external 
    returns(bool)
    {
        products[id] = Product(price, stock, msg.sender);

        return true;
    }

    // adds/updates a product 
    function updateProduct(bytes32 id, uint price, uint stock)     
    onlyIfRunning
    onlyVendor
    validPrice(price) 
    external 
    returns(bool)
    {
        products[id] = Product(price, stock, msg.sender);
        return true;
    }
    
    // removes a product
    function removeProduct(bytes32 productId)
    onlyIfRunning     
    onlyVendor
    external 
    returns(bool) 
    {
        products[productId] = Product(0x0, 0x0, 0x0);
        return true;
    }     
}