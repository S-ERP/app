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
                console.log('Message received. ', remoteMessage);
                BuildNotification(remoteMessage);
            });

            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
                BuildNotification(remoteMessage)
            });

            notifee.registerForegroundService(async ({ type, detail }) => {
                console.log("registerForegroundService", type, detail)
            });
            notifee.onBackgroundEvent(async ({ type, detail }) => {
                const { notification, pressAction } = detail;
                console.log('Notification caused app to open onBackgroundEvent:', type, notification);
                if (type === EventType.PRESS) {
                    if (notification?.data?.deepLink) {
                        if (SNavigation.INSTANCE) {
                            new SThread(1000, "hilo_para_navegar").start(() => {
                                SNavigation.INSTANCE.openDeepLink(notification.data.deepLink)
                            })

                        } else {
                            Linking.openURL(notification.data.deepLink)
                        }
                    }
                }
            });
            notifee.onForegroundEvent(evt => {
                const remoteMessage = evt?.detail?.notification
                console.log('Notification caused app to open onForegroundEvent:', remoteMessage);
                if (evt.type == EventType.PRESS) {
                    if (remoteMessage.data.deepLink) {
                        if (SNavigation.INSTANCE) {
                            new SThread(1000, "hilo_para_navegar").start(() => {
                                SNavigation.INSTANCE.openDeepLink(remoteMessage.data.deepLink)
                            })

                        } else {
                            Linking.openURL(remoteMessage.data.deepLink)
                        }
                    }
                }

            });
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
const BuildNotification = async (notification) => {
    // if(Platform.OS){
    //     SNotification.send({
    //         title: remoteMessage?.data?.title,
    //         body: remoteMessage?.data?.body,
    //         image: Platform.select({
    //             "android": remoteMessage?.data?.image,
    //             "ios": remoteMessage?.data?.fcm_options?.image,
    //             "default": remoteMessage?.data?.fcm_options?.image,

    //         }),
    //         deeplink: remoteMessage.data.deepLink
    //     })
    // }
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