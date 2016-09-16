import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  DatePickerAndroid,
  TimePickerAndroid,
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
import Api from '../common/Api';

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
    this._onDatePickerPress = this._onDatePickerPress.bind(this);
    this._onTimePickerPress = this._onTimePickerPress.bind(this);
    this._onWeekChange = this._onWeekChange.bind(this);
    this._onDepartureTimeSelected = this._onDepartureTimeSelected.bind(this);
  }

  state = {
    stations: [],
    departures: [],
    isFocusDeparture: false,
    isFocusArrival: false,
    arrivalTerm: '',
    departureTerm: '',
    selectedDepartureStation: {},
    selectedArrivalStation: {},
    selectedDepartureDate: new Date(),
    selectedDepartureTime: new Date(),
    tripBlockTop: new Animated.Value(0),
    tripBlockHeight: new Animated.Value(116),
    suggestionBlockTop: new Animated.Value(Dimensions.get('window').height),
    datetimeBlockTop: new Animated.Value(0),
  }

  shouldComponentUpdate(nextProps) {
    return this.props.navigation.isAt(nextProps, 'newtrip');
  }

  async _onDatePickerPress() {
    const { action, year, month, day } = await DatePickerAndroid.open({
      date: this.state.selectedDepartureDate,
    });
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        selectedDepartureDate: new Date(year, month, day),
      });
    }
  }

  async _onTimePickerPress() {
    const date = this.state.selectedDepartureTime;
    const { action, hour, minute } = await TimePickerAndroid.open({
      hour: date.getHours(),
      minute: date.getMinutes(),
      is24Hour: false,
    });
    if (action !== TimePickerAndroid.dismissedAction) {
      date.setHours(hour);
      date.setMinutes(minute);
      this.setState({
        selectedDepartureTime: date,
      });
    }
  }

  _onDepartureFocus() {
    this.setState({
      isFocusDeparture: true,
      selectedDepartureStation: {},
    });
    focusDepartureInput(this.state);
  }

  _onArrivalFocus() {
    this.setState({
      isFocusArrival: true,
      selectedArrivalStation: {},
    });
    focusArrivalInput(this.state);
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

  _onDepartureTimeSelected(departure) {
    console.log(departure);
  }

  _onStationSelected(id, name) {
    if (this.state.isFocusDeparture) {
      this._onDepartureSelected(id, name);
    } else {
      this._onArrivalSelected(id, name);
    }
  }

  _onDepartureSelected(id, name) {
    this._departureInput.blur();
    this.setState({
      stations: [],
      isFocusDeparture: false,
      selectedDepartureStation: { id, name },
    });
    blurDepartureInput(this.state);
  }

  _onArrivalSelected(id, name) {
    this._arrivalInput.blur();
    this.setState({
      stations: [],
      isFocusArrival: false,
      selectedArrivalStation: { id, name },
    });
    blurArrivalInput(this.state);
  }

  async _onWeekChange(day, week) {
    const response = await Api.searchDepartures('8739400', '8739100', week);
    this.setState({ departures: response.results });
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
        <View style={styles.weekCalendar}>
          <WeekCalendar
            onPress={this._onWeekChange}
            days={WeekCalendar.ALL}
          />
        </View>
        <DepartureTimesList
          departures={this.state.departures || []}
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
      from.datetimeBlockTop, {
        easing: Easing.ease,
        toValue: to.datetimeBlockTop,
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

function focusArrivalInput(from) {
  animateArrivalInput(from, {
    tripBlockTop: -45,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 80,
  });
}

function blurArrivalInput(from) {
  animateArrivalInput(from, {
    tripBlockTop: 0,
    datetimeBlockTop: 0,
    suggestionBlockTop: Dimensions.get('window').height,
  });
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
      from.datetimeBlockTop, {
        easing: Easing.ease,
        toValue: to.datetimeBlockTop,
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

function focusDepartureInput(from) {
  animateDepartureInput(from, {
    tripBlockTop: 0,
    tripBlockHeight: 58,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 66,
  });
}

function blurDepartureInput(from) {
  animateDepartureInput(from, {
    tripBlockTop: 0,
    tripBlockHeight: 58 * 2,
    datetimeBlockTop: 0,
    suggestionBlockTop: Dimensions.get('window').height,
  });
}

module.exports = CheminotContext.create(NewTrip);
