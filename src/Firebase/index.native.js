// Import the functions you need from the SDKs you need
//import messaging from '@react-native-firebase/messaging';
//

import { Notifications } from 'react-native-notifications';
import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, requestNotifications } from 'react-native-permissions'
import DeviceKey from './DeviceKey';
import { SNavigation, SNotification, SThread } from 'servisofts-component';
import notifee from '@notifee/react-native';
const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


class Firebase {

    static async getInitialURL() {
        // await messaging().getToken();
        // messaging().getInitialNotification()
        notifee.getInitialNotification().then(async remoteMessage => {
            console.log("entro aca en el initiallll", remoteMessage);
            if (remoteMessage?.data?.deepLink) {
                Linking.openURL(remoteMessage.data.deepLink)
                // SNavigation.goBack();
            }
        })

    }
    static async init() {
        try {
            // messaging().setBackgroundMessageHandler(async remoteMessage => {
            notifee.onBackgroundEvent(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
                // Notifications.postLocalNotification(remoteMessage.notification)

                // showLocalNotification(remoteMessage);
            });


            await sleep(500);


            var authorizationStatus = await requestNotifications(["sound", "provisional", "alert"])


            messaging().getToken().then(fcmToken => {
                if (fcmToken) {
                    console.log(fcmToken)
                    DeviceKey.setKey(fcmToken);
                }
            }).catch(err => {
                console.log(err.message);
            });

            const unsubscribe = messaging().onMessage(async remoteMessage => {
                console.log('Message received. ', remoteMessage);
                // const channelId = await notifee.createChannel({
                //     id: 'default',
                //     name: 'Default Channel',
                // });

                // Display a notification
                // await notifee.displayNotification({
                //     title: 'Notification Title',
                //     body: 'Main body content of the notification',
                //     android: {
                //         channelId,
                //         smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
                //         // pressAction is needed if you want the notification to open the app when pressed
                //         pressAction: {
                //             id: 'default',
                //         },
                //     },
                // });

                SNotification.send({
                    title: remoteMessage?.notification?.title,
                    body: remoteMessage?.notification?.body,
                    image: Platform.select({
                        "android": remoteMessage?.notification?.android?.imageUrl,
                        "ios": remoteMessage?.data?.fcm_options?.image,
                        "default": remoteMessage?.data?.fcm_options?.image,
                        
                    }),
                    deeplink: remoteMessage.data.deepLink
                })

            });

            // Notification tap
            messaging().onNotificationOpenedApp(remoteMessage => {
                console.log('Notification caused app to open from background state:', remoteMessage);
                if (remoteMessage.data.deepLink) Linking.openURL(remoteMessage.data.deepLink)
                // SNavigation.goBack();
            });


        } catch (e) {
            console.error(e)
        }

    }
}
export default Firebase;