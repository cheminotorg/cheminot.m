import moment from 'moment';

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import { MKColor, MKCheckbox } from 'react-native-material-kit';

function formatMinutes(minutes) {
  const time = moment.duration(minutes, 'minutes');
  return moment.utc(time.asMilliseconds()).format('HH:mm');
}

export default class DeparturesListItem extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDepartureTimeSelected = this._onDepartureTimeSelected.bind(this);
  }

  _onDepartureTimeSelected(e) {
    this.props.onDepartureTimeSelected(e, this.props.departureTime);
  }

  render() {
    return (
      <TouchableNativeFeedback>
        <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: MKColor.Grey }}>{formatMinutes(this.props.departureTime.at)}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MKCheckbox onCheckedChange={this._onDepartureTimeSelected} />
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}
