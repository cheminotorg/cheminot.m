'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage
} from 'react-native';

import { MKButton, MKColor, getTheme } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from './layout/ContextContainer';
import MapView from 'react-native-maps';

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

  state = {
    currentLocation: null,
    trips: []
  }

  componentDidMount() {
    AsyncStorage.getItem('trips').then((json) => {
      if(json) {
        const trips = JSON.parse(json);
        this.setState({trips: trips});
      } else {
        alert('not found');
      }
    }).catch((e) => {
      console.log(e);
    });

    navigator.geolocation.getCurrentPosition((location) => {
      this.setState({currentLocation: location});
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 });
  }

  _onNewTripPressed() {
    this.props.navigation.push();
  }

  render() {
    if(!this.state.trips.length) {
      return (
        <View style={styles.container}>
          <Image source={require('./empty.png')} />
          <NewTripButton onPress={this._onNewTripPressed.bind(this)}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <ScrollView style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
            <TripCard currentLocation={this.state.currentLocation} />
            <TripCard currentLocation={this.state.currentLocation} />
          </ScrollView>
          <NewTripButton onPress={this._onNewTripPressed.bind(this)}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      );
    }
  }
}

class TripCard extends Component {

  render() {
    let options = {
      showsUserLocation: false,
      showsPointsOfInterest: false,
      style: {height: 100},
      zoomEnabled: false,
      scrollEnabled: false,
      loadingEnabled: true,
      pitchEnabled: false
    };

    if(this.props.currentLocation) {
      options = Object.assign(options, {
        initialRegion: {
          latitude: this.props.currentLocation.coords.latitude,
          longitude: this.props.currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        },
        loadingEnabled: false
      });
    }

    return (
      <View style={{marginBottom: 10}}>
        <View style={theme.cardStyle}>
          <Text>Chartres - Paris</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris sagittis pellentesque lacus eleifend lacinia...
          </Text>
          <MapView {...options} />
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
