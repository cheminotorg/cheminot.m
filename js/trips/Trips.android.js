import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import CheminotContext from '../layout/ContextContainer';
import HeaderDoneButton from '../layout/HeaderDoneButton';
import TripsList from './TripsList';
import Storage from '../common/Storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

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

  shouldComponentUpdate(nextProps) {
    return this.props.navigation.isAt(nextProps, 'trips');
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
    const trips = await Storage.getItem('trips');
    await Storage.setItem('trips', trips.concat(selectedTrips));
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

module.exports = CheminotContext.create(Trips);
