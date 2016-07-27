'use strict';

import React, { Component, PropTypes } from 'react';

import {
  AppRegistry,
  NavigationExperimental,
  StyleSheet,
  Text,
  View,
  StatusBar,
  BackAndroid
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import Navigator from './js/layout/Navigator';
import Home from './js/Home';
import Trips from './js/Trips';
import NewTrip from './js/NewTrip';
import Locale from './js/locale';
import CheminotContext from './js/layout/ContextContainer';
import CheminotPropTypes from './js/layout/PropTypes';

import type, {
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
});

const HEADERS = {
  home: { title: 'Cheminot' },
  newtrip: { title: 'Route A', back: true },
  trips: { title: 'Route B', back: true }
};

const ROUTES = [
  {key: 'home'},
  {key: 'newtrip'},
  {key: 'trips'}
];

function reducer(state: ?CheminotPropTypes.State, action: any): CheminotState {
  if (!state) {
    const route = ROUTES[0];
    return {
      header: HEADERS[route.key],
      navigation: {
        index: 0,
        routes: [route]
      }
    };
  }

  switch (action) {
    case 'push': {
      const route = ROUTES[state.index + 1];
      return {
        ...state,
        header: HEADERS[route.key],
        navigation: NavigationStateUtils.push(state, route)
      }
    }
    case 'pop': {
      const route = ROUTES[state.index - 1];
      return {
        ...state,
        header: HEADERS[route.key],
        navigation: NavigationStateUtils.pop(state)
      }
    }
  }

  return state;
}

class cheminotm extends Component {

  state: CheminotPropTypes.State

  header = {
    set: this._setHeader.bind(this),
    reset: this._resetHeader.bind(this)
  }

  navigation = {
    push: this._navigate.bind(this, 'push'),
    pop: this._navigate.bind(this, 'pop')
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = reducer();
    this._navigate = this._navigate.bind(this);
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButton.bind(this));
  }

  _handleBackButton() {
    this._navigate('pop');
    return true;
  }

  _navigate(action: string) {
    const { navigation: navigationState } = this.state;
    const nextState = reducer(navigationState, action);
    if(this.state !== nextState) {
      this.setState(nextState);
    }
  }

  _resetHeader() {
    this.setState({
      ...this.state,
      header: HEADERS[ROUTES[this.state.navigation.index].key]
    });
  }

  _setHeader(header: CheminotPropTypes.HeaderState) {
    this.setState({
      ...this.state,
      header: header
    });
  }

  _getContext() {
    return CheminotContext.props({
      navigation: this.navigation,
      header: this.header,
      cheminotState: this.state
    });
  }

  _renderScene(sceneProps: Object): ReactElement {
    switch(sceneProps.scene.route.key) {
      case 'home': return <Home {...this._getContext()} />;
      case 'newtrip': return <NewTrip {...this._getContext()} />;
      case 'trips': return <Trips {...this._getContext()} />;
    }
  }

  render(): ReactElement<any> {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent={true} />
        <Navigator
           {...this._getContext()}
           renderScene={this._renderScene.bind(this)} />
      </View>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
