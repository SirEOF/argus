#!/bin/bash -ex

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y npm nodejs

# Allow binding to port 80
sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep /usr/bin/node
