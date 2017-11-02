#!/bin/bash -ex

sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/default << "EOF"
upstream node_server {
   server ec2-52-32-20-121.us-west-2.compute.amazonaws.com:80;
}
server {
    location / {
        proxy_pass http://node_server;

        proxy_http_version 1.1;

        proxy_set_header Host       $host;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass          $http_upgrade;
    }
}
EOF

sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'

sudo nginx -t
sudo systemctl restart nginx
