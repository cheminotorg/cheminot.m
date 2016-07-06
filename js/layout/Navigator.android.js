import React, { Component } from 'react';
import { NavigationExperimental, View, Text, StyleSheet } from 'react-native';
import { MKColor } from 'react-native-material-kit';
import NavigationHeaderMenuButton from './NavigationHeaderMenuButton';

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
    this._onPushRoute = this.props.navigate.bind(null, 'push');
    this._onPopRoute = this.props.navigate.bind(null, 'pop');
  }

  _renderOverlay(sceneProps: Object): ReactElement {
    return <Header {...sceneProps} />;
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
    return <NavigationHeaderMenuButton onPress={() => console.log('here') } />;
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
         renderLeftComponent={this._renderLeft}
         renderTitleComponent={this._renderTitle}
         {...this.props}
      />
    );
  }
}
