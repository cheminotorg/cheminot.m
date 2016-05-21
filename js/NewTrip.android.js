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
  Animated
} from 'react-native';

import DrawerContainer from './layout/DrawerContainer';
import NavigationBackAndroidContainer from './layout/NavigationBackAndroidContainer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MKColor, MKTextField, MKButton } from 'react-native-material-kit';

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
    paddingTop: 56 + 20,
  },
  block: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderColor: '#ffffff',
    borderWidth: 1,
    shadowColor: MKColor.Grey,
    shadowOpacity: 0.8,
    shadowOffset: {
      height: 1,
      width: 2
    }
  },
  tripBlock: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16
  },
  datetimeBlock: {
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
    departure: {
      top: new Animated.Value(10)
    },
    arrival: {
      top: new Animated.Value(40)
    }
  }

  componentDidMount() {
    /*Animated.timing(
     *  this.state.departure.top, {
     *    toValue: 1000,
     *    duration: 2000
     *  }
     *).start();*/
  }

  componentWillMount() {
    this.props.addBackButtonListener(function() {
      return true;
    });
  }

  onDatePickerPress() {
    DatePickerAndroid.open({});
  }

  onTimePickerPress() {
    TimePickerAndroid.open({});
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.block, styles.tripBlock]}>
          <Animated.View>
            <MKTextField placeholder="Départ" style={[styles.textfield, {marginBottom: 14}]} />
          </Animated.View>
          <Animated.View>
            <MKTextField placeholder="Arrivée" style={styles.textfield} />
          </Animated.View>
        </Animated.View>
        <View style={[styles.block, styles.datetimeBlock]}>
          <View style={styles.datetimeRow}>
            <TouchableWithoutFeedback onPress={this.onDatePickerPress.bind(this)}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.datetimeLabel}>Date de départ</Text>
                <Text style={styles.datetimeValue}>21/01/2016</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={[styles.dateRow, styles.datetimeRow]}>
            <TouchableWithoutFeedback style={{flex: 1, backgroundColor: 'green'}} onPress={this.onTimePickerPress.bind(this)}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{flex: 1}}>Heure de départ</Text>
                <Text style={styles.datetimeValue}>08:00</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.submitBlock}>
          <SearchButton />
        </View>
      </View>
    );
  }
}

module.exports = NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(NewTrip)));
