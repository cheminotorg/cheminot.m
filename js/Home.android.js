'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  View,
  Image
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DrawerContainer from './layout/DrawerContainer';

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const {
  Container: NavigationContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    justifyContent: 'space-around',
    alignItems: 'center'
  }
});

class Home extends Component {

  _onNewTripPress() {
    this.props.disableDrawer();
    this.props.onNavigate({
      type: 'push',
      key: `newtrip`,
      label: `Ajouter un trajet`
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={require('./empty.png')} />
        <View>
          <NewTripButton onPress={this._onNewTripPress.bind(this)}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      </View>
    );
  }
}

module.exports = DrawerContainer.create(NavigationContainer.create(Home));
