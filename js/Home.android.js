'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  ScrollView,
  MapView,
  StyleSheet,
  View,
  Image,
  Text
} from 'react-native';

import { MKButton, MKColor, getTheme } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from './layout/ContextContainer';

const theme = getTheme();

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    flexDirection: 'column',
    alignItems: 'center'
  }
});

class Home extends Component {

  _onNewTripPressed() {
    this.props.navigation.push();
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
          <TripCard />
          <TripCard />
        </ScrollView>
      </View>
    );
  }
}

class TripCard extends Component {

  render() {
    return (
      <View style={{marginBottom: 10}}>
        <View style={theme.cardStyle}>
          <Text style={{}}>Chartres - Paris</Text>
          <Text style={{}}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris sagittis pellentesque lacus eleifend lacinia...
          </Text>
          <MapView
             style={{height: 200, margin: 40}}
             showsUserLocation={true}
             />
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
