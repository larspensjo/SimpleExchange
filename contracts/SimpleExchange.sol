// Tokens are expected to fulfill the API at https://github.com/ethereum/EIPs/issues/20

import "Token.sol";
import "Owned.sol";
import "TokenRegistry.sol";


contract SimpleExchange is Owned {
    uint public nextOrderId = 1; // Identifies an order
    event OrderConfirmationEvent(uint orderId, address seller, address buyer);
    struct SellOrder {
        uint256 volume;
        uint256 price; // Total price, in wei
        Token token;
        TokenRegistry registry; // Optional
        address seller;
    }
    mapping (uint => SellOrder) public sellOrderMap; // Map from order id

    modifier zeroFunding {
        if (msg.value != 0) throw;
        _
    }

    function SimpleExchange() {
    }

    function removeSellOrder(uint orderId) internal {
        SellOrder sellorder = sellOrderMap[orderId];
        delete sellOrderMap[orderId];
    }

    // Negative return value means there is an error.
    function createOffer(uint256 _volume, uint256 _price, Token _token, TokenRegistry _registry) zeroFunding returns (int) {
        if (_volume == 0) return -1;
        if (_token.balanceOf(msg.sender) < _volume) return -2;
        if (_token.allowance(msg.sender, this) < _volume) return -3;
        if (!_token.transferFrom(msg.sender, this, _volume)) return -4;
        uint orderId = nextOrderId++;
        sellOrderMap[orderId] = SellOrder(_volume, _price, _token, _registry, msg.sender); // If there was an old offer, it is replaced
        return int(orderId);
    }

    function buy(uint orderId) {
        SellOrder sellorder = sellOrderMap[orderId];
        if (sellorder.volume == 0) throw; // There was no transaction
        if (msg.value != sellorder.price) throw;
        Token token = sellorder.token;
        address seller = sellorder.seller;
        if (!token.transfer(msg.sender, sellorder.volume)) throw;
        seller.send(msg.value);
        removeSellOrder(orderId);
        OrderConfirmationEvent(orderId, seller, msg.sender);
    }

    function cancelSellOrder(uint orderId) zeroFunding {
        SellOrder sellorder = sellOrderMap[orderId];
        Token token = sellorder.token;
        if (token == Token(0)) throw;
        if (msg.sender != sellorder.seller || msg.sender != owner) throw;
        // Return the tokens
        if (!token.transfer(sellorder.seller, sellorder.volume)) throw;
        removeSellOrder(orderId);
    }

    /* This unnamed function is called whenever someone tries to send ether to it */
    function () {
        throw;     // Prevents accidental sending of ether
    }

    function destruct() onlyOwner {
        selfdestruct(owner);
    }
}
