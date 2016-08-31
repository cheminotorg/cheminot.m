
import React, { Component } from 'react';

import {
  AppRegistry,
  View,
  StatusBar,
  BackAndroid,
  NavigationExperimental,
} from 'react-native';

const { StateUtils: NavigationStateUtils } = NavigationExperimental;

import Navigator from './js/layout/Navigator';
import Home from './js/home/Home';
import Trips from './js/trips/Trips';
import NewTrip from './js/newtrip/NewTrip';
import Locale from './js/locale';
import CheminotContext from './js/layout/ContextContainer';
import CheminotPropTypes from './js/layout/PropTypes';

Locale.init();

const HEADERS = {
  home: { title: 'Cheminot' },
  newtrip: { title: 'Route A', back: true },
  trips: { title: 'Route B', back: true },
};

const ROUTES = [
  { key: 'home' },
  { key: 'newtrip' },
  { key: 'trips' },
];

function reducer(state: ?CheminotPropTypes.State, action: any): CheminotPropTypes.State {
  if (!state) {
    const route = ROUTES[0];
    return {
      header: HEADERS[route.key],
      navigation: {
        index: 0,
        routes: [route],
      },
    };
  }

  switch (action.type) {
    case 'rewind': {
      const index = NavigationStateUtils.indexOf(state, action.key);
      const updatedRoutes = state.routes.slice(0, index + 1);
      return {
        ...state,
        header: HEADERS[action.key],
        navigation: NavigationStateUtils.reset(state, updatedRoutes, index)
      };
    }
    case 'push': {
      const route = ROUTES[state.index + 1];
      return {
        ...state,
        header: HEADERS[route.key],
        navigation: NavigationStateUtils.push(state, route),
      };
    }
    case 'pop': {
      const route = ROUTES[state.index - 1];
      return {
        ...state,
        header: HEADERS[route.key],
        navigation: NavigationStateUtils.pop(state),
      };
    }
    default: {
      return state;
    }
  }
}

class cheminotm extends Component {

  state: CheminotPropTypes.State

  header = {
    set: this._setHeader.bind(this),
    reset: this._resetHeader.bind(this)
  }

  navigation = {
    rewind: (key) => this._navigate({type: 'rewind', key: key}),
    push: this._navigate.bind(this, {type: 'push'}),
    pop: this._navigate.bind(this, {type: 'pop'})
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
    this.navigation.pop();
    return true;
  }

  _navigate(action: string) {
    const { navigation: navigationState } = this.state;
    const nextState = reducer(navigationState, action);
    if (this.state !== nextState) {
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
      header: header,
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
    console.log('index.renderScene');
    switch(sceneProps.scene.route.key) {
      case 'home': return <Home {...this._getContext()} />;
      case 'newtrip': return <NewTrip {...this._getContext()} />;
      case 'trips': return <Trips {...this._getContext()} />;
    }
  }

  render(): ReactElement<any> {
    console.log('index.render');
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" />
        <Navigator
           {...this._getContext()}
           renderScene={this._renderScene.bind(this)} />
      </View>
    );
  }
}

AppRegistry.registerComponent('cheminotm', () => cheminotm);
