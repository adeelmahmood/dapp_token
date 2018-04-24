pragma solidity ^0.4.21;

contract DappToken {

    string public name = "Dapp Token";
    string public symbol = "DAPPT";
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(
        address _from,
        address _to,
        uint256 _value
    );

    function DappToken(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}