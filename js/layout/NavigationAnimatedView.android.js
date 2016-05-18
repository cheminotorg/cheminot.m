'use strict';

import React, {
  Component,
  NavigationExperimental,
  StyleSheet,
  Text,
  View,
  PropTypes
} from 'react-native';

import NavigationHeaderMenuButton from './NavigationHeaderMenuButton';
import NavigationHeaderBackButton from './NavigationHeaderBackButton';
import DrawerContainer from './DrawerContainer';
import NavigationRootBackAndroid from './NavigationRootBackAndroid';
import { MKColor } from 'react-native-material-kit';

const {
  AnimatedView: NavigationAnimatedView,
  Card: NavigationCard,
  Header: NavigationHeader,
  Container: NavigationContainer,
  RootContainer: NavigationRootContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  animatedView: {
    flex: 1
  }
});

class CGTNavigationAnimatedView extends Component {

  componentWillMount() {
    this._renderOverlay = this._renderOverlay.bind(this);
    this._renderCard = this._renderCard.bind(this);
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
          if(props.scene.index > 0) {
            return <NavigationHeaderBackButton {...props} />;
          } else {
            return <NavigationHeaderMenuButton onPress={this._onMenuPress.bind(this)}/>;
          }
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
        renderScene={this.props.renderScene.bind(this)}
      />
    );
  }

  _onMenuPress(props) {
    this.context.openDrawer();
  }
}

module.exports = DrawerContainer.create(NavigationContainer.create(CGTNavigationAnimatedView));
