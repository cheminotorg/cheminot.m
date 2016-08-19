'use strict';

import React, { Component } from 'react';
import {
  NavigationExperimental,
  StyleSheet,
  View,
  Text,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableNativeFeedback,
  AsyncStorage
} from 'react-native';

import moment from 'moment';
import { MKButton, MKColor, MKCheckbox, MKSpinner } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotContext from './layout/ContextContainer';
import HeaderDoneButton from './layout/HeaderDoneButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 56
  },
  tripItem: {
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white'
  }
});

function formatTime(date) {
  return moment(date).format('HH:mm');
}

function fetchTrips(url) {
  if(url) {
    return fetch(url).then((response) => response.json());
  } else {
    const endpoint = 'http://10.0.3.2:8080/api';
    const at = (new Date()).toISOString();
    const params = {vs: '8739400', ve: '8739100', at: at, limit: 10};
    const qs = Object.keys(params).reduce((acc, key) => {
      const newparam = `${key}=${params[key]}`;
      return acc ? `${acc}&${newparam}` : newparam;
    }, '');
    return fetch(`${endpoint}/trips/search.json?${qs}`).then((response) => response.json());
  }
}

class Trips extends Component {

  state = {
    trips: [],
    isLoading: false,
    nextUrl: null,
    selected: []
  }

  onTripSelected(e, id) {
    const selected = e.checked ? this.state.selected.concat(id) : this.state.selected.filter((s) => s != id);
    this.setState({
      selected: selected
    });
    if(selected.length > 0) {
      this.props.header.set({
        title: `${selected.length} trajet sélectionné`,
        left: <HeaderDoneButton onPress={this.onDonePressed.bind(this)}/>
      });
    } else {
      this.props.header.reset();
    }
  }

  componentDidMount() {
    this.onEndReached();
  }

  async onEndReached() {
    if(!this.state.isLoading) {
      this.setState({isLoading: true});
      const response = await fetchTrips(this.state.nextUrl);
      this.setState({
        isLoading: false,
        trips: this.state.trips.concat(response.results),
        nextUrl: response.next
      });
    }
  }

  async onDonePressed() {
    const selectedTrips = this.state.trips.filter((trip) => {
      return this.state.selected.some((id) => trip.id == id);
    });
    await AsyncStorage.setItem('trips', JSON.stringify(selectedTrips));
    this.props.navigation.go('home');
  }

  render() {
    return (
      <View style={styles.container}>
        <TripsList
           isLoading={this.state.isLoading}
           onEndReached={this.onEndReached.bind(this)}
           onTripSelected={this.onTripSelected.bind(this)}
           trips={this.state.trips || []} />
      </View>
    );
  }
}

const TripsList = React.createClass({

  getInitialState: function() {
    const ds = new ListView.DataSource({
      rowHasChanged: (trip1, trip2) => trip1.id !== trip2.id
    });
    return {
      dataSource: ds.cloneWithRows(this.props.trips)
    };
  },

  componentWillReceiveProps: function(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.trips)
    });
  },

  renderRow: function(trip) {
    const stopTimeA = trip.stopTimes[0];
    const stopTimeB = trip.stopTimes[trip.stopTimes.length - 1];
    const departureTime = formatTime(stopTimeA.departure);
    const arrivalTime = formatTime(stopTimeB.arrival);
    const steps = trip.stopTimes.length
    const duration = '1h08';

    return (
      <TouchableNativeFeedback id={trip.id} onPress={(e) => this.props.onTripSelected(e, trip.id)}>
        <View style={styles.tripItem}>
          <View style={{width: 40, height: 40, padding: 0, backgroundColor: MKColor.Grey, borderRadius: 50, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: 'white', fontSize: 12}}>1h09</Text>
          </View>
          <View style={{marginLeft: 16}}>
            <Text>{departureTime} → {arrivalTime} ({duration})</Text>
            <Text>{steps} arrêts</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <MKCheckbox onCheckedChange={(e) => this.props.onTripSelected(e, trip.id)} />
          </View>
        </View>
      </TouchableNativeFeedback>
    )
  },

  renderFooter: function() {
    if(this.props.isLoading) {
      return (
        <View style={[styles.tripItem, {flexDirection: 'column'}]}>
          <MKSpinner />
        </View>
      );
    } else {
      return null;
    }
  },

  render: function() {
    return (
      <ListView
         enableEmptySections={true}
         renderFooter={this.renderFooter}
         dataSource={this.state.dataSource}
         automaticallyAdjustContentInsets={true}
         renderRow={this.renderRow}
         renderScrollComponent={props => <RecyclerViewBackedScrollView {...props}/>}
         renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{backgroundColor: MKColor.Grey, height: 1}} />}
         onEndReachedThreshold={80}
         {...this.props}
      />
    );
  }
});

module.exports = CheminotContext.create(Trips);
