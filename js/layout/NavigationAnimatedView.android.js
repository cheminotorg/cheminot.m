'use strict';

import React, { Component } from 'react';
import {
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
import NavigationBackAndroidContainer from './NavigationBackAndroidContainer';
import NavigationHeaderContainer from './NavigationHeaderContainer';
import NavigationContainer from './NavigationContainer';
import { MKColor } from 'react-native-material-kit';

const {
  AnimatedView: NavigationAnimatedView,
  Card: NavigationCard,
  Header: NavigationHeader
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
        header={this.props.header}
      />
    )
  }

  _renderOverlay(props) {
    const header = this.props.getHeader(props.scene.route.key)
    return (
      <NavigationHeader
        {...props}
        renderLeftComponent={(props: NavigationSceneRendererProps) => {
          if(props.scene.index > 0) {
            return header.left || <NavigationHeaderBackButton {...props} />;
          } else {
            return header.right || <NavigationHeaderMenuButton onPress={this._onMenuPress.bind(this)}/>;
          }
        }}
        style={{backgroundColor: MKColor.Indigo}}
        renderTitleComponent={this._renderTitleComponent}
      />
    );
  }

  _renderTitleComponent(props) {
    const header = this.props.getHeader(props.scene.route.key)
    return (
      <NavigationHeader.Title textStyle={{ color: '#FFF'}}>
        {header.title}
      </NavigationHeader.Title>
    );
  }

  _renderCard(props) {
    return (
      <NavigationCard
        {...props}
        key={`card_${props.scene.route.key}`}
        renderScene={this.props.renderScene.bind(this)}
      />
    );
  }

  _onMenuPress() {
    this.props.openDrawer();
  }
}

module.exports = NavigationHeaderContainer.create(NavigationBackAndroidContainer.create(DrawerContainer.create(NavigationContainer.create(CGTNavigationAnimatedView))));
