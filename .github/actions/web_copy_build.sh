#!/bin/bash
. $GITHUB_WORKSPACE/.env

scp -r ./build $SSH_SERVER_HOST:$SERVER_BUILD_PATH
