# Solidity Game - Reentrancy Attack

_Inspired by OpenZeppelin's [Ethernaut](https://ethernaut.openzeppelin.com), Re-entrancy Level_

⚠️Do not try on mainnet!

## Task

Do you know how did the hacker hack DAO?

The goal of this game is for you to steal all the funds from the contract.

_Hint:_

1. Untrusted contracts can execute code where you least expect it.
2. Fallback methods
3. Throw/revert bubbling
4. Sometimes the best way to attack a contract is with another contract.

## What will you learn?

1. Re-entrancy
   
   Any interaction from a contract (A) with another contract (B) and any transfer of Ether hands over control to that contract (B). This makes it possible for B to call back into A before this interaction is completed.

2. CEI Pattern - Checks-Effects-Interactions Pattern
   
   Most functions will first perform some checks (who called the function, are the arguments in range, did they send enough Ether, does the person have tokens, etc.). These checks should be done first.

   As the second step, if all checks passed, effects to the state variables of the current contract should be made. Interaction with other contracts should be the very last step in any function.

   The target contract delayed some effects and waited for external function calls to return in a non-error state. This is often a serious mistake because of the re-entrancy problem explained above.

   Note that, also, calls to known contracts might in turn cause calls to unknown contracts, so it is probably better to just always apply this pattern.

## What is the most difficult challenge?

### What was the DAO?

The DAO was a decentralized autonomous organization (DAO) that was launched in 2016 on the Ethereum blockchain. After raising $150 million USD worth of ether (ETH) through a token sale, The DAO was hacked due to vulnerabilities in its code base. The Ethereum blockchain was eventually hard forked to restore the stolen funds, but not all parties agreed with this decision, which resulted in the network splitting into two distinct blockchains: Ethereum and Ethereum Classic.

See more [here](https://www.gemini.com/cryptopedia/the-dao-hack-makerdao)

### Solidity v0.8.0 Breaking Changes

**You won't be able to steal the ether if the target contract has been compiled in Solidity 0.8.0 or uppper** 🤔 [UPDATE](https://github.com/maAPPsDEV/reentrancy-attack/tree/0.8.0)

> [**Solidity v0.8.0 Breaking Changes**](https://docs.soliditylang.org/en/v0.8.5/080-breaking-changes.html?highlight=underflow#silent-changes-of-the-semantics)
>
> Arithmetic operations revert on **underflow** and **overflow**. You can use `unchecked { ... }` to use the previous wrapping behaviour.
>
> Checks for overflow are very common, so we made them the default to increase readability of code, even if it comes at a slight increase of gas costs.

What does it matter with Re-entrancy?

Look at the source code carefully.
Once there is no more ether to steal, `call` would return false, and it starts to finish the chain of transactions.
The first thing is to subtracting the hacker's balance. And it will happen as many times as Re-entrancy attempts. Thus it will cause **underflow** soon.

Since Solidity v0.8.0, **underflow** or **overflow** reverts, eventually you will fail to steal. (I found it after all day tweaking.)

Are you still not clear about what does it mean? Look at the source code [below](https://github.com/maAPPsDEV/reentrancy-attack/tree/0.8.0#source-code). I prevent **underflow** with `unchecked { ... }` (in order to keep the game works).

Two questions you may get:

   1. So, don't you need to use [`SafeMath`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol)?
   2. Re-entrancy is now impossible?


## Source Code

⚠️This contract contains a bug or risk. Do not use on mainnet!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract Reentrance {
  mapping(address => uint256) public balances;

  function donate(address _to) public payable {
    balances[_to] += msg.value;
  }

  function balanceOf(address _who) public view returns (uint256 balance) {
    return balances[_who];
  }

  function withdraw(uint256 _amount) public {
    if (balances[msg.sender] >= _amount) {
      (bool result, bytes memory data) = msg.sender.call{ value: _amount }("");
      if (result) {
        _amount;
      }
      balances[msg.sender] -= _amount;
    }
  }

  fallback() external payable {}
}

```

## Configuration

### Install Truffle cli

_Skip if you have already installed._

```
npm install -g truffle
```

### Install Dependencies

```
yarn install
```

## Test and Attack!💥

### Run Tests

```
truffle develop
test
```

You should take ownership of the target contract successfully.

```
truffle(develop)> test
Using network 'develop'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



  Contract: Hacker
    √ should send ether (185ms)
    √ should steal all ether (330ms)


  2 passing (569ms)

```
