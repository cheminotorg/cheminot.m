'use strict';

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';

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

export default class HeaderButton extends React.Component {

  render() {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={this.props.onPress}>
        <View style={styles.button}>
          {this.props.children}
        </View>
      </TouchableOpacity>
    );
  }
}
