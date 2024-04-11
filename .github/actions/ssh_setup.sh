#!/bin/bash
. $GITHUB_WORKSPACE/.env

ssh_path="$HOME/.ssh"

mkdir -p $ssh_path
cp -r $GITHUB_WORKSPACE/.ssh/* $ssh_path
chmod 600 $ssh_path/id_rsa
chmod 600 $ssh_path/config

ssh_config_file="$ssh_path/config"
host_name="$SSH_SERVER_HOST"
hostname=$(grep -A2 "Host $host_name" $ssh_config_file | awk '/HostName/{print $2}')
myport=$(grep -A4 "Host $host_name" $ssh_config_file | awk '/Port/{print $2}')
echo "Host $hostname"
echo "Port $myport"

ssh-keyscan -t rsa -p $myport $hostname >> $ssh_path/known_hosts
