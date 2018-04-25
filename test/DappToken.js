var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {

    it("initializes properties correctly", function() {
        var tokenInstance;

        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        })
        .then(function(name) {
            assert.equal(name, "Dapp Token", "has the correct name");
            return tokenInstance.symbol();
        })
        .then(function(symbol) {
            assert.equal(symbol, "DAPPT", "has the correct symbol");
        })
        ;
    });

    it("sets the total supply value correctly", function() {
        var tokenInstance;

        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        })
        .then(function(totalSupply) {
            assert.equal(totalSupply, 1000000, "sets the total supply to 1M");
            return tokenInstance.balanceOf(accounts[0]);
        })
        .then(function(adminBalance) {
            assert.equal(adminBalance, 1000000, "allocates initial supply to admin account");
        })
        ;
    });

    it("transfers the tokens", function() {
        var tokenInstance;

        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999999999999);
        })
        .then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert");
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        })
        .then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "triggers transfer event");
            return tokenInstance.balanceOf(accounts[1]);
        })
        .then(function(balance) {
            assert.equal(balance.toNumber(), 250000, "adds the value to receiver");
            return tokenInstance.balanceOf(accounts[0]);
        })
        .then(function(balance) {
            assert.equal(balance.toNumber(), 750000, "deducts the value from sender");
        })
        ;
    });

    it("handles approval of delegated transfer", function() {
        var tokenInstance;

        return DappToken.deployed().then(function(i) {
            tokenInstance = i;
            return tokenInstance.approve.call(accounts[1], 100, { from: accounts[0] });
        })
        .then(function(success) {
            assert.equal(success, true, "returns success");
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        })
        .then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Approval", "triggers transfer event");
            return tokenInstance.allowance(accounts[0], accounts[1]);
        })
        .then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, "allowance was set")
        });
    });

    it("handles delegated transfer", function() {
        var tokenInstance;

        return DappToken.deployed().then(function(i) {
            tokenInstance = i;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        })
        .then(function(receipt) {
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        })
        .then(function(receipt) {
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 9999, { from: spendingAccount });
        })
        .then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, 'error message must contain revert');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        })
        .then(assert.fail).catch(function(error) {
            assert(error.message.indexOf("revert") >= 0, "error message must contain revert");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        })
        .then(function(success) {
            assert.equal(success, true, "returns success");
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        })
        .then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "triggers transfer event");
            return tokenInstance.balanceOf(fromAccount);
        })
        .then(function(balance) {
            assert.equal(balance.toNumber(), 90, "deducts from sender");
            return tokenInstance.balanceOf(toAccount);
        })
        .then(function(balance) {
            assert.equal(balance.toNumber(), 10, "adds to the receiver");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        })
        .then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, "deducts from allowance");
        })
        ;
    });
});