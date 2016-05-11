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

function onBackButtonPress(props) {
  props.context.enableDrawer();
  props.onNavigate(NavigationRootContainer.getBackAction())
}

const NavigationHeaderBackButton = (props: Props) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={() => onBackButtonPress(props)}>
    <View style={styles.button}>
      <Icon name="arrow-back" size={24} color="#FFF" />
    </View>
  </TouchableOpacity>
);

module.exports = NavigationContainer.create(NavigationHeaderBackButton);
