/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  NavigationExperimental,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {
  AnimatedView: NavigationAnimatedView,
  Card: NavigationCard,
  Header: NavigationHeader,
  Reducer: NavigationReducer,
  RootContainer: NavigationRootContainer,
} = NavigationExperimental;

const navigationReducer = NavigationReducer.StackReducer({
  getPushedReducerForAction: (action) => {
    if (action.type === 'push') {
      return (state) => state || {key: action.key};
    }
    return null;
  },
  getReducerForState: (initialState) => (state) => state || initialState,
  initialState: {
    key: 'cheminotm',
    index: 0,
    children: [
      {key: 'home'},
    ],
  },
});

const MKFabButton = MKButton.plainFab()
                            .withBackgroundColor(MKColor.Teal)
                            .build();

class cheminotm extends Component {

  componentWillMount() {
    this._renderNavigation = this._renderNavigation.bind(this);
    this._renderOverlay = this._renderOverlay.bind(this);
    this._renderCard = this._renderCard.bind(this);
    this._renderScene = this._renderScene.bind(this);
    this._renderTitleComponent = this._renderTitleComponent.bind(this);
  }

  render() {
    return (
      <NavigationRootContainer
        reducer={navigationReducer}
        ref={navRootContainer => { this._navRootContainer = navRootContainer; }}
        persistenceKey="cheminotm"
        renderNavigation={this._renderNavigation}
      />
    );
  }

  _renderNavigation(navigationState, onNavigate) {
    if (!navigationState) return null;
    return (
      <NavigationAnimatedView
        navigationState={navigationState}
        style={styles.animatedView}
        renderOverlay={this._renderOverlay}
        applyAnimation={(pos, navState) => {
          Animated.timing(pos, {toValue: navState.index, duration: 500}).start();
        }}
        renderScene={this._renderCard}
      />
    );
  }

  _renderOverlay(props) {
    return (
      <NavigationHeader
      {...props}
      renderTitleComponent={this._renderTitleComponent}
      />
    );
  }

  _renderTitleComponent(props) {
    return (
      <NavigationHeader.Title>
      {props.scene.navigationState.key}
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
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', position: 'absolute', left: 0, right: 0, bottom: 66 }}>
        <MKFabButton onPress={this._onNewTripTap.bind(this, props)}>
          <Icon name="add" size={24} color="#FFF" />
        </MKFabButton>
      </View>
    );
  }

  _onNewTripTap(props) {
    props.onNavigate({
      type: 'push',
      key: 'Route #' + props.scenes.length,
    });
  }
}

const styles = StyleSheet.create({
  animatedView: {
    flex: 1,
  },
  scrollView: {
    marginTop: NavigationHeader.HEIGHT,
  },
});

AppRegistry.registerComponent('cheminotm', () => cheminotm);
