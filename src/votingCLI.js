const cdxcli = require('vorpal')();
const tsc = require('ts-node');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx');
var fs = require("fs");
const config = require("./config.js");
require('promise');

web3 = new Web3(new Web3.providers.HttpProvider(config.HOST));
var keyfile = JSON.parse(fs.readFileSync("../keystore/keystore.json")); 
//console.log(keyfile[0]);

var abifile = JSON.parse(fs.readFileSync("../build/RevealCommit.json"));
//console.log(abifile);

//var contractAddress = web3.utils.toChecksumAddress('0x3611c65a15e370a03EC69a4A6f4215eEe5b6910F');
var contractAddress = web3.utils.toChecksumAddress('0x3f5e2e0afc79812ffc67cad52c937ce9f1549566');
var coinbase = web3.utils.toChecksumAddress(keyfile[0].address);
//var privateKey = keyfile[0].privKey;
var privateKey = new Buffer( keyfile[0].privKey, 'hex')

var account = web3.eth.accounts.privateKeyToAccount(privateKey);
var balance = web3.eth.getBalance(coinbase).then(result =>{console.log('\nBalance:',result);});
var RevealCommit = new web3.eth.Contract(abifile, contractAddress);

console.log(coinbase,account);
console.log('/***');
console.log(' *         _ _|_ o ._   _     _  _  ._   _  _  |  _  ');
console.log(' *     \\/ (_) |_ | | | (_|   (_ (_) | | _> (_) | (/_ ');
console.log(' *                      _|                           ');
console.log(' * on Ropsten                VOTING CONSOLE CLI v0.4');
web3.eth.net.getNetworkType().then(console.log);                              
console.log(' */',contractAddress)

function cInfo() {
	var commitVote;
	var revealVote;

	var choice1 ;
	var choice2;
	var commitPhaseEndTime;
	var commitPhaseTimeRemaining;
	var getVoteCommitsArray=[];
	var getWinner;
	var numberOfVotesCast;
	var voteCommits=[];
	var votesForChoice1;
	var votesForChoice2;
	var voteStatuses=[];
	
}
module.exports = cInfo;


function getStatus () {
	Promise.all([
	RevealCommit.methods.choice1().call(),
	RevealCommit.methods.choice2().call(),
	RevealCommit.methods.commitPhaseEndTime().call(),
	RevealCommit.methods.getVoteCommitsArray().call(),
	RevealCommit.methods.getWinner().call().catch(function(err){return('NONE');}),
	RevealCommit.methods.numberOfVotesCast().call(),
	//RevealCommit.methods.voteCommits(0).call(),
	RevealCommit.methods.votesForChoice1().call(),
	RevealCommit.methods.votesForChoice2().call()
	//RevealCommit.methods.voteStatuses(web3.utils.toHex(0x00)).call()
	
	]
	).then(values => { console.log(values);
		var current_timestamp = web3.eth.getBlock('latest');
		cInfo.choice1 = values[0];
		cInfo.choice2 = values[1];
		cInfo.commitPhaseEndTime = new Date(values[2] * 1000).getTime();
		cInfo.commitPhaseTimeRemaining = Math.round( (cInfo.commitPhaseEndTime - new Date().getTime()) /1000/60*100 )/100 ;
		cInfo.getVoteCommitsArray = values[3];
		cInfo.getWinner = values[4];
		cInfo.numberOfVotesCast = values[5];
		cInfo.voteCommits = voteCommits(values[5]);	
		cInfo.votesForChoice1 = values[6];
		cInfo.votesForChoice2 = values[7];
		cInfo.voteStatuses = voteStatuses(values[5]);	
	});
}

function voteCommits(_numberOfVotesCast){
	var arr = [];
	for(x=0;x< _numberOfVotesCast;x++){
		RevealCommit.methods.voteCommits(x).call().then(value =>{  arr.push(value); });
	}
	console.log({"voteCommits": arr });
	return(arr);
}

function voteStatuses(_numberOfVotesCast){
	var arr = [];
	for(x=0;x< _numberOfVotesCast;x++){
		RevealCommit.methods.voteCommits(x).call().then(value =>{ 
			console.log(value); 
			RevealCommit.methods.voteStatuses(value).call().then(voteStatus =>{ console.log(voteStatus); arr.push(voteStatus); }); 
		});
	}
	console.log({"voteStatuses": arr });
	return(arr);
}

function printStatus(){
	console.log({"choice1":cInfo.choice1,
					"choice2":cInfo.choice2,
					"commitPhaseEndTime":cInfo.commitPhaseEndTime,
					"commitPhaseTimeRemaining":cInfo.commitPhaseTimeRemaining,
					"getVoteCommitsArray":cInfo.getVoteCommitsArray,
					"getWinner":cInfo.getWinner,
					"numberOfVotesCast":cInfo.numberOfVotesCast,
					"voteCommits":cInfo.voteCommits,
					"votesForChoice1":cInfo.votesForChoice1,
					"votesForChoice2":cInfo.votesForChoice2,
					"voteStatuses":cInfo.voteStatuses});
}

