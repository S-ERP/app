#!/bin/bash
. $GITHUB_WORKSPACE/.env
cd ios
/Applications/Xcode_14.2.app/Contents/Developer/usr/bin/xcodebuild \
    -workspace $IOS_PACKAGE_NAME.xcworkspace \
    -scheme $IOS_PACKAGE_NAME \
    clean archive \
    -archivePath "Actions" \
    -configuration "Release"
