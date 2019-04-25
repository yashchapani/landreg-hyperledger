

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const LandPaper = require(__dirname + '/../chaincode/contract/lib/paper.js');

async function main(name, ...args) {
  console.log(name);
  console.log(args);
  console.log(__dirname);

  const wallet = await new FileSystemWallet(__dirname + '/../identity/user/isabella/wallet');

  const gateway = await new Gateway();

  try {

    const userName = 'User1@org1.regnet.reg';
    
    var path = __dirname + '/../gateway/networkConnection.yaml';
    let connectionProfile = await yaml.safeLoad(fs.readFileSync(path, 'utf8'));

    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }
    };
    
    console.log('Connect to Fabric gateway.');

    await gateway.connect(connectionProfile, connectionOptions);

    console.log('Use network channel: regnet.');

    const network = await gateway.getNetwork('regnet');

    console.log('Use org.regnet.reg smart contract.');
    
    const contract = await network.getContract('papercontract', 'org.regnet.reg');

    console.log('Submit land paper issue transaction.');

    const issueResponse = await contract.submitTransaction(name, ...args);

    console.log('Process issue transaction response.');

    let paper = LandPaper.fromBuffer(issueResponse);

    return JSON.stringify(paper);

    // console.log(`land paper : ` + JSON.stringify(paper) +`successfully issued`);
    // console.log('Transaction complete.');

  } catch (error) {

    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);

  } finally {

    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();

  }
}
module.exports.main = main;
// main("issue","7","2","3","4","5").then(() => {

//   console.log('Issue program complete.');

// }).catch((e) => {

//   console.log('Issue program exception.');
//   console.log(e);
//   console.log(e.stack);
//   process.exit(-1);

// });