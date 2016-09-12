import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import { MKColor, MKCheckbox } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class DeparturesListItem extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDepartureTimeSelected = this._onDepartureTimeSelected.bind(this);
  }

  _onDepartureTimeSelected() {
    this.props.onDepartureTimeSelected(this.props.departure);
  }

  render() {
    return (
      <TouchableNativeFeedback>
        <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: MKColor.Grey }}>{this.props.departure}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MKCheckbox onCheckedChange={this._onDepartureTimeSelected} />
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}
