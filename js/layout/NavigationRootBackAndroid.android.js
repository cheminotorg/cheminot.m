'use strict';

import React, { Component, PropTypes } from 'react';
import {
  NavigationExperimental,
  StyleSheet,
  View,
  BackAndroid
} from 'react-native';

import NavigationBackAndroidContainer from './NavigationBackAndroidContainer';
import NavigationContainer from './NavigationContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

class NavigationRootBackAndroid extends Component {

  _handlers = [];

  static childContextTypes = {
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func,
    triggerBackButton: PropTypes.func
  };

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButton.bind(this));
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this._handleBackButton.bind(this));
  }

  getChildContext() {
    return {
      addBackButtonListener: this._addBackButtonListener.bind(this),
      removeBackButtonListener: this._removeBackButtonListener.bind(this),
      triggerBackButton: this._handleBackButton.bind(this)
    };
  }

  _addBackButtonListener(listener) {
    this._handlers.push(listener);
  }

  _(listener) {
    this._handlers.push(listener);
  }

  _removeBackButtonListener(listener) {
    this._handlers = this._handlers.filter((handler) => handler !== listener);
  }

  _handleBackButton() {
    this.props.onBackButton(this.props.navigationState);
    let handled = NavigationBackAndroidContainer.result.DEFAULT;
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      const result = this._handlers[i]();
      if (result) {
        handled = result;
        break;
      }
    }
    if(handled) {
      if(handled === NavigationBackAndroidContainer.result.DEFAULT) {
        this.props.onNavigate({ type: 'BackAction' });
        return true;
      } else if(handled === NavigationBackAndroidContainer.result.DISMISS) {
        return true;
      }
    }
    return false;
  }

  render() {
    return <View style={styles.container}>{this.props.children}</View>;
  }
}

module.exports = NavigationContainer.create(NavigationRootBackAndroid)
