'use strict';

import React, {
  Component,
  NavigationExperimental,
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
  TouchableNativeFeedback
} from 'react-native';

import DrawerContainer from './layout/DrawerContainer';
import NavigationBackAndroidContainer from './layout/NavigationBackAndroidContainer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MKColor, MKTextField, MKButton } from 'react-native-material-kit';
import Cheminotdb from './Cheminotdb';
import moment from 'moment';

const SearchButton = MKButton.flatButton()
                             .withBackgroundColor(MKColor.Teal)
                             .withTextStyle({color: 'white'})
                             .withText('RECHERCHER')
                             .withStyle({padding: 14})
                             .build();

const {
  Container: NavigationContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 56 + 20
  },
  block: {
    backgroundColor: 'white',
    marginBottom: 20,
    elevation: 2
  },
  tripBlock: {
    top: 0,
    paddingTop: 12,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16
  },
  suggestionBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 4,
    paddingLeft: 10,
    paddingRight: 10
  },
  datetimeRow: {
    flex: 1,
    padding: 20
  },
  dateRow: {
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: 1
  },
  datetimeValue: {
    color: MKColor.Teal,
    textAlign: 'right',
    flex: 1
  },
  datetimeLabel: {
    flex: 1
  },
  submitBlock: {
    paddingLeft: 10,
    paddingRight: 10
  },
  textfield: {
    flex: 1
  }
});

class NewTrip extends Component {

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
    suggestionBlockTop: new Animated.Value(Dimensions.get('window').height)
  }

  componentWillMount() {
    this.props.addBackButtonListener(() => {
      if(this.state.isFocusDeparture) {
        blurDepartureInput(this.state);
        this.setState({
          isFocusDeparture: false
        });
        return NavigationBackAndroidContainer.result.DISMISS;
      } else if(this.state.isFocusArrival) {
        blurArrivalInput(this.state);
        this.setState({
          isFocusArrival: false
        });
        return NavigationBackAndroidContainer.result.DISMISS;
      }
      return NavigationBackAndroidContainer.result.DEFAULT;
    });
  }

  async onDatePickerPress() {
    const {action, year, month, day} = await DatePickerAndroid.open({
      date: this.state.selectedDepartureDate
    });
    if(action != DatePickerAndroid.dismissedAction) {
      this.setState({
        selectedDepartureDate: new Date(year, month, day)
      });
    }
  }

  async onTimePickerPress() {
    const date = this.state.selectedDepartureTime;
    const {action, hour, minute} = await TimePickerAndroid.open({
      hour: date.getHours(),
      minute: date.getMinutes(),
      is24Hour: false
    });
    if(action != TimePickerAndroid.dismissedAction) {
      date.setHours(hour);
      date.setMinutes(minute);
      this.setState({
        selectedDepartureTime: date
      });
    }
  }

  onDepartureFocus() {
    this.setState({
      isFocusDeparture: true,
      selectedDepartureStation: {}
    });
    focusDepartureInput(this.state);
  }

  onArrivalFocus() {
    this.setState({
      isFocusArrival: true,
      selectedArrivalStation: {}
    });
    focusArrivalInput(this.state);
  }

  onDepartureChangeText(term) {
    this.setState({departureTerm: term});
    Cheminotdb.searchStops(term, 50).then((stations) => {
      this.setState({
        stations: stations
      });
    });
  }

  onArrivalChangeText(term) {
    this.setState({arrivalTerm: term});
    Cheminotdb.searchStops(term, 50).then((stations) => {
      this.setState({
        stations: stations
      });
    });
  }

  onStationSelected(id, name) {
    if(this.state.isFocusDeparture) {
      this.onDepartureSelected(id, name);
    } else {
      this.onArrivalSelected(id, name);
    }
  }

  onDepartureSelected(id, name) {
    this._departureInput.blur();
    this.setState({
      stations: [],
      isFocusDeparture: false,
      selectedDepartureStation: {
        id: id,
        name: name
      }
    });
    blurDepartureInput(this.state);
  }

  onArrivalSelected(id, name) {
    this._arrivalInput.blur();
    this.setState({
      stations: [],
      isFocusArrival: false,
      selectedArrivalStation: {
        id: id,
        name: name
      }
    });
    blurArrivalInput(this.state);
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.block, styles.tripBlock, {top: this.state.tripBlockTop, height: this.state.tripBlockHeight}]}>
          <Animated.View>
            <MKTextField
               ref={(input) => this._departureInput = input}
               value={this.state.selectedDepartureStation.name || this.state.departureTerm}
               onChangeText={this.onDepartureChangeText.bind(this)}
               onFocus={this.onDepartureFocus.bind(this)}
               placeholder="Départ"
               clearTextOnFocus={true}
               autoCorrect={false}
               style={[styles.textfield, {marginBottom: 14}]} />
          </Animated.View>
          <Animated.View style={{top: this.state.arrivalInputTop}}>
            <MKTextField
               ref={(input) => this._arrivalInput = input}
               value={this.state.selectedArrivalStation.name  || this.state.arrivalTerm}
               onChangeText={this.onArrivalChangeText.bind(this)}
               onFocus={this.onArrivalFocus.bind(this)}
               placeholder="Arrivée"
               clearTextOnFocus={true}
               autoCorrect={false}
               style={styles.textfield} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={{top: this.state.datetimeBlockTop}}>
          <View style={styles.block}>
            <View style={styles.datetimeRow}>
              <TouchableWithoutFeedback onPress={this.onDatePickerPress.bind(this)}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.datetimeLabel}>Date de départ</Text>
                  <Text style={styles.datetimeValue}>{formatDate(this.state.selectedDepartureDate)}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={[styles.dateRow, styles.datetimeRow]}>
              <TouchableWithoutFeedback style={{flex: 1, backgroundColor: 'green'}} onPress={this.onTimePickerPress.bind(this)}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 1}}>Heure de départ</Text>
                  <Text style={styles.datetimeValue}>{formatTime(this.state.selectedDepartureTime)}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={styles.submitBlock}>
            <SearchButton />
          </View>
        </Animated.View>
        <Animated.View style={[styles.suggestionBlock, {top: this.state.suggestionBlockTop, backgroundColor: 'white'}]}>
          <StationsList
             stations={this.state.stations || []}
             style={{backgroundColor: 'white'}}
             onItemSelected={this.onStationSelected.bind(this)} />
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
  const {height, width} = Dimensions.get('window');

  Animated.parallel([
    Animated.timing(
      from.tripBlockTop, {
        easing: Easing.inOut(Easing.quad),
        toValue: to.tripBlockTop,
        duration: 250
      }
    ),
    Animated.timing(
      from.datetimeBlockTop, {
        easing: Easing.ease,
        toValue: to.datetimeBlockTop,
        duration: 250
      }
    ),
    Animated.timing(
      from.suggestionBlockTop, {
        easing: Easing.out(Easing.ease),
        toValue: to.suggestionBlockTop,
        duration: 250
      }
    )
  ]).start();
}

