// Import the functions you need from the SDKs you need
//import messaging from '@react-native-firebase/messaging';
//

import { Notifications } from 'react-native-notifications';
import { Alert, AppState, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, requestNotifications } from 'react-native-permissions'
import DeviceKey from './DeviceKey';
import { SNavigation, SNotification, SThread } from 'servisofts-component';
import notifee, { EventType, AndroidStyle } from '@notifee/react-native';

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


// AppState.addEventListener('change', next => {
//     if (next === 'background' || next === 'inactive') {
//         // Programa la notificación aquí
//         BuildNotification({
//             data: {
//                 title: "Prueba",
//                 body: "Asdasd sadsa d",
//                 // image:""
//             }
//         })
//         // PushNotification.localNotificationSchedule({
//         //     channelId: "default-channel-id",
//         //     message: "Abre el canal de Notifee", // mensaje de la notificación
//         //     date: new Date(Date.now() + 5 * 1000), // notificación después de 5 segundos
//         //     allowWhileIdle: true, // permite que la notificación se envíe mientras el dispositivo está inactivo
//         // });
//     }
// })
class Firebase {

    static async setBadgeCount(n) {
        return await notifee.setBadgeCount(n)
    }
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

            // const unsubscribe = messaging().onMessage(async remoteMessage => {
            //     console.log('Message receivedddd. ', remoteMessage);
            //     // PushNotification.setApplicationIconBadgeNumber(1);
            //     BuildNotification(remoteMessage);
            // });

            // messaging().setBackgroundMessageHandler(async remoteMessage => {
            //     // PushNotification.setApplicationIconBadgeNumber(1);

            //     BuildNotification(remoteMessage)

            // });

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
            // time: Date.now() - 480000,
            pressAction: {
                id: 'default'
            }
        },
    }
    if (notification?.data?.image) {
        notify.android.largeIcon = notification?.data?.image;
        notify.ios.attachments.push({ url: notification?.data?.image });
    }
    // await notifee.displayNotification({
    //     ...notify, android: {

    //     }
    // });
    await notifee.displayNotification(notify);
    notifee
        .incrementBadgeCount()
        .then(() => notifee.getBadgeCount())
        .then(count => console.log('Badge count incremented by 1 to: ', count));
}
export default Firebase;