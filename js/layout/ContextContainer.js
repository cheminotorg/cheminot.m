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
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func
    })
  };

  CheminotContextComponent.childContextTypes = {
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func
    })
  };

  return CheminotContextComponent;
}

function props(navigate) {
  return {
    navigation: {
      push: navigate.bind(null, 'push'),
      pop: navigate.bind(null, 'pop')
    },
    header: {

    }
  }
}

export default {
  create: create,
  props: props
};