function focusArrivalInput(from) {
  animateArrivalInput(from, {
    tripBlockTop: -65,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 60
  });
}

function blurArrivalInput(from) {
  animateArrivalInput(from, {
    tripBlockTop: 0,
    datetimeBlockTop: 0,
    suggestionBlockTop: Dimensions.get('window').height
  });
}

function animateDepartureInput(from, to) {
  const {height, width} = Dimensions.get('window');

  Animated.parallel([
    Animated.timing(
      from.tripBlockTop, {
        easing: Easing.inOut(Easing.quad),
        toValue: to.tripBlockTop,
        duration: 250
      }
    ),
    Animated.timing(
      from.tripBlockHeight, {
        easing: Easing.ease,
        toValue: to.tripBlockHeight,
        duration: 250
      }
    ),
    Animated.timing(
      from.datetimeBlockTop, {
        easing: Easing.ease,
        toValue: to.datetimeBlockTop,
        duration: 250
      }
    ),
    Animated.timing(
      from.suggestionBlockTop, {
        easing: Easing.out(Easing.ease),
        toValue: to.suggestionBlockTop,
        duration: 250
      }
    )
  ]).start();
}

function focusDepartureInput(from) {
  animateDepartureInput(from, {
    tripBlockTop: -20,
    tripBlockHeight: 58,
    datetimeBlockTop: Dimensions.get('window').height,
    suggestionBlockTop: 46
  });
}

function blurDepartureInput(from) {
  animateDepartureInput(from, {
    tripBlockTop: 0,
    tripBlockHeight: 58 * 2,
    datetimeBlockTop: 0,
    suggestionBlockTop: Dimensions.get('window').height
  });
}

const StationsList = React.createClass({

  getInitialState: function() {
    const ds = new ListView.DataSource({
      rowHasChanged: (station1, station2) => station1.id !== station2.id
    });
    return {
      dataSource: ds.cloneWithRows(this.props.stations)
    };
  },

  componentWillReceiveProps: function(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(props.stations)
    });
  },

  renderRow: function({id, name}) {
    return (
      <TouchableNativeFeedback id={id} onPress={this.props.onItemSelected.bind(this, id, name)}>
        <View style={{paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="location-on" size={24} color={MKColor.Grey} />
          <Text style={{color: MKColor.Grey}}>{name}</Text>
        </View>
      </TouchableNativeFeedback>
    )
  },

  render: function() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={true}
        renderRow={this.renderRow}
        renderScrollComponent={props => <RecyclerViewBackedScrollView keyboardShouldPersistTaps={true} {...props}/> }
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{backgroundColor: MKColor.Grey, height: 1}} />}
        {...this.props}
      />
    );
  }
});

module.exports = NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(NewTrip)));
