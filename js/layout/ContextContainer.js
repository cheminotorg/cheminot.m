'use strict';

import React, { PropTypes } from 'react';

function create(Component: ReactClass<any>): ReactClass & Object {

  class CheminotContextComponent extends React.Component {
    render() {
      const navigate = this.context.navigate || this.props.navigate;
      return <Component {...this.props} navigate={navigate} />;
    }
  }

  CheminotContextComponent.contextTypes = {
    navigate: PropTypes.func
  };

  CheminotContextComponent.childContextTypes = {
    navigate: PropTypes.func
  };

  return CheminotContextComponent;
}

module.exports = {
  create: create
};
