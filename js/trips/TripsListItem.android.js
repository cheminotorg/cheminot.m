import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import moment from 'moment';
import { MKColor, MKCheckbox } from 'react-native-material-kit';

const styles = StyleSheet.create({
  item: {
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

function formatTime(date) {
  return moment(date).format('HH:mm');
}

export default class TripsListItem extends Component {

  constructor(props, context) {
    super(props, context);
    this._onTripSelected = this._onTripSelected.bind(this);
  }

  _onTripSelected(e) {
    this.props.onTripSelected(e, this.props.trip.id);
  }

  render() {
    const trip = this.props.trip;
    const stopTimeA = trip.stopTimes[0];
    const stopTimeB = trip.stopTimes[trip.stopTimes.length - 1];
    const departureTime = formatTime(stopTimeA.departure);
    const arrivalTime = formatTime(stopTimeB.arrival);
    const steps = trip.stopTimes.length;

    return (
      <TouchableNativeFeedback>
        <View style={styles.item}>
          <View style={{ width: 40, height: 40, padding: 0, backgroundColor: MKColor.Grey, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 12 }}>1h09</Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text>{departureTime} → {arrivalTime}</Text>
            <Text>{steps} arrêts</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MKCheckbox onCheckedChange={this._onTripSelected} />
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}
