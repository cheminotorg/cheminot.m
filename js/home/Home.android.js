import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from '../layout/ContextContainer';
import TripCard from './TripCard';
import Storage from '../common/Storage';

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  addButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    alignItems: 'flex-end',
    padding: 10,
  },
});

class Home extends Component {

  constructor(props, context) {
    super(props, context);
    this._onDeleteTripPressed = this._onDeleteTripPressed.bind(this);
    this._onNewTripPressed = this._onNewTripPressed.bind(this);
  }

  state = {
    currentLocation: null,
    trips: [],
  }

  componentWillReceiveProps() {
    Storage.getItem('trips').then((trips) => (
      this.setState({ trips })
    ));

    navigator.geolocation.getCurrentPosition((location) => {
      this.setState({ currentLocation: location });
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.navigation.isAt(nextProps, 'home');
  }

  _onNewTripPressed() {
    this.props.navigation.push('newtrip');
  }

  async _onDeleteTripPressed(id) {
    const updatedTrips = this.state.trips.filter((trip) => trip.id !== id);
    await Storage.setItem('trips', updatedTrips);
    this.setState({ trips: updatedTrips });
  }

  _renderTrips(trips) {
    return trips.map((trip, index) =>
      <TripCard
        key={`home#trip#${index}`}
        onDeleteTripPressed={this._onDeleteTripPressed}
        trip={trip}
        currentLocation={this.state.currentLocation}
      />
    );
  }

  render() {
    const trips = this.state.trips;
    if (!trips.length) {
      return (
        <View style={styles.container}>
          <Image source={require('./empty.png')} />
          <View style={{}}>
            <NewTripButton onPress={this._onNewTripPressed}>
              <Icon name="add" size={24} color="#FFF" />
            </NewTripButton>
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
          {this._renderTrips(trips)}
        </ScrollView>
        <View style={styles.addButton}>
          <NewTripButton onPress={this._onNewTripPressed}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      </View>
    );
  }
}

module.exports = CheminotContext.create(Home);
