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

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheminotmDrawer from './js/layout/drawer';
import NavigationHeaderMenuButton from './js/layout/NavigationHeaderMenuButton';
import NavigationHeaderBackButton from './js/layout/NavigationHeaderBackButton';
import Home from './js/home';

const {
  AnimatedView: NavigationAnimatedView,
  Card: NavigationCard,
  Header: NavigationHeader,
  Reducer: NavigationReducer,
  Container: NavigationContainer,
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


class cheminotm extends Component {

  componentWillMount() {
    this._renderNavigation = this._renderNavigation.bind(this);
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButtonPress.bind(this));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
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

  _renderNavigation(navigationState, onNavigate) {
    if (!navigationState) return null;
    return (
      <CheminotmDrawer>
        <View style={{backgroundColor: MKColor.Indigo, height: 24, top: 0}} />
        <CheminotNavigationAnimatedView navigationState={navigationState} />
      </CheminotmDrawer>
    );
  }
}


class CheminotNavigationAnimatedView extends Component {

  static childContextTypes = {
    openDrawer: PropTypes.func,
    disableDrawer: PropTypes.func,
    enableDrawer: PropTypes.func
  };

  componentWillMount() {
    this._renderOverlay = this._renderOverlay.bind(this);
    this._renderCard = this._renderCard.bind(this);
    this._renderScene = this._renderScene.bind(this);
    this._renderTitleComponent = this._renderTitleComponent.bind(this);
  }

  render() {
    return (
      <NavigationAnimatedView
        navigationState={this.props.navigationState}
        style={styles.animatedView}
        renderOverlay={this._renderOverlay}
        renderScene={this._renderCard}
      />
    )
  }

  _renderOverlay(props) {
    return (
      <NavigationHeader
      {...props}
      renderLeftComponent={(props: NavigationSceneRendererProps) => {
        return props.scene.index > 0 ? <NavigationHeaderBackButton context={this.context} sceneIndex={props.scene.index} /> : <NavigationHeaderMenuButton onPress={this._onMenuPress.bind(this)}/>;
      }}
      style={{backgroundColor: MKColor.Indigo}}
      renderTitleComponent={this._renderTitleComponent}
      />
    );
  }

  _renderTitleComponent(props) {
    return (
      <NavigationHeader.Title textStyle={{ color: '#FFF'}}>
      {props.scene.navigationState.label}
      </NavigationHeader.Title>
    );
  }

  _renderCard(props) {
    return (
      <NavigationCard
      {...props}
      key={'card_' + props.scene.navigationState.key}
      renderScene={this._renderScene}
      />
    );
  }

  _renderScene(props) {
    switch(props.scene.navigationState.key) {
      case 'home': {
        return <Home onPress={this._onNewTripPress.bind(this, props)} />;
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

  _onNewTripPress(props) {
    this.context.disableDrawer();
    props.onNavigate({
      type: 'push',
      key: `scene_${props.scenes.length}`,
      label: `Route #${props.scenes.length}`
    });
  }

  _onMenuPress(props) {
    this.context.openDrawer();
  }
}

CheminotNavigationAnimatedView.contextTypes = {
  openDrawer: PropTypes.func,
  disableDrawer: PropTypes.func,
  enableDrawer: PropTypes.func
};

const styles = StyleSheet.create({
  animatedView: {
    flex: 1,
  },
  scrollView: {
    marginTop: NavigationHeader.HEIGHT,
  },
});

AppRegistry.registerComponent('cheminotm', () => cheminotm);
