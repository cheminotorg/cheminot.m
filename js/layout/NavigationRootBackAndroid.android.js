'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  PropTypes,
  BackAndroid
} from 'react-native';

const {
  Container: NavigationContainer,
  RootContainer: NavigationRootContainer
} = NavigationExperimental;

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
    this.props.onBackButton(this.props.navigationState, this.props.onNavigate);
    let handled = false;
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i]()) {
        handled = true;
        break;
      }
    }
    if(handled) {
      this.props.onNavigate(NavigationRootContainer.getBackAction());
      return true;
    } else {
      return false;
    }
  }

  render() {
    return <View style={styles.container}>{this.props.children}</View>;
  }
}

module.exports = NavigationContainer.create(NavigationRootBackAndroid)
