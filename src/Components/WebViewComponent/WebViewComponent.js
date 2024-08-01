// WebViewComponent.js
import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { captureRef } from 'react-native-view-shot';
import { View, StyleSheet } from 'react-native';

const WebViewComponent = ({ url, onCapture }) => {
  const webViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (webViewRef.current) {
        captureRef(webViewRef.current, {
          format: 'png',
          quality: 1,
        }).then(uri => {
          onCapture(uri);
        });
      }
    }, 1000); // Captura cada segundo

    return () => clearInterval(interval);
  }, [onCapture]);

  return (
    <View style={styles.webViewContainer} ref={webViewRef}>
      <WebView source={{ uri: url }} style={styles.webView} />
    </View>
  );
};

const styles = StyleSheet.create({
  webViewContainer: {
    width: 300,
    height: 200,
    position: 'absolute',
    top: -1000, // Oculta el WebView fuera de la pantalla
    left: -1000,
  },
  webView: {
    flex: 1,
  },
});

export default WebViewComponent;
