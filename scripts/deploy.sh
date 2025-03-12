#!/bin/bash

cd /home/ec2-user/my-backend-repo

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Restarting backend..."
pm2 restart server.js || pm2 start server.js
