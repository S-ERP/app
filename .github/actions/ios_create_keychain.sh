#!/bin/bash

. $GITHUB_WORKSPACE/.env

KEYCHAIN_PATH=$RUNNER_TEMP/app-signing.keychain-db

security create-keychain -p "$IOS_KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
security unlock-keychain -p "$IOS_KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

security import ./ios/Certificates.p12 -P "$IOS_P12_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH

security list-keychain -d user -s $KEYCHAIN_PATH

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp ./ios/$IOS_PROFILE_NAME.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy file."
    exit 1
fi
# cd ~/Library/MobileDevice/Provisioning\ Profiles && ls

mkdir -p ~/private_keys
cp ./ios/AuthKey_$IOS_APPSTORE_API_KEY_ID.p8 ~/private_keys/AuthKey_$IOS_APPSTORE_API_KEY_ID.p8

if [ $? -ne 0 ]; then
    echo "Error: Failed to copy file."
    exit 1
fi
