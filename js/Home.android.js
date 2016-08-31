import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage,
  Switch,
  TouchableOpacity,
} from 'react-native';

import { MKButton, MKColor, getTheme } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import CheminotContext from './layout/ContextContainer';
import WeekCalendar from './WeekCalendar';

const theme = getTheme();

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  addButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    alignItems: 'flex-end',
    padding: 10,
  },
});

class Home extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDeleteTripPressed = this._onDeleteTripPressed.bind(this);
    this._onNewTripPressed = this._onNewTripPressed.bind(this);
  }

  state = {
    currentLocation: null,
    trips: [],
  }

  componentWillReceiveProps() {
    AsyncStorage.getItem('trips').then((json) => {
      if (json) {
        const trips = JSON.parse(json);
        this.setState({ trips });
      }
    });

    navigator.geolocation.getCurrentPosition((location) => {
      this.setState({ currentLocation: location });
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 });
  }

  _onNewTripPressed() {
    this.props.navigation.push('newtrip');
  }

  async _onDeleteTripPressed(id) {
    const updatedTrips = this.state.trips.filter((trip) => trip.id !== id);
    await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
    this.setState({ trips: updatedTrips });
  }

  _renderTrips(trips) {
    return trips.map((trip, index) =>
      <TripCard
        key={`home#trip#${index}`}
        onDeleteTripPressed={this._onDeleteTripPressed}
        trip={trip}
        currentLocation={this.state.currentLocation}
      />
    );
  }

  render() {
    const trips = this.state.trips;
    if (!trips.length) {
      return (
        <View style={styles.container}>
          <Image source={require('./empty.png')} />
          <View style={{}}>
            <NewTripButton onPress={this._onNewTripPressed}>
              <Icon name="add" size={24} color="#FFF" />
            </NewTripButton>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
          {this._renderTrips(trips)}
        </ScrollView>
        <View style={styles.addButton}>
          <NewTripButton onPress={this._onNewTripPressed}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      </View>
    );
  }
}

class TripCard extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDeleteTripPressed = this._onDeleteTripPressed.bind(this);
  }

  _onDeleteTripPressed() {
    this.props.onDeleteTripPressed(this.props.trip.id);
  }

  render() {
    const trip = this.props.trip;
    const stopTimes = trip.stopTimes;
    const stationA = stopTimes[0];
    const stationB = stopTimes[stopTimes.length - 1];

    const options = {
      showsUserLocation: false,
      showsPointsOfInterest: false,
      style: { height: 100 },
      zoomEnabled: false,
      scrollEnabled: false,
      loadingEnabled: true,
      pitchEnabled: false,
      initialRegion: {
        latitude: stationA.lat,
        longitude: stationA.lng,
        latitudeDelta: Math.abs(stationA.lat - stationB.lat),
        longitudeDelta: Math.abs(stationA.lng - stationB.lng),
      },
    };

    const coordinates = stopTimes.map((stopTime) => (
      { latitude: stopTime.lat, longitude: stopTime.lng }
    ));

    const markers = stopTimes.map((stopTime, index) =>
      <MapView.Marker
        key={`tripcard#marker#${index}`}
        coordinate={{ latitude: stopTime.lat, longitude: stopTime.lng }}
        title={stopTime.name}
      />
    );

    return (
      <View style={{ marginBottom: 10 }}>
        <View style={theme.cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Chartres - Paris - 07h58</Text>
            <Switch />
          </View>
          <Text>Durée: 1h08</Text>
          <WeekCalendar />
          <MapView {...options}>
            {markers}
            <MapView.Polyline coordinates={coordinates} />
          </MapView>
          <TouchableOpacity onPress={this._onDeleteTripPressed}>
            <Icon name="delete" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
