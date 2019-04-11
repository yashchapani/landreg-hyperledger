
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*.mycc.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*.mycc.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

if [ $1 == down ]; then
    rm -v ./channel-artifacts/*
    IMAGE_TAG=latest COMPOSE_PROJECT_NAME=byfn docker-compose -f docker-compose-cli.yaml down --volumes --remove-orphans
    docker run -v $PWD:/tmp/first-network --rm hyperledger/fabric-tools:$IMAGETAG rm -Rf /tmp/first-network/ledgers-backup
    clearContainers
    removeUnwantedImages
else
    bin/configtxgen -profile TwoOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block
    bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID regnet
    bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID regnet -asOrg Org1MSP
    bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID regnet -asOrg Org2MSP
    IMAGE_TAG=latest COMPOSE_PROJECT_NAME=byfn docker-compose -f docker-compose-cli.yaml up -d
    docker exec cli scripts/script.sh regnet 3 node 10 false
fi

# peer chaincode invoke -o 0.0.0.0:7050 -C regnet -n papercontract --peerAddresses 0.0.0.0:7051 --peerAddresses 0.0.0.0:9051 -c '{"Args":["issue","1","2","3","4","5"]}'