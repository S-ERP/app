./gradlew clean --info --stacktrace         
 export PATH=$PATH:/Applications/CMake.app/Contents/bin/
./gradlew assembleDebug                                 


adb devices
     List of devices attached
    AGT0219828000767        device

    
cd app/build/outputs/apk/debug 
adb install app-debug.apk 




