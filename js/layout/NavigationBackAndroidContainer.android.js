'use strict';

import React, {
  PropTypes
}from 'react-native';

function create(Component: ReactClass<any>): ReactClass & Object {

  class NavigationBackAndroidComponent extends React.Component {
    render() {
      return (
        <Component
          addBackButtonListener={this._getAddBackButtonListener()}
          removeBackButtonListener={this._getRemoveBackButtonListener()}
          {...this.props}
        />
      );
    }

    _getAddBackButtonListener() {
      return this.props.addBackButtonListener || this.context.addBackButtonListener;
    }

    _getRemoveBackButtonListener() {
      return this.props.removeBackButtonListener || this.context.removeBackButtonListener;
    }

    getChildContext() {
      return {
        addBackButtonListener: this._getAddBackButtonListener(),
        removeBackButtonListener: this._getRemoveBackButtonListener()
      };
    }
  }

  NavigationBackAndroidComponent.contextTypes = {
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func
  };

  NavigationBackAndroidComponent.childContextTypes = {
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func
  };

  return NavigationBackAndroidComponent;
}

module.exports = {
  create: create
};
