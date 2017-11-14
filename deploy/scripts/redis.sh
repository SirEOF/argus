#!/bin/bash -ex

cd /tmp
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# redis.conf
sudo mkdir /etc/redis
sudo sh -c 'sed -e "s/^supervised no$/supervised systemd/" \
                -e "s/^dir \.\//dir \/var\/lib\/redis\//" \
                -e "s/^logfile \"\"$/logfile \/var\/log\/redis.log/" \
                redis.conf > /etc/redis/redis.conf'

# Add redis user and set permissions
sudo adduser --system --group --no-create-home redis
sudo mkdir /var/lib/redis

sudo chown redis:redis /var/lib/redis
sudo chmod 700 /var/lib/redis

sudo chown redis:root /etc/redis/redis.conf
sudo chmod 600 /etc/redis/redis.conf

sudo touch /var/log/redis.log
sudo chown redis:redis /var/log/redis.log

# Systemd
sudo tee /etc/systemd/system/redis.service << EOF
[Unit]
Description=Redis
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl start redis
sudo systemctl status redis
sudo systemctl enable redis
