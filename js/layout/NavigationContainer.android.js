'use strict';

const React = require('React');

function createNavigationContainer(
  Component: ReactClass<any>,
): ReactClass & Object {
  class NavigationComponent extends React.Component {
    render() {
      return (
        <Component
        onNavigate={this.getNavigationHandler()}
        {...this.props}
        />
      );
    }
    getNavigationHandler() {
      return this.props.onNavigate || this.context.onNavigate;
    }
    getChildContext() {
      return {
        onNavigate: this.getNavigationHandler(),
      };
    }
  }
  NavigationComponent.contextTypes = {
    onNavigate: React.PropTypes.func,
  };
  NavigationComponent.childContextTypes = {
    onNavigate: React.PropTypes.func,
  };
  return NavigationComponent;
}

const NavigationContainer = {
  create: createNavigationContainer
};


module.exports = NavigationContainer;
