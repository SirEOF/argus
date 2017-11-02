#!/bin/bash -ex

# Attach EBS volume for storing the repos.
lsblk
sudo file -s /dev/xvdb
sudo mkfs -t ext4 /dev/xvdb
sudo mkdir /data
sudo mount /dev/xvdb /data
chown $USER:root /data

# Attach EBS on reboot
sudo tee -a /etc/fstab << EOF
/dev/xvdb /data  ext4  defaults,nofail 0 2
EOF