'use strict';

import React, { PropTypes } from 'react';
import CheminotPropTypes from './PropTypes';

function create(Component: ReactClass<any>): ReactClass & Object {

  class CheminotContextComponent extends React.Component {
    render() {
      const navigation = this.context.navigation || this.props.navigation;
      const cheminotState = this.context.cheminotState || this.props.cheminotState;
      return <Component {...this.props} navigation={navigation} cheminotState={cheminotState} />;
    }
  }

  CheminotContextComponent.contextTypes = {
    state: CheminotPropTypes.State,
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func
    })
  };

  CheminotContextComponent.childContextTypes = {
    state: CheminotPropTypes.State,
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func
    })
  };

  return CheminotContextComponent;
}

function props(p) {
  const {navigation, cheminotState} = p;
  return {
    cheminotState: cheminotState,
    navigation: navigation
  }
}

export default {
  create: create,
  props: props
};
