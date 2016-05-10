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
  BackAndroid,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Platform
} from 'react-native';

import { MKButton, MKColor } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

/// -- Back button

let NavigationHeaderBackButton = (props: Props) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      height: 24,
      width: 24,
      margin: Platform.OS === 'ios' ? 10 : 16,
      resizeMode: 'contain'
    }
  });
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={() => props.onNavigate(NavigationRootContainer.getBackAction())}>
      <View style={styles.button}>
        <Icon name="arrow-back" size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

NavigationHeaderBackButton = NavigationContainer.create(NavigationHeaderBackButton);

/// -- Fab button

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
        <StatusBar backgroundColor="#2F3E9E" barStyle="light-content" />
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
        renderLeftComponent={(props: NavigationSceneRendererProps) => {
          return props.scene.index > 0 ? <NavigationHeaderBackButton /> : null;
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
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', position: 'absolute', left: 0, right: 0, bottom: 64 }}>
        <MKFabButton onPress={this._onNewTripTap.bind(this, props)}>
          <Icon name="add" size={24} color="#FFF" />
        </MKFabButton>
      </View>
    );
  }

  _onNewTripTap(props) {
    props.onNavigate({
      type: 'push',
      key: `scene_${props.scenes.length}`,
      label: `Route #${props.scenes.length}`
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
