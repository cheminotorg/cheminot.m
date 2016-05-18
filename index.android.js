'use strict';

import React, {
  AppRegistry,
  Component,
  NavigationExperimental,
  StyleSheet,
  Text,
  View,
  StatusBar,
  PropTypes
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import DrawerLayout from './js/layout/DrawerLayout';
import NavigationAnimatedView from './js/layout/NavigationAnimatedView';
import Layout from './js/layout/Layout';
import NavigationRootBackAndroid from './js/layout/NavigationRootBackAndroid';
import Home from './js/Home';
import NewTrip from './js/NewTrip';

const {
  Header: NavigationHeader,
  Reducer: NavigationReducer,
  RootContainer: NavigationRootContainer
} = NavigationExperimental;

/// -- Reducer

const navigationReducer = NavigationReducer.StackReducer({
  getPushedReducerForAction: (action) => {
    if (action.type === 'push') {
      return (state) => state || {key: action.key, label: action.label};
    }
    return null;
  },
  getReducerForState: (initialState) => (state) => state || initialState,
  initialState: {
    key: 'cheminotm',
    index: 0,
    children: [
      {key: 'home', label: 'Cheminot'}
    ]
  }
});

const styles = StyleSheet.create({
  scrollView: {
    marginTop: NavigationHeader.HEIGHT
  }
});

class cheminotm extends Component {

  componentWillMount() {
    this._renderNavigation = this._renderNavigation.bind(this);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent={true} barStyle="light-content" />
        <NavigationRootContainer
          reducer={navigationReducer}
          persistenceKey="cheminotm"
          renderNavigation={this._renderNavigation}
        />
      </View>
    );
  }

  _renderScene(props) {
    switch(props.scene.navigationState.key) {
      case 'home': {
        return <Home {...props} />;
      }
      default: {
        return <NewTrip {...props} />;
      }
    }
  }

  _renderNavigation(navigationState, onNavigate) {
    if (!navigationState) return null;
    return (
      <DrawerLayout>
        <View style={{backgroundColor: MKColor.Indigo, height: 24, top: 0}} />
        <NavigationRootBackAndroid>
          <NavigationAnimatedView
            navigationState={navigationState}
            renderScene={this._renderScene}
        />
        </NavigationRootBackAndroid>
      </DrawerLayout>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
