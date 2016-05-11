'use strict';

import React, {
  Component,
  StyleSheet,
  View,
  Image
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NewTripButton = MKButton.plainFab()
                              .withBackgroundColor(MKColor.Teal)
                              .build();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    justifyContent: 'space-around',
    alignItems: 'center'
  }
});

export default class Home extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image source={require('./empty.png')} />
        <View>
          <NewTripButton {...this.props}>
            <Icon name="add" size={24} color="#FFF" />
          </NewTripButton>
        </View>
      </View>
    );
  }
}
