import { AppRegistry, LogBox } from "react-native";
import App from "./src/App";
import { name as appName } from "./package.json";



import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidStyle, AndroidGroupAlertBehavior } from '@notifee/react-native';


const BuildNotification = async (notification) => {

    const displayedNotifications = await notifee.getDisplayedNotifications();
    const groupId = notification?.data?.key_empresa;
    const isSummaryAlreadyDisplayed = displayedNotifications.some(notif =>
        notif.android?.groupId === groupId && notif.android?.groupSummary
    );
    Firebase.setBadgeCount(displayedNotifications.length + 1);
    // console.log("ENTRO NCACCAK SCKA CKS ")
    // console.log(displayed)
    if (!isSummaryAlreadyDisplayed) {
        await notifee.displayNotification({
            id: groupId,
            // title: notification?.data?.razon_social,
            subtitle: notification?.data?.razon_social,
            android: {
                channelId: "default_channel_id",
                smallIcon: 'notification_round', // optional, defaults to 'i
                color: "#ffffff",
                groupSummary: true,
                groupId: groupId,
            },
        });
    }


    // return;
    let notify = {
        title: notification?.data?.title,
        subtitle: notification?.data?.razon_social,
        // title: notification?.data?.title,
        body: notification?.data?.body,
        data: notification?.data,
        ios: {
            attachments: [

            ]
        },
        android: {
            channelId: "default_channel_id",
            // groupSummary: true,
            // tag: notification?.data?.key_empresa,
            // category: notification?.data?.key_empresa,
            groupId: groupId,
            smallIcon: 'notification_round', // optional, defaults to 'ic_launcher'.
            color: "#ffffff",
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
const unsubscribe = messaging().onMessage(async remoteMessage => {
    await BuildNotification(remoteMessage);
});


messaging().setBackgroundMessageHandler(async remoteMessage => {
    await BuildNotification(remoteMessage);
});


LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs(['AsyncStorage', 'Animated:', 'VirtualizedList:', 'VirtualizedLists', "Animated.event", "Warning: Each child in a list ", "Invalid", "Require cycle"])
console.disableYellowBox = true;
AppRegistry.registerComponent(appName, () => App);
