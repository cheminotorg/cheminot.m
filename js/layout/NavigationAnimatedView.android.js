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
import { MKColor } from 'react-native-material-kit';

const {
  AnimatedView: NavigationAnimatedView,
  Card: NavigationCard,
  Header: NavigationHeader,
  Container: NavigationContainer
} = NavigationExperimental;

const styles = StyleSheet.create({
  animatedView: {
    flex: 1
  }
});

class CGTNavigationAnimatedView extends Component {

  static childContextTypes = {
    openDrawer: PropTypes.func,
    disableDrawer: PropTypes.func,
    enableDrawer: PropTypes.func
  };

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
        {...this.props}
      />
    )
  }

  _renderOverlay(props) {
    return (
      <NavigationHeader
      {...props}
      renderLeftComponent={(props: NavigationSceneRendererProps) => {
        if(props.scene.index > 0) {
          return <NavigationHeaderBackButton context={this.context} sceneIndex={props.scene.index} />;
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
        renderScene={this.props.router.bind(this)}
      />
    );
  }

  _onMenuPress(props) {
    this.context.openDrawer();
  }
}

NavigationAnimatedView.contextTypes = {
  openDrawer: PropTypes.func,
  disableDrawer: PropTypes.func,
  enableDrawer: PropTypes.func
};

module.exports = NavigationContainer.create(CGTNavigationAnimatedView);
