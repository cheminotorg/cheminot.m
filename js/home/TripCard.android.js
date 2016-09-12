import React, { Component } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';

import { getTheme } from 'react-native-material-kit';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WeekCalendar from '../common/WeekCalendar';

const theme = getTheme();

export default class TripCard extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDeleteTripPressed = this._onDeleteTripPressed.bind(this);
    this._onWeekItemPressed = this._onWeekItemPressed.bind(this);
  }

  _onDeleteTripPressed() {
    this.props.onDeleteTripPressed(this.props.trip.id);
  }

  _onWeekItemPressed(day) {
    console.log(day);
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
          <WeekCalendar
            onPress={this._onWeekItemPressed}
            days={{ monday: true, wednesday: true }}
          />
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
