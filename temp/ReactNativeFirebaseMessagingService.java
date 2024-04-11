package io.invertase.firebase.messaging;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;

public class ReactNativeFirebaseMessagingService extends FirebaseMessagingService {
  @Override
  public void onSendError(String messageId, Exception sendError) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(
        ReactNativeFirebaseMessagingSerializer.messageSendErrorToEvent(messageId, sendError));
  }

  @Override
  public void onDeletedMessages() {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messagesDeletedToEvent());
  }

  @Override
  public void onMessageSent(String messageId) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messageSentToEvent(messageId));
  }

  @Override
  public void onNewToken(String token) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.newTokenToTokenEvent(token));
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
//    Log.d("DeepLink", "Deep link received: onMessageReceived" + remoteMessage.getData().toString());
//    if (remoteMessage.getData().size() > 0) {
//      // Construye la notificación
//      NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
//
//      // Para Android Oreo y superior, necesitas configurar un canal de notificación
//      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//        NotificationChannel channel = new NotificationChannel("mi_canal",
//          "Mi Canal",
//          NotificationManager.IMPORTANCE_HIGH);
//        notificationManager.createNotificationChannel(channel);
//      }
//
//      Intent intent = new Intent("android.intent.action.VIEW");
//      intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
//      intent.setData(Uri.parse(remoteMessage.getData().get("deepLink")));
////      remoteMessage.getData().get("deepLink");
//
////      intent.putExtra("deepLink",remoteMessage.getData().get("deepLink"));
////      intent.putExtra("country", country);
//      @SuppressLint("UnspecifiedImmutableFlag")
//      PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
//        intent, PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
//
//      NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, "mi_canal")
//        .setSmallIcon(R.drawable.common_google_signin_btn_icon_dark)
//        .setContentTitle("Título de la notificación")
//        .setContentText("Cuerpo de la notificación")
//        .setAutoCancel(true)
//        .setContentIntent(pendingIntent);
//
//      // Muestra la notificación
//      notificationManager.notify(0, notificationBuilder.build());
//    }
    // noop - handled in receiver
  }
}
