package com.servisofts_erp_app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {


  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule
   * rendering of the component.
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Otros códigos de inicialización...

    Intent intent = getIntent();
    if (intent != null) {
      Uri data = intent.getData();
      if (data != null) {
        Log.d("DeepLink", "Deep link received: " + data.toString());
        // Aquí puedes manejar el deep link como necesites
      }
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    // Maneja el nuevo intent aquí, similar a cómo lo harías en onCreate
    Uri data = intent.getData();
    if (data != null) {
      // Extrae y usa los datos del enlace profundo
      String pk = data.getQueryParameter("pk");
      // Navega a la sección correspondiente de tu aplicación
    }
  }

  // @Override
  // protected void onCreate(Bundle savedInstanceState) {
  // super.onCreate(null);
  // }

  @Override
  protected String getMainComponentName() {
    return "servisofts_erp_app";
  }

  // Esto lo agrege por que el backgroun location tiraba cuando lo cerraba
  public static int cant = 0;

  @Override
  protected void onResume() {
    super.onResume();
    if (cant > 1) {
      cant = 0;
    } else {
      if (cant > 0) {
        this.recreate();
      }
    }

  }

  @Override
  protected void onStop() {
    super.onStop();
  }

  @Override
  protected void onDestroy() {
    cant += 1;
    super.onDestroy();
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util
   * class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and
   * Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e.
        // React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
    );
  }
}
