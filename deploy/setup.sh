#!/bin/bash -ex

sudo apt-get update
sudo apt-get dist-upgrade -y
#sudo apt-get install update-manager-core
#sudo do-release-upgrade

sudo apt-get install -y build-essential software-properties-common git

./ebs.sh
./argus.sh
./mongod.sh
./redis.sh
./node.sh
./pm2.sh
#./letsencrypt.sh
./nginx.sh
