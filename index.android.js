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
  Platform,
  Image,
  DrawerLayoutAndroid,
  PropTypes
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

const backButtonStyles = StyleSheet.create({
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

export class NavigationHeaderBackButton extends Component {

  onBackButtonPress() {
    this.props.context.enableDrawer();
    this.props.onNavigate(NavigationRootContainer.getBackAction())
  }

  render() {
    return (
      <TouchableOpacity style={backButtonStyles.buttonContainer} onPress={this.onBackButtonPress.bind(this)}>
        <View style={backButtonStyles.button}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }
}

NavigationHeaderBackButton = NavigationContainer.create(NavigationHeaderBackButton);

/// -- Header button

let NavigationHeaderMenuButton = (props: Props) => {
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
    <TouchableOpacity style={styles.buttonContainer} {...props}>
      <View style={styles.button}>
        <Icon name="menu" size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

NavigationHeaderBackButton = NavigationContainer.create(NavigationHeaderBackButton);

/// -- Fab button

const MKFabButton = MKButton.plainFab()
                            .withBackgroundColor(MKColor.Teal)
                            .build();

/// -- Drawer

export default class CheminotmDrawer extends Component {

  state = {
    disabled: false
  };

  static childContextTypes = {
    openDrawer: PropTypes.func,
    disableDrawer: PropTypes.func,
    enableDrawer: PropTypes.func
  };

  getChildContext(): Object {
    return {
      disableDrawer: this.disableDrawer.bind(this),
      enableDrawer: this.enableDrawer.bind(this),
      openDrawer: this.openDrawer.bind(this)
    };
  }

  disableDrawer() {
    this.setState({
      disabled: true
    });
  }

  enableDrawer() {
    this.setState({
      disabled: false
    });
  }

  openDrawer() {
    this._drawer.openDrawer();
  }

  renderNavigationView() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Text style={{margin: 10, fontSize: 15, textAlign: 'left', color: MKColor.Grey, top: 24}}>I m in the Drawer!</Text>
      </View>
    );
  }

  render() {
   return (
     <DrawerLayoutAndroid
       ref={drawer => { this._drawer = drawer; }}
       drawerWidth={290}
       drawerPosition={DrawerLayoutAndroid.positions.Left}
       onDrawerOpen={this.onDrawerOpen}
       onDrawerClose={this.onDrawerClose}
       drawerLockMode={this.state.disabled ? 'locked-closed' : 'unlocked'}
       renderNavigationView={this.renderNavigationView}
       {...this.props}
       >
       <View style={{flex: 1, backgroundColor: 'white'}}>
         {this.props.children}
       </View>
      </DrawerLayoutAndroid>
   );
  }
}

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
        return (
          <View style={{flex: 1, paddingTop: 56, justifyContent: 'space-around', alignItems: 'center'}}>
            <Image source={require('./empty.png')} />
            <View>
              <MKFabButton onPress={this._onNewTripPress.bind(this, props)}>
                <Icon name="add" size={24} color="#FFF" />
              </MKFabButton>
            </View>
          </View>
        );
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
  disableDrawer: PropTypes.func
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
