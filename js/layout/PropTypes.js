import React, { PropTypes } from 'react';

import { NavigationState } from 'NavigationTypeDefinition';

const HeaderState = PropTypes.shape({
  back: PropTypes.bool,
  title: React.PropTypes.string
});

const State = PropTypes.shape({
  navigation: NavigationState,
  header: HeaderState.isRequired
});

export default {
  HeaderState: HeaderState,
  State: State
};
