'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  StyleSheet,
  View,
  Image
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from './layout/ContextContainer';

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column'
  }
});

class Home extends Component {

  _onNewTripPress() {
    this.props.navigation.push();
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={require('./empty.png')} />
        <View>
          <NewTripButton onPress={this._onNewTripPress.bind(this)}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
