import React, { Component } from 'react';

import {
  View,
  ListView,
  RecyclerViewBackedScrollView,
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import DeparturesListItem from './DepartureTimesListItem';

export default class DeparturesList extends Component {

  constructor(props, context) {
    super(props, context);
    this._renderRow = this._renderRow.bind(this);
    this._renderScrollComponent = this._renderScrollComponent.bind(this);
    this._renderSeparator = this._renderSeparator.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (departure1, departure2) => departure1 !== departure2,
    });

    this.state = {
      dataSource: ds.cloneWithRows(props.departureTimes),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.departureTimes),
    });
  }

  _renderRow(departureTime) {
    return <DeparturesListItem onDepartureTimeSelected={this.props.onDepartureTimeSelected} departureTime={departureTime} />;
  }

  _renderScrollComponent(props) {
    return <RecyclerViewBackedScrollView keyboardShouldPersistTaps {...props} />;
  }

  _renderSeparator(sectionID, rowID) {
    return <View key={`${sectionID}-${rowID}`} style={{ backgroundColor: MKColor.Grey, height: 1 }} />;
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections
        renderRow={this._renderRow}
        renderScrollComponent={this._renderScrollComponent}
        renderSeparator={this._renderSeparator}
        {...this.props}
      />
    );
  }
}
