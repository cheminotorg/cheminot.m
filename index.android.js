'use strict';

import React, {
  AppRegistry,
  Component,
  NavigationExperimental,
  Animated,
  StyleSheet,
  ScrollView,
  BackAndroid,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image,
  DrawerLayoutAndroid,
  PropTypes
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import DrawerLayout from './js/layout/DrawerLayout';
import NavigationAnimatedView from './js/layout/NavigationAnimatedView';
import Home from './js/Home';
import Layout from './js/layout/Layout';

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
    marginTop: NavigationHeader.HEIGHT,
  }
});

class cheminotm extends Component {

  componentWillMount() {
    this._renderNavigation = this._renderNavigation.bind(this);
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButtonPress.bind(this));
  }

  _handleBackButtonPress() {
    return (
      this._navRootContainer &&
      this._navRootContainer.handleNavigation(NavigationRootContainer.getBackAction())
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent={true} barStyle="light-content" />
        <NavigationRootContainer
          reducer={navigationReducer}
          ref={navRootContainer => { this._navRootContainer = navRootContainer; }}
          persistenceKey="cheminotm"
          renderNavigation={this._renderNavigation}
        />
      </View>
    );
  }

  _router(props) {
    switch(props.scene.navigationState.key) {
      case 'home': {
        return <Home {...props} />;
      }
      default: {
        return (
          <View style={{flex: 1, paddingTop: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Text>{props.scene.navigationState.label}</Text>
          </View>
        );
      }
    }
  }

  _renderNavigation(navigationState, onNavigate) {
    if (!navigationState) return null;
    return (
      <DrawerLayout>
        <View style={{backgroundColor: MKColor.Indigo, height: 24, top: 0}} />
        <NavigationAnimatedView
          navigationState={navigationState}
          router={this._router}
        />
      </DrawerLayout>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
