import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class StationsListItem extends Component {

  constructor(props, context) {
    super(props, context);
    this._onItemSelected = this._onItemSelected.bind(this);
  }

  _onItemSelected() {
    this.props.onItemSelected(this.props.id, this.props.name);
  }

  render() {
    return (
      <TouchableNativeFeedback onPress={this._onItemSelected}>
        <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="location-on" size={24} color={MKColor.Grey} />
          <Text style={{ color: MKColor.Grey }}>{this.props.name}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
};
