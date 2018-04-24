var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {

    it("sets the total supply value correctly", function() {
        return DappToken.deployed().then(function(instance) {
            return instance.totalSupply();
        })
        .then(function(totalSupply) {
            assert.equal(totalSupply, 1000000, "sets the total supply to 1M");
        });
    });
});