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

export default class NavigationHeaderBackButton extends Component {

  _onBackButtonPress() {
    this.props.enableDrawer();
    this.props.onNavigate(NavigationRootContainer.getBackAction())
  }

  render() {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={this._onBackButtonPress.bind(this)}>
        <View style={styles.button}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }
}

module.exports = DrawerContainer.create(NavigationContainer.create(NavigationHeaderBackButton));
