#!/bin/bash -ex

sudo npm install -g pm2
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
