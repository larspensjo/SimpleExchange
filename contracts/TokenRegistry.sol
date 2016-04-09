// According to https://github.com/ethereum/EIPs/issues/22

contract TokenRegistry {
    function setSymbol(string _s);
    function symbol(address _token) constant returns (string);
    function setName(string _s);
    function name(address _token) constant returns (string);
    function setBaseUnit(uint _s);
    function baseUnit(address _token) constant returns (uint256);
}

