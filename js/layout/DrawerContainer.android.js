'use strict';

import React, {
  PropTypes
}from 'react-native';

function create(Component: ReactClass<any>): ReactClass & Object {

  class DrawerComponent extends React.Component {
    render() {
      return (
        <Component
          openDrawer={this._getOpenDrawerHandler()}
          disableDrawer={this._getDisableDrawerHandler()}
          enableDrawer={this._getEnableDrawerHandler()}
          {...this.props}
        />
      );
    }

    _getOpenDrawerHandler() {
      return this.props.openDrawer || this.context.openDrawer;
    }

    _getDisableDrawerHandler() {
      return this.props.disableDrawer || this.context.disableDrawer;
    }

    _getEnableDrawerHandler() {
      return this.props.enableDrawer || this.context.enableDrawer;
    }

    getChildContext() {
      return {
        openDrawer: this._getOpenDrawerHandler(),
        disableDrawer: this._getDisableDrawerHandler(),
        enableDrawer: this._getEnableDrawerHandler()
      };
    }
  }

  DrawerComponent.contextTypes = {
    openDrawer: PropTypes.func,
    disableDrawer: PropTypes.func,
    enableDrawer: PropTypes.func
  };

  DrawerComponent.childContextTypes = {
    openDrawer: PropTypes.func,
    disableDrawer: PropTypes.func,
    enableDrawer: PropTypes.func
  };

  return DrawerComponent;
}

module.exports = {
  create: create
};
