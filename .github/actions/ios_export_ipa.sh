#!/bin/bash
. $GITHUB_WORKSPACE/.env
xcodebuild -exportArchive \
    -archivePath $GITHUB_WORKSPACE/ios/Actions.xcarchive \
    -exportOptionsPlist $GITHUB_WORKSPACE/ios/ExportOptions.plist \
    -exportPath $RUNNER_TEMP/export \
    -allowProvisioningUpdates
