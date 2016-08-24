import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { MKColor } from 'react-native-material-kit';

const itemStyles = StyleSheet.create({
  circle: {
    backgroundColor: MKColor.Teal,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: 'white',
    fontSize: 10
  }
});

class WeekCalendarItem extends Component {

  render() {
    return (
      <View style={itemStyles.circle}>
        <Text style={itemStyles.text}>{this.props.children}</Text>
      </View>
    );
  }
}

export default class WeekCalendar extends Component {

  render() {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <WeekCalendarItem active={this.props.monday}>L</WeekCalendarItem>
        <WeekCalendarItem active={this.props.tuesday}>M</WeekCalendarItem>
        <WeekCalendarItem active={this.props.wednesday}>M</WeekCalendarItem>
        <WeekCalendarItem active={this.props.thursday}>J</WeekCalendarItem>
        <WeekCalendarItem active={this.props.friday}>V</WeekCalendarItem>
        <WeekCalendarItem active={this.props.saturday}>S</WeekCalendarItem>
        <WeekCalendarItem active={this.props.sunday}>D</WeekCalendarItem>
      </View>
    );
  }
}
