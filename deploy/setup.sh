#!/bin/bash -ex

sudo apt-get update
sudo apt-get dist-upgrade -y
#sudo apt-get install update-manager-core
#sudo do-release-upgrade

sudo apt-get install -y build-essential software-properties-common git

./scripts/ebs.sh
./scripts/argus.sh
./scripts/mongod.sh
./scripts/redis.sh
./scripts/node.sh
./scripts/pm2.sh
