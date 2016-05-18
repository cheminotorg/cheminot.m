'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  Text
} from 'react-native';

import DrawerContainer from './layout/DrawerContainer';
import NavigationBackAndroidContainer from './layout/NavigationBackAndroidContainer';

const {
  Container: NavigationContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56
  }
});

class NewTrip extends Component {

  componentWillMount() {
    this.props.addBackButtonListener(function() {
      return true;
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Add new trip</Text>
      </View>
    );
  }
}

module.exports = NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(NewTrip)));
