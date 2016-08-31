'use strict';

import React, { PropTypes } from 'react';
import CheminotPropTypes from './PropTypes';

function create(Component: ReactClass<any>): ReactClass & Object {

  class CheminotContextComponent extends React.Component {
    render() {
      const header = this.context.header || this.props.header;
      const navigation = this.context.navigation || this.props.navigation;
      const cheminotState = this.context.cheminotState || this.props.cheminotState;
      return <Component
               {...this.props}
               navigation={navigation}
               header={header}
               cheminotState={cheminotState} />;
    }
  }

  CheminotContextComponent.contextTypes = {
    state: CheminotPropTypes.State,
    header: React.PropTypes.shape({
      set: React.PropTypes.func
    }),
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func
    })
  };

  CheminotContextComponent.childContextTypes = {
    state: CheminotPropTypes.State,
    header: React.PropTypes.shape({
      set: React.PropTypes.func
    }),
    navigation: React.PropTypes.shape({
      push: React.PropTypes.func,
      pop: React.PropTypes.func,
      rewind: React.PropTypes.func
    })
  };

  return CheminotContextComponent;
}

function props(p) {
  const {navigation, header, cheminotState} = p;
  return {
    cheminotState: cheminotState,
    navigation: navigation,
    header: header
  }
}

export default {
  create: create,
  props: props
};
