#!/bin/bash
. $GITHUB_WORKSPACE/.env

xcrun altool --validate-app -f $RUNNER_TEMP/export/$IOS_PACKAGE_NAME.ipa \
    -t ios \
    --apiKey $IOS_APPSTORE_API_KEY_ID \
    --apiIssuer $IOS_APPSTORE_ISSUER_ID

xcrun altool --upload-app -f $RUNNER_TEMP/export/$IOS_PACKAGE_NAME.ipa \
    -t ios \
    --apiKey $IOS_APPSTORE_API_KEY_ID \
    --apiIssuer $IOS_APPSTORE_ISSUER_ID
