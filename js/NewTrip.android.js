import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  DatePickerAndroid,
  TimePickerAndroid,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableNativeFeedback,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { MKColor, MKTextField, MKButton } from 'react-native-material-kit';
import moment from 'moment';
import Cheminotdb from './Cheminotdb';
import CheminotContext from './layout/ContextContainer';

const SearchButton = MKButton.flatButton()
                             .withBackgroundColor(MKColor.Teal)
                             .withTextStyle({ color: 'white' })
                             .withText('RECHERCHER')
                             .withStyle({ padding: 14 })
                             .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  block: {
    backgroundColor: 'white',
    marginBottom: 20,
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
  datetimeRow: {
    flex: 1,
    padding: 20,
  },
  dateRow: {
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: 1,
  },
  datetimeValue: {
    color: MKColor.Teal,
    textAlign: 'right',
    flex: 1,
  },
  datetimeLabel: {
    flex: 1,
  },
  submitBlock: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  textfield: {
    flex: 1,
  },
});

class NewTrip extends Component {

  constructor(props: any, context: any) {
    super(props, context);

    this._onStationSelected = this._onStationSelected.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onArrivalChangeText = this._onArrivalChangeText.bind(this);
    this._onDepartureChangeText = this._onDepartureChangeText.bind(this);
    this._onDepartureFocus = this._onDepartureFocus.bind(this);
    this._onArrivalFocus = this._onArrivalFocus.bind(this);
    this._onDatePickerPress = this._onDatePickerPress.bind(this);
    this._onTimePickerPress = this._onTimePickerPress.bind(this);

    /*this.props.addBackButtonListener(() => {
     *  if(this.state.isFocusDeparture) {
     *    blurDepartureInput(this.state);
     *    this.setState({
     *      isFocusDeparture: false
     *    });
     *    return NavigationBackAndroidContainer.result.DISMISS;
     *  } else if(this.state.isFocusArrival) {
     *    blurArrivalInput(this.state);
     *    this.setState({
     *      isFocusArrival: false
     *    });
     *    return NavigationBackAndroidContainer.result.DISMISS;
     *  }
     *  return NavigationBackAndroidContainer.result.DEFAULT;
     *});*/
  }

  state = {
    stations: [],
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
    datetimeBlockTop: new Animated.Value(0),
    suggestionBlockTop: new Animated.Value(Dimensions.get('window').height),
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

  _onSubmit() {
    this.props.navigation.push();
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
        <Animated.View style={{ top: this.state.datetimeBlockTop }}>
          <View style={styles.block}>
            <View style={styles.datetimeRow}>
              <TouchableWithoutFeedback onPress={this._onDatePickerPress}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.datetimeLabel}>Date de départ</Text>
                  <Text style={styles.datetimeValue}>{formatDate(this.state.selectedDepartureDate)}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={[styles.dateRow, styles.datetimeRow]}>
              <TouchableWithoutFeedback style={{ flex: 1, backgroundColor: 'green' }} onPress={this._onTimePickerPress}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 1 }}>Heure de départ</Text>
                  <Text style={styles.datetimeValue}>{formatTime(this.state.selectedDepartureTime)}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={styles.submitBlock}>
            <SearchButton onPress={this._onSubmit} />
          </View>
        </Animated.View>
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

function formatDate(date) {
  return moment(date).format('dddd D MMMM YYYY');
}

function formatTime(date) {
  return moment(date).format('HH:mm');
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
    tripBlockTop: -65,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 60,
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
    tripBlockTop: -20,
    tripBlockHeight: 58,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 46,
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

class StationsListItem extends Component {

  constructor(props, context) {
    super(props, context);
    this._onItemSelected = this._onItemSelected.bind(this);
  }

  _onItemSelected() {
    this.props.onItemSelected(this.props.id, this.props.name);
  }

  render() {
    return (
      <TouchableNativeFeedback onPress={this._onItemSelected}>
        <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="location-on" size={24} color={MKColor.Grey} />
          <Text style={{ color: MKColor.Grey }}>{this.props.name}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
};

class StationsList extends Component {

  constructor(props, context) {
    super(props, context);

    this._renderRow = this._renderRow.bind(this);

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

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections
        renderRow={this._renderRow}
        renderScrollComponent={props => <RecyclerViewBackedScrollView keyboardShouldPersistTaps {...props} />}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ backgroundColor: MKColor.Grey, height: 1 }} />}
        {...this.props}
      />
    );
  }
}

module.exports = CheminotContext.create(NewTrip);
