import React, { Component } from 'react';
import { NavigationExperimental, View, Text, StyleSheet } from 'react-native';
import { MKColor } from 'react-native-material-kit';
import HeaderBackButton from './HeaderBackButton';

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

  _renderOverlay(sceneProps: Object): ReactElement {
    return <Header navigation={this.props.navigation} {...sceneProps} />;
  }

  render(): ReactElement {
    return (
      <NavigationCardStack
         onNavigateBack={this._onPopRoute}
         navigationState={this.props.navigationState}
         renderOverlay={this._renderOverlay.bind(this)}
         renderScene={this.props.renderScene.bind(this)}
         style={styles.navigator} />
    );
  }
}

class Header extends React.Component {

  _renderLeft(): ReactElement {
    return <HeaderBackButton onPress={this._onBackButtonPressed.bind(this)} />;
  }

  _onBackButtonPressed() {
    this.props.navigation.pop();
  }

  _renderTitle(): ReactElement {
    return (
      <NavigationHeader.Title textStyle={{ color: '#FFF'}}>
        {'Cheminot'}
      </NavigationHeader.Title>
    );
  }

  render(): ReactElement {
    return (
      <NavigationHeader
         style={{backgroundColor: MKColor.Indigo}}
         renderLeftComponent={this._renderLeft.bind(this)}
         renderTitleComponent={this._renderTitle}
         {...this.props}
      />
    );
  }
}
