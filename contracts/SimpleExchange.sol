// Tokens are expected to fulfill the API at https://github.com/ethereum/EIPs/issues/20

import "Token.sol";
import "Owned.sol";


contract SimpleExchange is Owned {
    event BaughtEvent(address seller, address buyer);
    struct Offer {
        uint256 volume;
        uint256 price; // Total price, in ether
        Token token;
    }
    mapping (address => Offer) public offers; // At most one offer per address
    
    function SimpleExchange() {
    }

    function createOffer(uint256 _volume, uint256 _price, address _token) returns (uint orderId) {
        if (_volume == 0) throw;
        Token token = Token(_token);
        if (token.balanceOf(msg.sender) < _volume) throw;
        offers[msg.sender] = Offer(_volume, _price, token);
    }
    
    function buy(address seller) {
        Offer offer = offers[seller];
        if (offer.volume == 0) throw; // There was no transaction
        if (msg.sender.balance < offer.price) throw;
        Token token = offer.token;
        if (!token.transferFrom(seller, msg.sender, offer.volume)) throw;
        delete offers[seller];
        BaughtEvent(seller, msg.sender);
    }

    function cancelOffer() {
        delete offers[msg.sender];
    }

    /* This unnamed function is called whenever someone tries to send ether to it */
    function () {
        throw;     // Prevents accidental sending of ether
    }
    
    function destruct() onlyOwner {
        selfdestruct(owner);
    }
}
