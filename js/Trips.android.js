'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  Text,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableNativeFeedback
} from 'react-native';

import { MKButton, MKColor, MKCheckbox, MKSpinner } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DrawerContainer from './layout/DrawerContainer';

const {
  Container: NavigationContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 56
  },
  tripItem: {
    padding: 14,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white'
  }
});

function TRIPS(id) {
  id = id ? id : '';
  return [
    {id: `${id}trip#1`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#2`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#3`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#4`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#5`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#6`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#7`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9},
    {id: `${id}trip#8`, departureTime: '07:57', arrivalTime: '09:06', duration: '1h09', steps: 9}
  ]
};

function FTRIPS() {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(TRIPS(Date.now()));
    }, 4000);
  });
}

class Trips extends Component {

  state = {
    trips: TRIPS(),
    isLoading: false
  }

  onTripTouched() {
    alert('onTripTouched');
  }

  async onEndReached() {
    this.setState({isLoading: true});
    const trips = await FTRIPS();
    this.setState({
      isLoading: false,
      trips: this.state.trips.concat(TRIPS())
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TripsList
           isLoading={this.state.isLoading}
           onEndReached={this.onEndReached.bind(this)}
           onItemTouched={this.onTripTouched}
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

  renderRow: function({id, departureTime, arrivalTime, duration, steps}) {
    return (
      <TouchableNativeFeedback id={id} onPress={this.props.onItemTouched.bind(this, id)}>
        <View style={styles.tripItem}>
          <View style={{}}>
            <Text>{departureTime} → {arrivalTime}</Text>
            <Text>{steps} arrêts</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <MKCheckbox />
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
         onEndReachedThreshold={1}
         {...this.props}
      />
    );
  }
});

module.exports = DrawerContainer.create(NavigationContainer.create(Trips));
