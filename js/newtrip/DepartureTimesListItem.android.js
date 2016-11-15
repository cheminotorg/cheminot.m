import DateTime from '../common/DateTime';

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import { MKColor, MKCheckbox } from 'react-native-material-kit';

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
          <Text style={{ color: MKColor.Grey }}>{DateTime.formatMinutes(this.props.departureTime)}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MKCheckbox onCheckedChange={this._onDepartureTimeSelected} checked={this.props.checked} />
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}