function commitVote(ballot){
	var vote = ballot;
	var voteHash = web3.utils.sha3(vote);
	console.log("voteHash:",voteHash);
	var encodedFunc = RevealCommit.methods.commitVote(voteHash).encodeABI();
	console.log("encodedFunc:",encodedFunc);
	var rawTransaction = {};

	web3.eth.getTransactionCount(coinbase).then(nonce => {
			rawTransaction = {"from": coinbase,
										  "to": contractAddress,
										 "value": web3.utils.toHex('0'),
										  "nonce": nonce,
										  "gas": web3.utils.toHex('110821'),
										  "gasPrice": web3.utils.toHex(web3.utils.toWei("2", "gwei")),
										  Network : 3,
										  "data": encodedFunc
										};
			var tx = new Tx(rawTransaction);
			tx.sign(privateKey);
			var serializedTx = tx.serialize();
	
		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log).catch(err => console.error(err));
	
	});		
}

function revealVote(ballot){
	var vote = ballot;
	var voteHash = web3.utils.sha3(vote);
	console.log("voteHash:",voteHash);
	var encodedFunc = RevealCommit.methods.revealVote(vote, voteHash ).encodeABI();
	console.log("encodedFunc:",encodedFunc);
	var rawTransaction = {};

	web3.eth.getTransactionCount(coinbase).then(nonce => {
			rawTransaction = {"from": coinbase,
										  "to": contractAddress,
										 "value": web3.utils.toHex('0'),
										  "nonce": nonce,
										  "gas": web3.utils.toHex('110821'),
										  "gasPrice": web3.utils.toHex(web3.utils.toWei("2", "gwei")),
										  Network : 3,
										  "data": encodedFunc
										};
			var tx = new Tx(rawTransaction);
			tx.sign(privateKey);
			var serializedTx = tx.serialize();
	
		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log).catch(err => console.error(err));
	
	});	
}

function getWinner(){
	console.log({"choice1":cInfo.choice1,
						"choice2":cInfo.choice2,
						"votesForChoice1":cInfo.votesForChoice1,
						"votesForChoice2":cInfo.votesForChoice2,
						"commitPhaseEndTime":cInfo.commitPhaseEndTime,
						"numberOfVotesCast":cInfo.numberOfVotesCast});
}



/*
During the commit phase:
A user should be able to see the two choices they can vote for, "YES" and "NO",
A user should be able to see the status of the vote including:
	Approximate time left until the commit phase is over
	The current status of the vote (voting/revealing/revealed)
	The number of votes cast
	The winner of the vote, if any yet
A user should be able to commit votes if they are in the commit period

During the reveal phase:
A user should be able to see the status of the vote including:
	The vote distribution
	The current status of the vote (voting/revealing/revealed)
	The number of votes cast
	The winner of the vote
A user should be able to reveal votes if they are in the reveal period
*/
	
cdxcli
  .command('connect <contractAddress>', 'Connect "to a CommitReveal voting contract".')
  .option('-v, --verbose', 'Print verbose.')
  .action(function(args, callback) {
    if (args.options.verbose) {this.log('connect');}
    
	return this.prompt({
	  type: 'input',
	  name: 'contractAddress',
	  default: contractAddress,
	  message: 'Contract Address?',
	}, function(result){
	  if (!result.continue) {
		console.log('Good move.',result);
		RevealCommit = new web3.eth.Contract(abifile, web3.utils.toChecksumAddress(result));
		callback();
	  } else {
		console.log('Invalid contract.');
		callback();
	  }
	});
  });
  
	
cdxcli
  .command('status', 'Status "A user should be able to see the status of the vote".')
  .option('-v, --verbose', 'Print verbose.')
  .action(function(args, callback) {
    if (args.options.verbose) {this.log('status');}
    getStatus();	
	callback();

  });
  
cdxcli
  .command('commit <vote>', 'Vote "commit 1-supersecurepassword -or- 2-supersecurepassword".')
  .option('-v, --verbose', 'Print verbose.')
  .action(function(args, callback) {
    if (args.options.verbose) {this.log('voting');}	
    commitVote(args.vote);	
	callback();

  });
  
cdxcli
  .command('reveal <vote>' , 'Vote "reveal 1-supersecurepassword -or- 2-supersecurepassword".')
  .option('-v, --verbose', 'Print verbose.')
  .types({
    string: ['vote']
  })
  .action(function(args, callback) {
    if (args.options.verbose) {this.log('revealing');}	
    revealVote(args.vote);	
	callback();

  });
  
cdxcli
  .command('choice', 'Confirm "a Yes or No choice.".')
  .action(function(args, callback) {
    this.log('choice');
    
	return this.prompt({
	  type: 'confirm',
	  name: 'continue',
	  default: false,
	  message: 'That sounds like a really bad idea. Continue?',
	}, function(result){
	  if (!result.continue) {
		console.log('Good move.',result);
		callback();
	  } else {
		console.log('Time to dust off that resume.');
		callback();
	  }
	});
  });

cdxcli
  .command('select', 'Select "from a list of choices".')
  .action(function(args, callback) {
    this.log('select');
    
	return this.prompt({
	  type: 'list',
	  message: 'Where add line?',
	  name: 'line',
	  choices: ['YES', 'NO'],
	}, function(result){
	  if (!result.continue) {
		console.log('Good move.',result);
		callback();
	  } else {
		console.log('Time to dust off that resume.');
		callback();
	  }
	});
  });
  
cdxcli
  .command('info', 'Outputs "A list of CommitReveal voting information".')
  .action(function(args, callback) {
    printStatus()
    callback();
  });
  
cdxcli
  .delimiter('cdxCLI$')
  .show();
  
