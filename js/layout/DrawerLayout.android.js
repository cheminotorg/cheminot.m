'use strict';

import React, {
  Component,
  Text,
  View,
  DrawerLayoutAndroid,
  PropTypes
} from 'react-native';

import { MKColor } from 'react-native-material-kit';
import NavigationAnimatedView from './NavigationAnimatedView';

export default class DrawerLayout extends Component {

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
