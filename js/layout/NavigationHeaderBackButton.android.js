'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import DrawerContainer from './DrawerContainer';
import NavigationBackAndroidContainer from './NavigationBackAndroidContainer';

const {
  Container: NavigationContainer,
  RootContainer: NavigationRootContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 24,
    width: 24,
    margin: Platform.OS === 'ios' ? 10 : 16,
    resizeMode: 'contain'
  }
});

class NavigationHeaderBackButton extends Component {

  _onBackButtonPress() {
    this.props.enableDrawer();
    return true;
  }

  render() {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={this.props.triggerBackButton}>
        <View style={styles.button}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }
}

module.exports = NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(NavigationHeaderBackButton)));
