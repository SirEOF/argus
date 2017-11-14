#!/bin/bash -ex

sudo mkdir -p /var/www
sudo adduser $USER www-data
sudo chown $USER:www-data -R /var/www
sudo chmod u=rwX,g=srX,o=rX -R /var/www

cd /var/www
git clone --depth 1 https://github.com/mozillasecurity/argus

sudo mkdir /var/log/argus/
sudo chown $USER:root /var/log/argus
