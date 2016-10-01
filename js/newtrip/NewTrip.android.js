import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
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
  container: {
    flex: 1,
  },
  block: {
    backgroundColor: 'white',
    marginBottom: 10,
    elevation: 2,
  },
  tripBlock: {
    top: 0,
    paddingTop: 12,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
  suggestionBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textfield: {
    flex: 1,
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
    departureTimes: [],
    isFocusDeparture: false,
    isFocusArrival: false,
    arrivalTerm: '',
    departureTerm: '',
    selectedDepartureStation: {},
    selectedArrivalStation: {},
    selectedDepartureTimes: [],
    tripBlockTop: new Animated.Value(0),
    tripBlockHeight: new Animated.Value(116),
    suggestionBlockTop: new Animated.Value(Dimensions.get('window').height),
  }

  shouldComponentUpdate(nextProps) {
    return this.props.navigation.isAt(nextProps, 'newtrip');
  }

  _onDepartureFocus() {
    this.setState({
      isFocusDeparture: true,
      selectedDepartureStation: {},
    });

    animateDepartureInput(this.state, {
      tripBlockTop: 0,
      tripBlockHeight: 58,
      suggestionBlockTop: 66,
    });
  }

  _onArrivalFocus() {
    this.setState({
      isFocusArrival: true,
      selectedArrivalStation: {},
    });

    animateArrivalInput(this.state, {
      tripBlockTop: -45,
      suggestionBlockTop: 80,
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

  _onDepartureTimeSelected(e, departureTime) {
    let selectedDepartureTimes = [];
    if (e.checked) {
      selectedDepartureTimes = this.state.selectedDepartureTimes.concat(departureTime);
    } else {
      selectedDepartureTimes = this.state.selectedDepartureTimes.filter(s => s.at !== departureTime.at);
    }
    this.setState({ selectedDepartureTimes });
    if (selectedDepartureTimes.length > 0) {
      this.props.header.set({
        title: `${selectedDepartureTimes.length} départ sélectionné`,
        left: <HeaderDoneButton onPress={this._onDonePressed} />,
      });
    } else {
      this.props.header.reset();
    }
  }

  async _onDonePressed() {
    await Storage.setDepartureTimes({
      vs: this.state.selectedDepartureStation.id,
      ve: this.state.selectedArrivalStation.id,
      departureTimes: this.state.selectedDepartureTimes,
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
      const response = await Api.searchDepartures(vs, ve);
      this.setState({ departureTimes: response.results });
    }
  }

  _onDepartureSelected(id, name) {
    this._departureInput.blur();
    this.setState({
      stations: [],
      isFocusDeparture: false,
      selectedDepartureStation: { id, name },
    });

    animateDepartureInput(this.state, {
      tripBlockTop: 0,
      tripBlockHeight: 58 * 2,
      suggestionBlockTop: Dimensions.get('window').height,
    });
  }

  _onArrivalSelected(id, name) {
    this._arrivalInput.blur();
    this.setState({
      stations: [],
      isFocusArrival: false,
      selectedArrivalStation: { id, name },
    });

    animateArrivalInput(this.state, {
      tripBlockTop: 0,
      suggestionBlockTop: Dimensions.get('window').height,
    });
  }

  async _onWeekChange(day, week) {
    const vs = this.state.selectedDepartureStation.id;
    const ve = this.state.selectedArrivalStation.id;
    const response = await Api.searchDepartures(vs, ve, week);
    this.setState({ departureTimes: response.results });
  }

  _renderWeekCalendar() {
    if (this.state.selectedDepartureStation.name && this.state.selectedArrivalStation.name) {
      return (
        <View style={styles.weekCalendar}>
          <WeekCalendar
            onPress={this._onWeekChange}
            week={WeekCalendar.ALL}
          />
        </View>
      );
    }
    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.block, styles.tripBlock, { top: this.state.tripBlockTop, height: this.state.tripBlockHeight }]}>
          <Animated.View>
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
          </Animated.View>
          <Animated.View style={{ top: this.state.arrivalInputTop }}>
            <MKTextField
              ref={(input) => { this._arrivalInput = input; }}
              value={this.state.selectedArrivalStation.name || this.state.arrivalTerm}
              onChangeText={this._onArrivalChangeText}
              onFocus={this._onArrivalFocus}
              placeholder="Arrivée"
              clearTextOnFocus
              style={styles.textfield}
            />
          </Animated.View>
        </Animated.View>
        { this._renderWeekCalendar() }
        <DepartureTimesList
          departureTimes={this.state.departureTimes || []}
          style={{ backgroundColor: 'white' }}
          onDepartureTimeSelected={this._onDepartureTimeSelected}
        />
        <Animated.View style={[styles.suggestionBlock, { top: this.state.suggestionBlockTop, backgroundColor: 'white' }]}>
          <StationsList
            stations={this.state.stations || []}
            style={{ backgroundColor: 'white' }}
            onItemSelected={this._onStationSelected}
          />
        </Animated.View>
      </View>
    );
  }
}

function animateArrivalInput(from, to) {
  Animated.parallel([
    Animated.timing(
      from.tripBlockTop, {
        easing: Easing.inOut(Easing.quad),
        toValue: to.tripBlockTop,
        duration: 250,
      }
    ),
    Animated.timing(
      from.suggestionBlockTop, {
        easing: Easing.out(Easing.ease),
        toValue: to.suggestionBlockTop,
        duration: 250,
      }
    ),
  ]).start();
}

function animateDepartureInput(from, to) {
  Animated.parallel([
    Animated.timing(
      from.tripBlockTop, {
        easing: Easing.inOut(Easing.quad),
        toValue: to.tripBlockTop,
        duration: 250,
      }
    ),
    Animated.timing(
      from.tripBlockHeight, {
        easing: Easing.ease,
        toValue: to.tripBlockHeight,
        duration: 250,
      }
    ),
    Animated.timing(
      from.suggestionBlockTop, {
        easing: Easing.out(Easing.ease),
        toValue: to.suggestionBlockTop,
        duration: 250,
      }
    ),
  ]).start();
}

module.exports = CheminotContext.create(NewTrip);
