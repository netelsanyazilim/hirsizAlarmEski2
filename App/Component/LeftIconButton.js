import React, { Component } from 'react';
import { TextInput, View, Text } from 'react-native';
import PropTypes from 'prop-types';

export default class LeftIconButton extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    iconname: PropTypes.string,
    type: PropTypes.string,
    underlineColor: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    textColor: PropTypes.string,
    selectionColor: PropTypes.string,
    onTextChange: PropTypes.func,
  };
  static defaultProps = {
    underlineColor: 'rgba(255,255,255,0.4)',
    textColor: 'black',
    placeholderTextColor: 'rgba(0,0,0,0.4)',
    onTextChange: (t) => console.log('text change ' + t),
    selectionColor: 'black',
  };

  state = {
    isFocused: false,
  };
  focus = () => this.textInputRef.focus();

  onFocusChange = () => {
    this.setState({ isFocused: true });
  };
  render() {
    const {
      placeholder,
      selectionColor,
      iconname,
      type,
      underlineColor,
      textColor,
      placeholderTextColor,
      onTextChange,
      value,
      ...otherProps
    } = this.props;
    const { isFocused } = this.state;
    const color = 'rgba(255,255,255,0.4)';
    //   const borderColor = isFocused ? 'white' : 'rgba(255,255,255,0.4)'
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          width: '70%',
          flexDirection: 'column',
          height: 60,
        }}>
        <Text style={{ alignSelf: 'flex-start', color: '#cc1e18' }}>
          {iconname}
        </Text>
        <View style={{
          flex: 1,
          borderBottomColor: this.state.isFocused ? '#cc1e18' : underlineColor,
          borderBottomWidth: this.state.isFocused ? 3 : 2
        }}>
          <TextInput
            {...otherProps}
            onFocus={this.onFocusChange}
            onBlur={() => {
              this.setState({ isFocused: false });
            }}
            ref={(ref) => (this.textInputRef = ref)}
            onChangeText={(text) => onTextChange(text)}
            style={{
              flex: 1,
              color: textColor,
              height: 42,
              padding: 7
            }}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholder={placeholder}
            value={value}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholderTextColor}
            selectionColor={selectionColor}
            secureTextEntry={type == 'password'}
            keyboardType={'default'}
            keyboardAppearance={'dark'}
          />
        </View>
      </View>
    );
  }
}