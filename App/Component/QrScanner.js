import React, { Component, useEffect } from "react";
import { NativeModules, StyleSheet, Text, TouchableOpacity, Modal, Platform, BackHandler, BackAndroid } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import SharedPrefs from '../Utils/SharedPrefs';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

import Toast from 'react-native-simple-toast';

var langObj;
if (Platform.OS === 'android')
  locale = NativeModules.I18nManager.localeIdentifier;
else
  locale = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];

if (locale.includes("en")) {
  langObj = EN;
} else {
  langObj = TR;
}


export default class ScanScreen extends Component {


  componentDidMount() {
    this.getLanguage();


  }

  componentWillMount() {



  }
  componentWillUnmount() {
    //this.props.showQr = false;
  }




  async getLanguage() {
    try {
      var locale = null;
      if (Platform.OS === 'android')
        locale = NativeModules.I18nManager.localeIdentifier;
      else
        locale = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];

      const a = await SharedPrefs.getLang();

      if (a != undefined && a != null) {
        if (a == 1)
          langObj = EN;
        else
          langObj = TR;
      }
      else {
        if (locale.includes("en")) {
          langObj = EN;
        }
        else {
          langObj = TR;
        }
      }
    } catch (error) {
      if (locale.includes("en")) {
        langObj = EN;
      }
      else {
        langObj = TR;
      }
    }

    this.forceUpdate();
  }

  onSuccess(e) {
    this.props.onResult(e.data)
  }

  render() {
    return (
      <Modal
        transparent={false}
        animationType={'none'}
        visible={this.props.showQr}>
        <QRCodeScanner
          onRead={this.onSuccess.bind(this)}
          topContent={<Text style={styles.centerText}>{langObj.readQR}</Text>}
          bottomContent={
            <TouchableOpacity onPress={this.props.back} style={styles.buttonTouchable}>
              <Text style={styles.buttonText}>{langObj.cancel}</Text>
            </TouchableOpacity>
          }
        />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    color: "#777"
  },
  textBold: {
    fontWeight: "200",
    color: "#cc1e18"
  },
  buttonText: {
    backgroundColor: "gray",
    borderRadius: 4,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 21,
    color: "white"
  },
  buttonTouchable: {
    padding: 16
  }
});