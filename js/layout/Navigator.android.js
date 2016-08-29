import React, { Component } from 'react';
import { NavigationExperimental, View, Text, StyleSheet } from 'react-native';
import { MKColor } from 'react-native-material-kit';
import HeaderBackButton from './HeaderBackButton';
import CheminotContext from './ContextContainer';

const {
  CardStack: NavigationCardStack,
  Header: NavigationHeader
} = NavigationExperimental;

const styles = StyleSheet.create({
  navigator: {
    flex: 1,
  }
});

export default class Navigator extends React.Component {

  constructor(props: any, context: any) {
    super(props, context);
  }

  _renderHeader(sceneProps: Object): ReactElement {
    return <Header {...CheminotContext.props(this.props)} {...sceneProps} />;
  }

  render(): ReactElement {
    return (
      <NavigationCardStack
         onNavigateBack={this._onPopRoute}
         navigationState={this.props.cheminotState.navigation}
         renderHeader={this._renderHeader.bind(this)}
         renderScene={this.props.renderScene.bind(this)}
         style={styles.navigator} />
    );
  }
}

class Header extends React.Component {

  _renderLeft(): ReactElement {
    if(this.props.cheminotState.header.back) {
      return <HeaderBackButton onPress={this._onBackButtonPressed.bind(this)} />;
    } else {
      return this.props.cheminotState.header.left;
    }
  }

  _renderRight(): ReactElement {
    return this.props.cheminotState.header.right;
  }

  _onBackButtonPressed() {
    this.props.navigation.pop();
  }

  _renderTitle(): ReactElement {
    return (
      <NavigationHeader.Title textStyle={{color: '#FFF'}}>
        {this.props.cheminotState.header.title}
      </NavigationHeader.Title>
    );
  }

  render(): ReactElement {
    return (
      <NavigationHeader
         style={{backgroundColor: MKColor.Indigo}}
         renderLeftComponent={this._renderLeft.bind(this)}
         renderRightComponent={this._renderRight.bind(this)}
         renderTitleComponent={this._renderTitle.bind(this)}
         {...this.props}
      />
    );
  }
}
