import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableNativeFeedback,
  AsyncStorage,
} from 'react-native';

import moment from 'moment';
import { MKColor, MKCheckbox, MKSpinner } from 'react-native-material-kit';
import CheminotContext from './layout/ContextContainer';
import HeaderDoneButton from './layout/HeaderDoneButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tripItem: {
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

function fetchTrips(url) {
  if (url) {
    return fetch(url).then((response) => response.json());
  } else {
    const endpoint = 'http://10.0.3.2:8080/api';
    const at = (new Date()).toISOString();
    const params = { vs: '8739400', ve: '8739100', at, limit: 10 };
    const qs = Object.keys(params).reduce((acc, key) => {
      const newparam = `${key}=${params[key]}`;
      return acc ? `${acc}&${newparam}` : newparam;
    }, '');
    return fetch(`${endpoint}/trips/search.json?${qs}`).then((response) => response.json());
  }
}

class Trips extends Component {

  constructor(props, context) {
    super(props, context);

    this._onTripSelected = this._onTripSelected.bind(this);
    this._onEndReached = this._onEndReached.bind(this);
    this._onDonePressed = this._onDonePressed.bind(this);
  }

  state = {
    trips: [],
    isLoading: false,
    nextUrl: null,
    selected: [],
  }

  componentDidMount() {
    this._onEndReached();
  }

  _onTripSelected(e, id) {
    const selected = e.checked ? this.state.selected.concat(id) : this.state.selected.filter((s) => s !== id);
    this.setState({ selected });
    if (selected.length > 0) {
      this.props.header.set({
        title: `${selected.length} trajet sélectionné`,
        left: <HeaderDoneButton onPress={this._onDonePressed} />,
      });
    } else {
      this.props.header.reset();
    }
  }

  async _onEndReached() {
    if (!this.state.isLoading) {
      this.setState({ isLoading: true });
      const response = await fetchTrips(this.state.nextUrl);
      this.setState({
        isLoading: false,
        trips: this.state.trips.concat(response.results),
        nextUrl: response.next,
      });
    }
  }

  async _onDonePressed() {
    const selectedTrips = this.state.trips.filter((trip) =>
      this.state.selected.some((id) => trip.id === id)
    );
    await AsyncStorage.setItem('trips', JSON.stringify([]));
    const trips = JSON.parse(await AsyncStorage.getItem('trips'));
    await AsyncStorage.setItem('trips', JSON.stringify(trips.concat(selectedTrips)));
    this.props.navigation.rewind('home');
  }

  render() {
    return (
      <View style={styles.container}>
        <TripsList
          isLoading={this.state.isLoading}
          onEndReached={this._onEndReached}
          onTripSelected={this._onTripSelected}
          trips={this.state.trips || []}
        />
      </View>
    );
  }
}

class TripsListItem extends Component {

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
        <View style={styles.tripItem}>
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

class TripsList extends Component {

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
        <View style={[styles.tripItem, { flexDirection: 'column' }]}>
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

module.exports = CheminotContext.create(Trips);
