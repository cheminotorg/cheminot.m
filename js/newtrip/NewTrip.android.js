import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { MKTextField } from 'react-native-material-kit';
import Cheminotdb from '../Cheminotdb';
import CheminotContext from '../layout/ContextContainer';
import StationsList from './StationsList';
import DepartureTimesList from './DepartureTimesList';
import WeekCalendar from '../common/WeekCalendar';
import HeaderDoneButton from '../layout/HeaderDoneButton';
import Api from '../common/Api';
import Storage from '../common/Storage';

// Cheminotdb.nearestStops(48.44820979, 1.48123655, 4000, 10).then((response) => {
//   console.log(response);
// });

const styles = StyleSheet.create({
  tripBlock: {
    elevation: 2,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: 'brown',
  },
  suggestionBlock: {
    flex: 1,
    paddingTop: 4,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'orange',
  },
  textfield: {
    height: 30,
    backgroundColor: 'blue',
  },
  weekCalendar: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

class NewTrip extends Component {

  constructor(props: any, context: any) {
    super(props, context);

    this._onStationSelected = this._onStationSelected.bind(this);
    this._onArrivalChangeText = this._onArrivalChangeText.bind(this);
    this._onDepartureChangeText = this._onDepartureChangeText.bind(this);
    this._onDepartureFocus = this._onDepartureFocus.bind(this);
    this._onArrivalFocus = this._onArrivalFocus.bind(this);
    this._onWeekChange = this._onWeekChange.bind(this);
    this._onDepartureTimeSelected = this._onDepartureTimeSelected.bind(this);
    this._onDonePressed = this._onDonePressed.bind(this);
  }

  state = {
    stations: [],
    starredTrips: [],
    tripsByDepartureTime: [],
    isFocusDeparture: false,
    isFocusArrival: false,
    arrivalTerm: '',
    departureTerm: '',
    selectedDepartureStation: {},
    selectedArrivalStation: {},
    selectedDepartureTimes: [],
    selectedWeek: WeekCalendar.ALL,
  }

  shouldComponentUpdate(nextProps) {
    return this.props.navigation.isAt(nextProps, 'newtrip');
  }

  _onDepartureFocus() {
    this.setState({
      isFocusDeparture: true,
      selectedDepartureStation: {},
      tripsByDepartureTime: [],
    });
  }

  _onArrivalFocus() {
    this.setState({
      isFocusArrival: true,
      selectedArrivalStation: {},
      tripsByDepartureTime: [],
    });
  }

  async _onDepartureChangeText(term) {
    this.setState({ departureTerm: term });
    const stations = await Cheminotdb.searchStops(term, 50);
    this.setState({ stations });
  }

  async _onArrivalChangeText(term) {
    this.setState({ arrivalTerm: term });
    const stations = await Cheminotdb.searchStops(term, 50);
    this.setState({ stations });
  }

  _syncDepartureTimesSelected(departureTimes) {
    this.setState({ selectedDepartureTimes: departureTimes });
    if (departureTimes.length > 0) {
      const plural = (departureTimes.length > 1) ? 's' : '';
      this.props.header.set({
        title: `${departureTimes.length} départ${plural} sélectionné${plural}`,
        left: <HeaderDoneButton onPress={this._onDonePressed} />,
      });
    } else {
      this.props.header.reset();
    }
  }

  _onDepartureTimeSelected(e, departureTime) {
    let selectedDepartureTimes = [];
    if (e.checked) {
      selectedDepartureTimes = this.state.selectedDepartureTimes.concat(departureTime);
    } else {
      selectedDepartureTimes = this.state.selectedDepartureTimes.filter(s => s !== departureTime);
    }
    this._syncDepartureTimesSelected(selectedDepartureTimes);
  }

  async _onDonePressed() {
    const tripsByDepartureTime = this.state.selectedDepartureTimes.reduce((acc, departureTime) => {
      acc[departureTime] = this.state.tripsByDepartureTime[departureTime];
      return acc;
    }, {});

    await Storage.setTrips({
      vs: this.state.selectedDepartureStation.id,
      ve: this.state.selectedArrivalStation.id,
      trips: tripsByDepartureTime,
      week: this.state.selectedWeek,
    });
    this.props.navigation.rewind('home');
  }

  async _onStationSelected(id, name) {
    if (this.state.isFocusDeparture) {
      this._onDepartureSelected(id, name);
    } else {
      this._onArrivalSelected(id, name);
    }
    const vs = this.state.isFocusDeparture ? id : this.state.selectedDepartureStation.id;
    const ve = this.state.isFocusDeparture ? this.state.selectedArrivalStation.id : id;
    if (vs && ve) {
      const [tripsByDepartureTime, { trips: starredTrips, week }] = await Promise.all([
        Api.fetchTripsByDepartureTime(vs, ve),
        Storage.getTrips(vs, ve),
      ]);
      this._syncDepartureTimesSelected(Object.keys(starredTrips));
      this.setState({
        starredTrips,
        tripsByDepartureTime,
        selectedWeek: week,
      });
    }
  }

  _onDepartureSelected(id, name) {
    this._departureInput.blur();
    this.setState({
      stations: [],
      isFocusDeparture: false,
      selectedDepartureStation: { id, name },
    });
  }

  _onArrivalSelected(id, name) {
    this._arrivalInput.blur();
    this.setState({
      stations: [],
      isFocusArrival: false,
      selectedArrivalStation: { id, name },
    });
  }

  async _onWeekChange(day, week) {
    const vs = this.state.selectedDepartureStation.id;
    const ve = this.state.selectedArrivalStation.id;
    const tripsByDepartureTime = await Api.fetchTripsByDepartureTime(vs, ve, week);
    const selectedDepartureTimes = Object.keys(this.state.starredTrips).filter((starredDepartureTime) => (
      !!tripsByDepartureTime[starredDepartureTime]
    ));
    this._syncDepartureTimesSelected(selectedDepartureTimes);
    this.setState({ selectedWeek: week, tripsByDepartureTime });
  }

  _renderDeparturesList() {
    const departureTimes = Object.keys(this.state.tripsByDepartureTime).map((departureTime) => (
      parseInt(departureTime, 10)
    ));

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.weekCalendar}>
          <WeekCalendar
            onPress={this._onWeekChange}
            week={this.state.selectedWeek}
          />
        </View>
        <DepartureTimesList
          style={{ backgroundColor: 'white' }}
          departureTimes={departureTimes}
          onDepartureTimeSelected={this._onDepartureTimeSelected}
          starredTrips={this.state.starredTrips}
        />
      </View>
    );
  }

  _renderSuggestions() {
    return (
      <View style={styles.suggestionBlock}>
        <StationsList
          stations={this.state.stations || []}
          onItemSelected={this._onStationSelected}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.tripBlock}>
          <MKTextField
            ref={(input) => { this._departureInput = input; }}
            value={this.state.selectedDepartureStation.name || this.state.departureTerm}
            onChangeText={this._onDepartureChangeText}
            onFocus={this._onDepartureFocus}
            placeholder="Départ"
            clearTextOnFocus
            autoCorrect
            style={[styles.textfield, { marginBottom: 14 }]}
          />
          <MKTextField
            ref={(input) => { this._arrivalInput = input; }}
            value={this.state.selectedArrivalStation.name || this.state.arrivalTerm}
            onChangeText={this._onArrivalChangeText}
            onFocus={this._onArrivalFocus}
            placeholder="Arrivée"
            clearTextOnFocus
            style={styles.textfield}
          />
        </View>
        { (this.state.selectedDepartureStation.name && this.state.selectedArrivalStation.name) ? this._renderDeparturesList() : this._renderSuggestions() }
      </View>
    );
  }
}

module.exports = CheminotContext.create(NewTrip);
