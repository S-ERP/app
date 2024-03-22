// Import the functions you need from the SDKs you need
//import messaging from '@react-native-firebase/messaging';
//
import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
// import { Notifications, } from 'react-native-notifications';
import { PERMISSIONS, request, requestNotifications } from 'react-native-permissions'
import DeviceKey from './DeviceKey';
import { SNotification } from 'servisofts-component';

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


class Firebase {
    static async getInitialURL() {
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                console.log("entro aca en el initiallll", remoteMessage);
                if (remoteMessage?.data?.deepLink) Linking.openURL(remoteMessage.data.deepLink)
            })
        // Notifications.getInitialNotification().then(notification => {
        //     if (!notification) return;
        //     const { deepLink = null } = notification?.payload || {};
        //     if (deepLink) Linking.openURL(deepLink);

        // })
    }
    static async init() {
        try {


            await sleep(500);


            // request(PERMISSIONS.ANDROID.)
            // await messaging().hasPermission();
            var authorizationStatus = await requestNotifications(["sound", "provisional", "alert"])
            console.log(authorizationStatus);
            // var authorizationStatus = await messaging().requestPermission({
            //     sound: true,
            //     announcement: true,
            //     providesAppNotificationSettings: true,
            // });
            // if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
            //     console.log('User has notification permissions enabled.');
            // } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            //     console.log('User has provisional notification permissions.');
            // } else {
            //     console.log('User has notification permissions disabled');
            // }
            // await messaging().setAutoInitEnabled(true);
            messaging().getToken().then(fcmToken => {
                if (fcmToken) {
                    console.log(fcmToken)
                    DeviceKey.setKey(fcmToken);
                }
            }).catch(err => {
                console.log(err.message);
            });
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
                // if (remoteMessage.data.deepLink) Linking.openURL(remoteMessage.data.deepLink)
            });

            const unsubscribe = messaging().onMessage(async remoteMessage => {
                console.log('Message received. ', remoteMessage);
                SNotification.send({
                    title: remoteMessage?.notification?.title,
                    body: remoteMessage?.notification?.body,
                    image: Platform.select({
                        "android": remoteMessage?.notification?.android?.imageUrl,
                        "ios": remoteMessage?.data?.fcm_options?.image,
                        "default": remoteMessage?.data?.fcm_options?.image,
                    })
                })
                // if (remoteMessage.data.deepLink) Linking.openURL(remoteMessage.data.deepLink)
            });

            // Notification tap
            messaging().onNotificationOpenedApp(remoteMessage => {
                console.log('Notification caused app to open from background state:', remoteMessage);
                if (remoteMessage.data.deepLink) Linking.openURL(remoteMessage.data.deepLink)
            });


        } catch (e) {
            console.log(e)
        }

    }
}
export default Firebase;