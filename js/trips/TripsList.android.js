import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ListView,
  RecyclerViewBackedScrollView,
} from 'react-native';

import { MKColor, MKSpinner } from 'react-native-material-kit';
import TripsListItem from './TripsListItem';

const styles = StyleSheet.create({
  loader: {
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default class TripsList extends Component {

  constructor(props, context) {
    super(props, context);

    this._renderRow = this._renderRow.bind(this);
    this._renderFooter = this._renderFooter.bind(this);
    this._renderSeparator = this._renderSeparator.bind(this);
    this._renderScrollComponent = this._renderScrollComponent.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (trip1, trip2) => trip1.id !== trip2.id,
    });

    this.state = {
      dataSource: ds.cloneWithRows(props.trips),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.trips),
    });
  }

  _renderRow(trip) {
    return <TripsListItem onTripSelected={this.props.onTripSelected} trip={trip} />;
  }

  _renderFooter() {
    if (this.props.isLoading) {
      return (
        <View style={[styles.loader, { flexDirection: 'column' }]}>
          <MKSpinner />
        </View>
      );
    } else {
      return null;
    }
  }

  _renderSeparator(sectionID, rowID) {
    return <View key={`${sectionID}-${rowID}`} style={{ backgroundColor: MKColor.Grey, height: 1 }} />;
  }

  _renderScrollComponent(props) {
    return <RecyclerViewBackedScrollView {...props} />;
  }

  render() {
    return (
      <ListView
        enableEmptySections
        renderFooter={this._renderFooter}
        dataSource={this.state.dataSource}
        automaticallyAdjustContentInsets
        renderRow={this._renderRow}
        renderScrollComponent={this._renderScrollComponent}
        renderSeparator={this._renderSeparator}
        onEndReachedThreshold={80}
        {...this.props}
      />
    );
  }
}
