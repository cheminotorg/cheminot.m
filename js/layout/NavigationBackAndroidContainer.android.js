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
          triggerBackButton={this._getTriggerBackButton()}
          onNavigate={this._getOnNavigate()}
          {...this.props}
        />
      );
    }

    _getOnNavigate() {
      const onNavigate = this.props.onNavigate || this.context.onNavigate;
      return (action) => {
        if(action.type === 'back') {
          this._getTriggerBackButton()();
        }
        onNavigate(action);
      }
    }

    _getAddBackButtonListener() {
      return this.props.addBackButtonListener || this.context.addBackButtonListener;
    }

    _getRemoveBackButtonListener() {
      return this.props.removeBackButtonListener || this.context.removeBackButtonListener;
    }

    _getTriggerBackButton() {
      return this.props.triggerBackButton || this.context.triggerBackButton;
    }

    getChildContext() {
      return {
        addBackButtonListener: this._getAddBackButtonListener(),
        removeBackButtonListener: this._getRemoveBackButtonListener(),
        triggerBackButton: this._getTriggerBackButton()
      };
    }
  }

  NavigationBackAndroidComponent.contextTypes = {
    onNavigate: PropTypes.func,
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func,
    triggerBackButton: PropTypes.func
  };

  NavigationBackAndroidComponent.childContextTypes = {
    addBackButtonListener: PropTypes.func,
    removeBackButtonListener: PropTypes.func,
    triggerBackButton: PropTypes.func
  };

  return NavigationBackAndroidComponent;
}

module.exports = {
  create: create
};
