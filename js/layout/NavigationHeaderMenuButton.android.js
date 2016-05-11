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
  Container: NavigationContainer
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

export default class NavigationHeaderMenuButton extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.buttonContainer} {...this.props}>
        <View style={styles.button}>
          <Icon name="menu" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }
}
