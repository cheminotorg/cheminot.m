'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage,
  Switch,
  TouchableOpacity
} from 'react-native';

import { MKButton, MKColor, getTheme } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from './layout/ContextContainer';
import MapView from 'react-native-maps';
import WeekCalendar from './WeekCalendar'

const theme = getTheme();

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  addButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    alignItems: 'flex-end',
    padding: 10
  }
});

class Home extends Component {

  state = {
    currentLocation: null,
    trips: []
  }

  componentWillReceiveProps() {
    AsyncStorage.getItem('trips').then((json) => {
      if(json) {
        const trips = JSON.parse(json);
        this.setState({trips: trips});
      }
    });

    navigator.geolocation.getCurrentPosition((location) => {
      this.setState({currentLocation: location});
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 });
  }

  _onNewTripPressed() {
    this.props.navigation.push();
  }

  async _onDeleteTripPressed(id) {
    const updatedTrips = this.state.trips.filter((trip) => trip.id != id);
    await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
    this.setState({trips: updatedTrips});
  }

  renderTrips() {
    return this.state.trips.map((trip, index) =>
      <TripCard key={`home#trip#${index}`}
                onDeleteTripPressed={this._onDeleteTripPressed.bind(this)}
                trip={trip}
                currentLocation={this.state.currentLocation} />
    );
  }

  render() {
    if(!this.state.trips.length) {
      return (
        <View style={styles.container}>
          <Image source={require('./empty.png')} />
          <View style={{}}>
          <NewTripButton onPress={this._onNewTripPressed.bind(this)}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <ScrollView style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
            {this.renderTrips()}
          </ScrollView>
          <View style={styles.addButton}>
            <NewTripButton onPress={this._onNewTripPressed.bind(this)}>
              <Icon name="add" size={24} color="#FFF" />
            </NewTripButton>
          </View>
        </View>
      );
    }
  }
}

class TripCard extends Component {

  render() {
    const stopTimes = this.props.trip.stopTimes;
    const stationA = stopTimes[0];
    const stationB = stopTimes[stopTimes.length - 1];

    const options = {
      showsUserLocation: false,
      showsPointsOfInterest: false,
      style: {height: 100},
      zoomEnabled: false,
      scrollEnabled: false,
      loadingEnabled: true,
      pitchEnabled: false,
      initialRegion: {
        latitude: stationA.lat,
        longitude: stationA.lng,
        latitudeDelta: Math.abs(stationA.lat - stationB.lat),
        longitudeDelta: Math.abs(stationA.lng - stationB.lng)
      }
    };

    return (
      <View style={{marginBottom: 10}}>
        <View style={theme.cardStyle}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text>Chartres - Paris - 07h58</Text>
            <Switch />
          </View>
          <Text>Durée: 1h08</Text>
          <WeekCalendar />
          <MapView {...options}>
            {
              this.props.trip.stopTimes.map((stopTime, index) =>
                <MapView.Marker
                  key={`tripcard#marker#${index}`}
                  coordinate={{latitude: stopTime.lat, longitude: stopTime.lng}}
                  title={stopTime.name}
                />
              )
            }
            <MapView.Polyline
              coordinates={this.props.trip.stopTimes.map((stopTime) => {
                return {latitude: stopTime.lat, longitude: stopTime.lng};
              })} />
          </MapView>
          <TouchableOpacity onPress={() => this.props.onDeleteTripPressed(this.props.trip.id) }>
            <Icon name="delete" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
