import React, { PropTypes } from 'react';

import { NavigationState } from 'NavigationTypeDefinition';

const HeaderState = PropTypes.shape({
  back: PropTypes.bool,
  title: React.PropTypes.string,
  left: React.PropTypes.node,
  right: React.PropTypes.node
});

const State = PropTypes.shape({
  navigation: NavigationState,
  header: HeaderState
});

export default {
  HeaderState: HeaderState,
  State: State
};
