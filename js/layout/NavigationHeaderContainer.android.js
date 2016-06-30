'use strict';

import React, { PropTypes } from 'react';

function create(Component: ReactClass<any>): ReactClass & Object {

  class HeaderComponent extends React.Component {
    render() {
      return (
        <Component
          setHeader={this._getSetHeaderHandler()}
          getHeader={this._getGetHeaderHandler()}
          {...this.props}
        />
      );
    }

    _getSetHeaderHandler() {
      return this.props.setHeader || this.context.setHeader;
    }

    _getGetHeaderHandler() {
      return this.props.getHeader || this.context.getHeader;
    }

    getChildContext() {
      return {
        setHeader: this._getSetHeaderHandler(),
        getHeader: this._getGetHeaderHandler()
      };
    }
  }

  HeaderComponent.contextTypes = {
    setHeader: PropTypes.func,
    getHeader: PropTypes.func
  };

  HeaderComponent.childContextTypes = {
    setHeader: PropTypes.func,
    getHeader: PropTypes.func
  };

  return HeaderComponent;
}

module.exports = {
  create: create
};
