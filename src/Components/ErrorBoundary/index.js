import React, { Component } from 'react';
import ErrorWindow from './ErrorWindow';
import { Platform, View } from 'react-native';
import { SNavigation } from 'servisofts-component';
import PackageInfo from "../../../package.json"
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    let data = {
      error: {
        message: error.toString(),
        stack: error.stack
      },
      errorInfo: errorInfo,
      app: {
        version: PackageInfo.version,
        platform: Platform.OS,
      }
    }
    const nav = SNavigation.lastRoute;
    if (nav?.route) {
      data.route = {
        name: nav?.route.name,
        params: nav?.route.params
      }
    }
    this.setState({ ...data })
  }

  render() {
    if (this.state.errorInfo) {
      return <View style={{
        width: "100%",
        height: "100%"

      }}>
        <ErrorWindow {...this.state} />
      </View>
    }
    return this.props.children;
  }
}
export default ErrorBoundary;