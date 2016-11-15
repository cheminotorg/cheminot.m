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
  if (props.disabled) {
    return (
      <View style={itemStyles.circle} onPress={props.onPress}>
        <Text style={itemStyles.text}>{props.children}</Text>
      </View>
    );
  } else {
    return (
      <TouchableOpacity style={itemStyles.circle} onPress={props.onPress}>
        <Text style={itemStyles.text}>{props.children}</Text>
      </TouchableOpacity>
    );
  }
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

  static merge(calendarA, calendarB) {
    return {
      [WEEK.MONDAY]: calendarA[WEEK.MONDAY] && calendarB[WEEK.MONDAY],
      [WEEK.TUESDAY]: calendarA[WEEK.TUESDAY] && calendarB[WEEK.TUESDAY],
      [WEEK.WEDNESDAY]: calendarA[WEEK.WEDNESDAY] && calendarB[WEEK.WEDNESDAY],
      [WEEK.THURSDAY]: calendarA[WEEK.THURSDAY] && calendarB[WEEK.THURSDAY],
      [WEEK.FRIDAY]: calendarA[WEEK.FRIDAY] && calendarB[WEEK.FRIDAY],
      [WEEK.SATURDAY]: calendarA[WEEK.SATURDAY] && calendarB[WEEK.SATURDAY],
      [WEEK.SUNDAY]: calendarA[WEEK.SUNDAY] && calendarB[WEEK.SUNDAY],
    };
  }

  state = {
    week: {
      [WEEK.MONDAY]: false,
      [WEEK.TUESDAY]: false,
      [WEEK.WEDNESDAY]: false,
      [WEEK.THURSDAY]: false,
      [WEEK.FRIDAY]: false,
      [WEEK.SATURDAY]: false,
      [WEEK.SUNDAY]: false,
    },
    readonly: false,
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

  componentDidMount() {
    this.setState({
      readonly: this.props.readonly,
      week: Object.assign(this.state.week, this.props.week),
    });
  }

  componentWillReceiveProps(props) {
    this.setState({ week: props.week, readonly: props.readonly });
  }

  _setWeekState(day) {
    const nextWeekState = {
      ...this.state.week,
      ...{ [day]: !this.state.week[day] },
    };
    this.setState({ week: nextWeekState });
    return nextWeekState;
  }

  _onMondayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.MONDAY);
      this.props.onPress(WEEK.MONDAY, nextWeekState);
    }
  }

  _onTuesdayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.TUESDAY);
      this.props.onPress(WEEK.TUESDAY, nextWeekState);
    }
  }

  _onWednesdayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.WEDNESDAY);
      this.props.onPress(WEEK.WEDNESDAY, nextWeekState);
    }
  }

  _onThursdayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.THURSDAY);
      this.props.onPress(WEEK.THURSDAY, nextWeekState);
    }
  }

  _onFridayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.FRIDAY);
      this.props.onPress(WEEK.FRIDAY, nextWeekState);
    }
  }

  _onSaturdayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.SATURDAY);
      this.props.onPress(WEEK.SATURDAY, nextWeekState);
    }
  }

  _onSundayPressed() {
    if (!this.state.readonly) {
      const nextWeekState = this._setWeekState(WEEK.SUNDAY);
      this.props.onPress(WEEK.SUNDAY, nextWeekState);
    }
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <WeekCalendarItem
          key={WEEK.MONDAY}
          onPress={this._onMondayPressed}
          active={this.state.week[WEEK.MONDAY]}
          disabled={this.state.readonly}
        >L</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.TUESDAY}
          onPress={this._onTuesdayPressed}
          active={this.state.week[WEEK.TUESDAY]}
          disabled={this.state.readonly}
        >M</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.WEDNESDAY}
          onPress={this._onWednesdayPressed}
          active={this.state.week[WEEK.WEDNESDAY]}
          disabled={this.state.readonly}
        >M</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.THURSDAY}
          onPress={this._onThursdayPressed}
          active={this.state.week[WEEK.THURSDAY]}
          disabled={this.state.readonly}
        >J</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.FRIDAY}
          onPress={this._onFridayPressed}
          active={this.state.week[WEEK.FRIDAY]}
          disabled={this.state.readonly}
        >V</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.SATURDAY}
          onPress={this._onSaturdayPressed}
          active={this.state.week[WEEK.SATURDAY]}
          disabled={this.state.readonly}
        >S</WeekCalendarItem>

        <WeekCalendarItem
          key={WEEK.SUNDAY}
          onPress={this._onSundayPressed}
          active={this.state.week[WEEK.SUNDAY]}
          disabled={this.state.readonly}
        >D</WeekCalendarItem>
      </View>
    );
  }
}
