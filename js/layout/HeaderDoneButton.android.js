'use strict';

import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderButton from './HeaderButton';

export default class HeaderBackButton extends React.Component {

  render() {

    return (
      <HeaderButton onPress={this.props.onPress}>
        <Icon name="done" size={24} color="#FFF" />
      </HeaderButton>
    );
  }
}
