# My Solution
SETUP--
```
npm install
mkdir keystore
npm install -D ts-node
npm install -D typescript
npm install -D onchange
```
References:
https://emn178.github.io/online-tools/keccak_256.html

Description:
```
/***
 *         _ _|_ o ._   _     _  _  ._   _  _  |  _
 *     \/ (_) |_ | | | (_|   (_ (_) | | _> (_) | (/_
 *                      _|
 * on Ropsten                VOTING CONSOLE CLI v0.4
 */ 0x3F5E2E0AFc79812FfC67CaD52C937cE9F1549566
cdxCLI$
Balance: 2469625480000000000
ropsten
cdxCLI$
cdxCLI$
cdxCLI$
cdxCLI$ status
cdxCLI$ [ 'YES',
  'NO',
  '1542133138',
  [ '0xa990fb3c293450ee621886a0e0d648d1d08ef0ed2385e9cfe4a55f3d9f0660ff',
    '0xa9a2715ccf8c8bfcd0c6607823cebdb6f54c3e30dafa3a28cbd3c005327b8b58' ],
  'It was a tie!',
  '2',
  '1',
  '1' ]
{ voteCommits: [] }
{ voteStatuses: [] }
0xa9a2715ccf8c8bfcd0c6607823cebdb6f54c3e30dafa3a28cbd3c005327b8b58
0xa990fb3c293450ee621886a0e0d648d1d08ef0ed2385e9cfe4a55f3d9f0660ff
Revealed
Revealed
cdxCLI$ info
{ choice1: 'YES',
  choice2: 'NO',
  commitPhaseEndTime: 1542133138000,
  commitPhaseTimeRemaining: -84.59,
  getVoteCommitsArray:
   [ '0xa990fb3c293450ee621886a0e0d648d1d08ef0ed2385e9cfe4a55f3d9f0660ff',
     '0xa9a2715ccf8c8bfcd0c6607823cebdb6f54c3e30dafa3a28cbd3c005327b8b58' ],
  getWinner: 'It was a tie!',
  numberOfVotesCast: '2',
  voteCommits:
   [ '0xa990fb3c293450ee621886a0e0d648d1d08ef0ed2385e9cfe4a55f3d9f0660ff',
     '0xa9a2715ccf8c8bfcd0c6607823cebdb6f54c3e30dafa3a28cbd3c005327b8b58' ],
  votesForChoice1: '1',
  votesForChoice2: '1',
  voteStatuses: [ 'Revealed', 'Revealed' ] }
cdxCLI$
```

# Full-stack Web3 Engineering Assignment
Thank you for your interest in joining the CDx engineering team!

This document is a quick test designed to evaluate your coding and problem solving skills with dApp development. It’s designed to be straightforward and shouldn't take longer than 3 hours. 

If you're selected to join our team, a primary task will be JavaScript/Typescript-based app/library development and integrating with Solidity contracts. To imitate this, we've created a task that represents the tooling you'll be working with on a daily basis. 

## Background
"Blind" voting on a public blockchain takes some thought. All data is public so it's easy to see who voted and what their vote was. This can bias voters, encourage herd mentality, and lead to suboptimal decisions.

One way to mitigate this is to use a "commit-reveal" scheme. In such a scheme, voters commit `Hash(x + secret)` in some "commit period" where `x` is their vote choice. For simplicitly, suppose `x` is either 0 or 1 and the `"+"` operator means concatenation. So for example, a user might commit a vote `"Hash(0~mysuperbigsecret)"`. We call this the "commitment". 

After the "commit period", voters can reveal their vote by supplying `(x + secret)`, and their `Hash(x + secret)`. This would be `"0~mysuperbigsecret"` and `"Hash(0~mysuperbigsecret)"` respectively, in this case. Using the fact that hash collisions are impossible using a cryptographic hash function, we can cryptographically prove that a user committed to a particular vote by computing the hash of `(x + secret)` and comparing it with the supplied commitment. 

Using this technique, privacy is maintained during the commit period so it is impossible to know voting results until they are revealed. However, once the votes are revealed they are proven using cryptography. Overall vote effectiveness is improved by using a commit-reveal scheme instead of public voting. 

## The task

We've written a simple implementation of a commit-reveal vote scheme in Solidity in `CommitReveal.sol`. **Our ask is for you to write a very simple CLI to wrap it and make it easy for users to participate in the vote.**

The Solidity implementation we wrote is very simple: it has only two choices, "YES" and "NO", the commit phase lasts 2 minutes, and users can vote multiple times. It's based on the blog written by Karl Floresch which we encourage you to check out [here](https://karl.tech/learning-solidity-part-2-voting/) if you're looking for more background.

## Requirements

Using any framework you'd like, please make a CLI that interacts with the contract. Here are the functional requirements and also some clarification on things you do NOT have to do:

### Functional requirements

During the commit phase
- A user should be able to see the two choices they can vote for, "YES" and "NO", 
- A user should be able to see the status of the vote including:
    - Approximate time left until the commit phase is over
    - The current status of the vote (voting/revealing/revealed)
    - The number of votes cast
    - The winner of the vote, if any yet
- A user should be able to commit votes if they are in the commit period
    
    
During the reveal phase
- A user should be able to see the status of the vote including:
    - The vote distribution
    - The current status of the vote (voting/revealing/revealed)
    - The number of votes cast
    - The winner of the vote
- A user should be able to reveal votes if they are in the reveal period

You can use as many or as few commands as you would like to achieve the above functionality. For interacting with the contracts, you can use `ethers.js`, `web3`, or the native truffle contract wrappers. Up to you.

### Things you don't have to do
- Publish this as an NPM package
- Write any further tests for the contracts or exhaustive tests for your CLI. The CLI just needs to work.
- Add any functionality for "switching" between accounts. A user can vote multiple times and that is totally fine. 
- Deploy this on any public blockchain. Use a local blockchain such as `ganache-cli`.

### Things you don't have to do (But did anyways :)
- Deploy this to Ropsten testnet.  Allow for easy creation of multiple CommitReveal voting topics with a registry.

## Setup
First, install the dependencies. You'll need a local Ethereum blockchain to deploy the contracts and run the contract tests if you want. We recommend `ganache`. You can install ganache with 

`npm install -g ganache-cli` 

and start it up with 

`ganache-cli`

## Other notes

- We've already written the migration script with pre-defined choices and there are some helper npm scripts in `package.json` in case you don't want to install truffle beta globally. 
- `truffle-config.js` is already configured to point to your local ganache on port `8545`.
- The `test` folder includes some example code to interact with the contracts using the `truffle-contract` wrappers. **You don't have to use truffle to interact with the contracts**.
- To help with transitioning from the commit phase to the reveal phase, we've provided some example code in the `test` folder. Ganache has a special command called `evm_increaseTime` which can artifically set the next block's timestamp and `@0xproject` provides a nice wrapper around this command. Just remember that once you go forward in time you can't go back!

All you have to do is write your CLI!

## What we're looking for
We're interested in your coding style, your familarity with developer tooling for smart contracts, and your JavaScript/TypeScript proficiency.

## How to complete this challenge
Fork this repo, write your code in a sub-folder in this repo, and edit this `README` to include instructions on how to use your CLI. Feel free to change anything in the repo except for the `CommitReveal.sol` contract.

Send `julian@cdxproject.com` the GitHub link when you're done. 

Good luck!
