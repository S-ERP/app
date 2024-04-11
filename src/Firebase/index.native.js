// Import the functions you need from the SDKs you need
//import messaging from '@react-native-firebase/messaging';
//

import { Notifications } from 'react-native-notifications';
import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, requestNotifications } from 'react-native-permissions'
import DeviceKey from './DeviceKey';
import { SNavigation, SNotification, SThread } from 'servisofts-component';
import notifee, { EventType, AndroidStyle } from '@notifee/react-native';

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


class Firebase {

    static async getInitialURL() {

        notifee.getInitialNotification().then(async evt => {
            let remoteMessage = evt.notification;
            console.log("entro aca en el initiall notiffie", remoteMessage);
            if (remoteMessage?.data?.deepLink) {

                Linking.openURL(remoteMessage.data.deepLink)
            }
        })
        // messaging().getInitialNotification().then(async remoteMessage => {
        //     console.log("entro aca en el initiallll", remoteMessage);
        //     if (remoteMessage?.data?.deepLink) {
        //         Linking.openURL(remoteMessage.data.deepLink)
        //     }
        // })

    }
    static async init() {
        try {

            // await sleep(500);
            var authorizationStatus = await requestNotifications(["sound", "provisional", "alert"])
            const authorizationStatusNotify = await messaging().requestPermission();
            // await messaging().registerDeviceForRemoteMessages()
            messaging().getToken().then(fcmToken => {
                if (fcmToken) {
                    console.log(fcmToken)
                    DeviceKey.setKey(fcmToken);
                }
            }).catch(err => {
                console.log(err.message);
            });

            const unsubscribe = messaging().onMessage(async remoteMessage => {
                BuildNotification(remoteMessage);
            });

            messaging().setBackgroundMessageHandler(async remoteMessage => {
                BuildNotification(remoteMessage)
            });

            notifee.registerForegroundService(async ({ type, detail }) => {
                console.log("registerForegroundService", type, detail)
            });
            notifee.onBackgroundEvent(async ({ type, detail }) => {
                const { notification, pressAction } = detail;
                if (type === EventType.PRESS) {
                    handleNavigateDeepLink(Notification)
                }
            });
            notifee.onForegroundEvent(evt => {
                const remoteMessage = evt?.detail?.notification
                if (evt.type == EventType.PRESS) {
                    handleNavigateDeepLink(remoteMessage)
                }

            });
            messaging().onNotificationOpenedApp(remoteMessage => {
                handleNavigateDeepLink(remoteMessage)

            });

        } catch (e) {
            console.error(e)
        }

    }
}

const handleNavigateDeepLink = (notification) => {
    if (notification.data.deepLink) {
        if (SNavigation.INSTANCE) {
            new SThread(500, "hilo_para_navegar").start(() => {
                SNavigation.INSTANCE.openDeepLink(notification.data.deepLink)
            })

        } else {
            Linking.openURL(notification.data.deepLink)
        }
    }
}
const BuildNotification = async (notification) => {
    let notify = {

        title: notification?.data?.title,
        body: notification?.data?.body,
        data: notification?.data,
        ios: {
            attachments: [

            ]
        },
        android: {

            channelId: "default_channel_id",
            // smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
            // largeIcon: notification?.data?.image,

            pressAction: {
                id: 'default'
            }
        },
    }
    if (notification?.data?.image) {
        notify.android.largeIcon = notification?.data?.image;
        notify.ios.attachments.push({ url: notification?.data?.image });
    }
    await notifee.displayNotification(notify);
}
export default Firebase;