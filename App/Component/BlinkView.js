/* @flow */
/* eslint-disable prefer-const */
/* jshint esversion: 6 */
/* eslint-env node, mocha */
'use strict';

import React, { Component } from "react";
import PropTypes            from "prop-types";
import { View, Animated }   from "react-native";

export default class BlinkView extends Component
{
  /**
   * Local timer handled function. Destroyed on unmount
   * @type {Function}
   */
  _onDelay = null;

  /**
   * Props validation
   * @type {Object} Ex: {
   *   element  : {any}     Blinking element type, can be 'View', 'Text' or any kind of <Element />, Default is 'View'
   *   children : {any}     Element displayed in within the <BlinkView>{...}</BlinkView>, it can be a {string} or any kind of <Element />, Default is null
   *   delay    : {number}  Delay between each blinks in miliseconds, Default is 1500 millisec
   *   blinking : {boolean} Defines if the element is currently blinkink, Default is true
   * }
   */
  static propTypes = {
    element  : PropTypes.any,
    children : PropTypes.any,
    delay    : PropTypes.number,
    blinking : PropTypes.bool
  }

  /**
   * Default props
   * @return {object} Default props for this element.
   */
  static defaultProps = {
    element  : View,
    children : null,
    delay    : 1500,
    blinking : true
  }

  /**
   * Init states
   * @return {object} states
   */
  constructor( props, state )
  {
    try
    {
      super( props );

      this.state = {
        delay     : props && props.delay || 1500,
        blinkAnim : new Animated.Value( 0 )
      };
    }
    catch ( err )
    {
      console.warn( err );
    }
  }

  render()
  {
    try
    {
      const isBlinking = this.props && this.props.blinking || true;
      const Element = ( ( isBlinking === true ) ? Animated.createAnimatedComponent( this.props && this.props.element || View ) : this.props && this.props.element || View );

      return  (
        <Element
          {...this.props}
          style = {[this.props.style, { opacity: ( isBlinking === true ) ? this.state.blinkAnim : 1 } ]}>
          {this.props && this.props.children || null}
        </Element>
      )
    }
    catch ( err )
    {
      console.warn( err );
    }
    return (
      this.props && this.props.children || <View />
    );
  }

}