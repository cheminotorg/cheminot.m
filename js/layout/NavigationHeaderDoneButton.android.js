'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import DrawerContainer from './DrawerContainer';
import NavigationBackAndroidContainer from './NavigationBackAndroidContainer';
import NavigationContainer from './NavigationContainer';

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 24,
    width: 24,
    margin: Platform.OS === 'ios' ? 10 : 16,
    resizeMode: 'contain'
  }
});

class NavigationHeaderDoneButton extends Component {

  render() {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={this.props.onPress}>
        <View style={styles.button}>
          <Icon name="done" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }
}

module.exports = NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(NavigationHeaderDoneButton)));
