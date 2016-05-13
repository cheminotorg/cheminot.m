'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  PropTypes,
  BackAndroid
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default class NavigationRootBackAndroid extends Component {

  _handlers = [];

  static childContextTypes = {
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func
  };

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButton.bind(this));
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this._handleBackButton.bind(this));
  }

  getChildContext() {
    return {
      addBackButtonListener: this._addBackButtonListener,
      removeBackButtonListener: this._removeBackButtonListener,
    };
  }

  _addBackButtonListener(listener) {
    this._handlers.push(listener);
  }

  _removeBackButtonListener(listener) {
    this._handlers = this._handlers.filter((handler) => handler !== listener);
  }

  _handleBackButton() {
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i]()) {
        return true;
      }
    }
    return false;
  }

  render() {
    return <View style={styles.container}>{this.props.children}</View>;
  }
}
