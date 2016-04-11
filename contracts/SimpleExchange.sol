// Tokens are expected to fulfill the API at https://github.com/ethereum/EIPs/issues/20

import "Token.sol";
import "Owned.sol";
import "TokenRegistry.sol";


contract SimpleExchange is Owned {
    uint nextOrderId = 1; // Identifies an order
    event OrderConfirmationEvent(uint orderId, address seller, address buyer);
    struct SellOrder {
        uint256 volume;
        uint256 price; // Total price, in ether
        Token token;
        TokenRegistry registry; // Optional
        address seller; // Pointing back to the offer table
    }
    mapping (uint => SellOrder) sellOrderMap; // Map from order id
    mapping (address => uint) orderIdMap; // Map from seller address to order. There can only be one.

    function SimpleExchange() {
    }

    function removeSellOrder(address seller) internal {
        uint orderId = orderIdMap[seller];
        if (orderId == 0) throw;
        delete orderIdMap[seller];
        delete sellOrderMap[orderId];
    }

    function createOffer(uint256 _volume, uint256 _price, Token _token, TokenRegistry _registry) returns (uint orderId) {
        if (_volume == 0) throw;
        if (_token.balanceOf(msg.sender) < _volume) throw;
        if (_token.allowance(msg.sender, this) < _volume) throw;
        uint oldOrderId = orderIdMap[msg.sender];
        if (oldOrderId != 0) delete sellOrderMap[oldOrderId];
        orderId = nextOrderId++;
        sellOrderMap[orderId] = SellOrder(_volume, _price, _token, _registry, msg.sender); // If there was an old offer, it is replaced
        orderIdMap[msg.sender] = orderId;
        return;
    }

    function buy(uint orderId) {
        SellOrder sellorder = sellOrderMap[orderId];
        if (sellorder.volume == 0) throw; // There was no transaction
        if (msg.sender.balance < sellorder.price) throw;
        Token token = sellorder.token;
        address seller = sellorder.seller;
        if (!token.transferFrom(seller, msg.sender, sellorder.volume)) throw;
        removeSellOrder(seller);
        OrderConfirmationEvent(orderId, seller, msg.sender);
    }

    function cancelSellOrder() {
        removeSellOrder(msg.sender);
    }

    /* This unnamed function is called whenever someone tries to send ether to it */
    function () {
        throw;     // Prevents accidental sending of ether
    }

    function destruct() onlyOwner {
        selfdestruct(owner);
    }
}
