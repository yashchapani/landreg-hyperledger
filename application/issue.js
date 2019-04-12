

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const LandPaper = require('../chaincode/contract/lib/paper.js');

const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

async function main() {

  const gateway = new Gateway();

  try {

    const userName = 'User1@org1.regnet.reg';

    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

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

    const issueResponse = await contract.submitTransaction('query', '1');

    console.log('Process issue transaction response.');

    let paper = LandPaper.fromBuffer(issueResponse);

    console.log(`land paper : ` + JSON.stringify(paper) +`successfully issued`);
    console.log('Transaction complete.');

  } catch (error) {

    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);

  } finally {

    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();

  }
}
main().then(() => {

  console.log('Issue program complete.');

}).catch((e) => {

  console.log('Issue program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});