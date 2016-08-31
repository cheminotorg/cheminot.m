import React, { Component } from 'react';

import {
  View,
  ListView,
  RecyclerViewBackedScrollView,
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import StationsListItem from './StationsListItem';

export default class StationsList extends Component {

  constructor(props, context) {
    super(props, context);

    this._renderRow = this._renderRow.bind(this);
    this._renderScrollComponent = this._renderScrollComponent.bind(this);
    this._renderSeparator = this._renderSeparator.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (station1, station2) => station1.id !== station2.id,
    });

    this.state = {
      dataSource: ds.cloneWithRows(props.stations),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.stations),
    });
  }

  _renderRow({ id, name }) {
    return <StationsListItem onItemSelected={this.props.onItemSelected} id={id} name={name} />;
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
