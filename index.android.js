'use strict';

import React, { Component } from 'react';

import {
  AppRegistry,
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
import NavigationRootBackAndroid from './js/layout/NavigationRootBackAndroid';
import Home from './js/Home';
import Trips from './js/Trips';
import NewTrip from './js/NewTrip';
import Locale from './js/locale';

Locale.init();

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils
} = NavigationExperimental;

const styles = StyleSheet.create({
  scrollView: {
    marginTop: NavigationHeader.HEIGHT
  }
});

class cheminotm extends Component {

  state = {
    header: {},
    navigationState: {
      index: 0,
      routes: [
        {key: 'home'}
      ]
    }
  }

  static childContextTypes = {
    setHeader: PropTypes.func,
    getHeader: PropTypes.func
  };

  getChildContext(): Object {
    return {
      setHeader: this.setHeader.bind(this),
      getHeader: this.getHeader.bind(this)
    };
  }

  setHeader(key, header) {
    const updatedHeader = Object.assign(this.state.header, {[key]: header});
    this.setState({
      header: updatedHeader
    });
  }

  getHeader(key) {
    if(this.state.header[key]) {
      return this.state.header[key];
    } else {
      switch(key) {
        case 'home': return {
          title: 'Cheminot'
        }
        case 'newtrip': return {
          title: 'Ajouter un trajet'
        }
        case 'trips': return {
          title: 'Trajets'
        }
      }
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent={true} barStyle="light-content" />
        <NavigationRootContainer
          renderNavigation={this._renderNavigation.bind(this)}
        />
      </View>
    );
  }

  _renderScene(props) {
    switch(props.scene.route.key) {
      case 'home': {
        return <Home {...props} />;
      }
      case 'newtrip': {
        return <NewTrip {...props} />;
      }
      case 'trips': {
        return <Trips {...props} />;
      }
    }
  }

  _onBackButton(navigationState) {
    if(navigationState.index === 1) {
      this._drawer.enableDrawer();
    } else {
      this._drawer.disableDrawer();
    }
  }

  _renderNavigation(navigationState) {
    if (!navigationState) return null;
    return (
      <DrawerLayout ref={(drawer) => this._drawer = drawer}>
        <View style={{backgroundColor: MKColor.Indigo, height: 24, top: 0}} />
        <NavigationRootBackAndroid
           navigationState={navigationState}
           onBackButton={this._onBackButton.bind(this)}>
          <NavigationAnimatedView
             header={this.state.header}
             navigationState={navigationState}
             renderScene={this._renderScene}
             />
        </NavigationRootBackAndroid>
      </DrawerLayout>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
