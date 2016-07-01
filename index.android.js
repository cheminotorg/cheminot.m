'use strict';

import React, { Component } from 'react';

import {
  AppRegistry,
  NavigationExperimental,
  StyleSheet,
  Text,
  View,
  StatusBar,
  PropTypes
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import DrawerLayout from './js/layout/DrawerLayout';
import NavigationAnimatedView from './js/layout/NavigationAnimatedView';
import NavigationRootBackAndroid from './js/layout/NavigationRootBackAndroid';
import Home from './js/Home';
import Trips from './js/Trips';
import NewTrip from './js/NewTrip';
import Locale from './js/locale';

Locale.init();

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils
} = NavigationExperimental;

const styles = StyleSheet.create({
  scrollView: {
    marginTop: NavigationHeader.HEIGHT
  }
});

class cheminotm extends Component {

  render() {
    return <View></View>;
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
