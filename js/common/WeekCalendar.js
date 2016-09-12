import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MKColor } from 'react-native-material-kit';

function createItemStyles(active) {
  const style = {
    circle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 10,
    },
  };

  const activeStyle = {
    circle: {
      backgroundColor: MKColor.Teal,
    },
    text: {
      color: 'white',
    },
  };

  const inactiveStyle = {
    circle: {
      borderColor: MKColor.Teal,
      borderWidth: 1,
    },
    text: {
      color: 'black',
    },
  };

  if (active) {
    Object.assign(style.circle, activeStyle.circle);
    Object.assign(style.text, activeStyle.text);
  } else {
    Object.assign(style.circle, inactiveStyle.circle);
    Object.assign(style.text, inactiveStyle.text);
  }

  return StyleSheet.create(style);
}

const WeekCalendarItem = (props) => {
  const itemStyles = createItemStyles(props.active || false);
  return (
    <TouchableOpacity style={itemStyles.circle} onPress={props.onPress}>
      <Text style={itemStyles.text}>{props.children}</Text>
    </TouchableOpacity>
  );
};

const WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

const ALL_DAYS = Object.keys(WEEK).reduce((acc, key) => {
  acc[WEEK[key]] = true;
  return acc;
}, {});

export default class WeekCalendar extends Component {

  static ALL = ALL_DAYS;

  state = {
    [WEEK.MONDAY]: false,
    [WEEK.TUESDAY]: false,
    [WEEK.WEDNESDAY]: false,
    [WEEK.THURSDAY]: false,
    [WEEK.FRIDAY]: false,
    [WEEK.SATURDAY]: false,
    [WEEK.SUNDAY]: false,
  }

  constructor(props, context) {
    super(props, context);
    this._onMondayPressed = this._onMondayPressed.bind(this);
    this._onTuesdayPressed = this._onTuesdayPressed.bind(this);
    this._onWednesdayPressed = this._onWednesdayPressed.bind(this);
    this._onThursdayPressed = this._onThursdayPressed.bind(this);
    this._onFridayPressed = this._onFridayPressed.bind(this);
    this._onSaturdayPressed = this._onSaturdayPressed.bind(this);
    this._onSundayPressed = this._onSundayPressed.bind(this);
  }

  componentWillMount() {
    this.setState({
      [WEEK.MONDAY]: this.props.days[WEEK.MONDAY],
      [WEEK.TUESDAY]: this.props.days[WEEK.TUESDAY],
      [WEEK.WEDNESDAY]: this.props.days[WEEK.WEDNESDAY],
      [WEEK.THURSDAY]: this.props.days[WEEK.THURSDAY],
      [WEEK.FRIDAY]: this.props.days[WEEK.FRIDAY],
      [WEEK.SATURDAY]: this.props.days[WEEK.SATURDAY],
      [WEEK.SUNDAY]: this.props.days[WEEK.SUNDAY],
    });
  }

  _setWeekState(day) {
    const nextState = {
      ...this.state,
      ...{ [day]: !this.state[day] },
    };
    this.setState(nextState);
    return nextState;
  }

  _onMondayPressed() {
    const nextState = this._setWeekState(WEEK.MONDAY);
    this.props.onPress(WEEK.MONDAY, nextState);
  }

  _onTuesdayPressed() {
    const nextState = this._setWeekState(WEEK.TUESDAY);
    this.props.onPress(WEEK.TUESDAY, nextState);
  }

  _onWednesdayPressed() {
    const nextState = this._setWeekState(WEEK.WEDNESDAY);
    this.props.onPress(WEEK.WEDNESDAY, nextState);
  }

  _onThursdayPressed() {
    const nextState = this._setWeekState(WEEK.THURSDAY);
    this.props.onPress(WEEK.THURSDAY, nextState);
  }

  _onFridayPressed() {
    const nextState = this._setWeekState(WEEK.FRIDAY);
    this.props.onPress(WEEK.FRIDAY, nextState);
  }

  _onSaturdayPressed() {
    const nextState = this._setWeekState(WEEK.SATURDAY);
    this.props.onPress(WEEK.SATURDAY, nextState);
  }

  _onSundayPressed() {
    const nextState = this._setWeekState(WEEK.SUNDAY);
    this.props.onPress(WEEK.SUNDAY, nextState);
  }

  _renderDays() {
    const week = {
      monday: (
        <WeekCalendarItem
          key={WEEK.MONDAY}
          onPress={this._onMondayPressed}
          active={this.state[WEEK.MONDAY]}
        >L</WeekCalendarItem>
      ),
      tuesday: (
        <WeekCalendarItem
          key={WEEK.TUESDAY}
          onPress={this._onTuesdayPressed}
          active={this.state[WEEK.TUESDAY]}
        >M</WeekCalendarItem>
      ),
      wednesday: (
        <WeekCalendarItem
          key={WEEK.WEDNESDAY}
          onPress={this._onWednesdayPressed}
          active={this.state[WEEK.WEDNESDAY]}
        >M</WeekCalendarItem>
      ),
      thursday: (
        <WeekCalendarItem
          key={WEEK.THURSDAY}
          onPress={this._onThursdayPressed}
          active={this.state[WEEK.THURSDAY]}
        >J</WeekCalendarItem>
      ),
      friday: (
        <WeekCalendarItem
          key={WEEK.FRIDAY}
          onPress={this._onFridayPressed}
          active={this.state[WEEK.FRIDAY]}
        >V</WeekCalendarItem>
      ),
      saturday: (
        <WeekCalendarItem
          key={WEEK.SATURDAY}
          onPress={this._onSaturdayPressed}
          active={this.state[WEEK.SATURDAY]}
        >S</WeekCalendarItem>
      ),
      sunday: (
        <WeekCalendarItem
          key={WEEK.SUNDAY}
          onPress={this._onSundayPressed}
          active={this.state[WEEK.SUNDAY]}
        >D</WeekCalendarItem>
      ),
    };

    return Object.keys(week)
      .filter((day) => (this.props.days ? this.props.days[day] : true))
      .map((day) => week[day]);
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {this._renderDays()}
      </View>
    );
  }
}
