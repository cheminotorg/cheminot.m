'use strict';

import React, { Component, PropTypes } from 'react';

import {
  AppRegistry,
  NavigationExperimental,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import Navigator from './js/layout/Navigator';
import Home from './js/Home';
import Trips from './js/Trips';
import NewTrip from './js/NewTrip';
import Locale from './js/locale';

import type  {
  NavigationSceneRendererProps,
  NavigationState,
  NavigationTransitionProps,
  NavigationTransitionSpec,
} from 'NavigationTypeDefinition';

Locale.init();

const {
  PropTypes: NavigationPropTypes,
  StateUtils: NavigationStateUtils,
  Transitioner: NavigationTransitioner,
  Header: NavigationHeader
} = NavigationExperimental;

const styles = StyleSheet.create({
  scrollView: {
    marginTop: NavigationHeader.HEIGHT
  }
});

const ROUTES = [
  {key: 'home'},
  {key: 'newtrip'},
  {key: 'trips'}
];

function reducer(state: ?NavigationState, action: any): NavigationState {
  if (!state) {
    return {
      navigationState: {
        index: 0,
        routes: [ROUTES[0]]
      }
    };
  }

  switch (action) {
    case 'push':
      const route = ROUTES[state.index + 1];
      return NavigationStateUtils.push(state, route);
    case 'pop':
      return NavigationStateUtils.pop(state);
  }

  return state;
}

class cheminotm extends Component {

  state: NavigationState;

  constructor(props: any, context: any) {
    super(props, context);
    this.state = reducer();
    this._navigate = this._navigate.bind(this);
  }

  _navigate(action: string): void {
    let { navigationState } = this.state;
    navigationState = reducer(navigationState, action);
    if (this.state.navigationState !== navigationState) {
      this.setState({navigationState});
    }
  }

  _renderScene(sceneProps: Object): ReactElement {
    switch(sceneProps.scene.route.key) {
      case 'home': return <Home {...this.props} />;
      case 'newtrip': return <NewTrip {...this.props} />;
      case 'trips': return <Trips {...this.props} />;
    }
  }

  render(): ReactElement<any> {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent={true} />
        <Navigator
           navigate={this._navigate}
           navigationState={this.state.navigationState}
           renderScene={this._renderScene}
           />
      </View>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
