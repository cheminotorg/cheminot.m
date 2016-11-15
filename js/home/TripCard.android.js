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
import DateTime from '../common/DateTime';

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
    const departureTime = stopTimes[0].departure;
    const vs = stopTimes.find((s) => s.id === this.props.vs);
    const ve = stopTimes.find((s) => s.id === this.props.ve);

    return (
      <View style={{ marginBottom: 10 }}>
        <View style={theme.cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>{vs.name} - {ve.name} - {DateTime.formatMinutes(departureTime)} {this.props.availableToday ? 'ON' : 'OFF'}</Text>
            <TouchableOpacity>
              <Icon name="more-vert" size={24} />
            </TouchableOpacity>
          </View>
          <Text>Durée: 1h08</Text>
          <TouchableOpacity onPress={this._onDeleteTripPressed}>
            <Icon name="delete" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
