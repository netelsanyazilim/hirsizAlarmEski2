import React, { Component } from 'react';
import { StyleSheet, View, NativeModules, Modal, Text, Platform } from 'react-native';
import LoginDeviceButton from './LoginDeviceButton';
import { Button } from "react-native-elements";
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

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

export default class Loading extends Component {

  componentDidMount() {
    this.getLanguage();
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

  render() {
    const { loading, close, back } = this.props;
    return (
      <Modal visible={loading} animationType={"fade"} onRequestClose={() => back()} transparent={true}>
        <View style={{
          flex: 1, alignSelf: 'center', justifyContent: 'center',
          width: '100%',
          backgroundColor: "rgba(0,0,0,0.4)"
        }}>
          <View style={styles.innerContainer}>
            <Text style={{ margin: 10, marginBottom: 20, textAlign: "center" }} > {langObj.deviceLogin}</Text>
            <LoginDeviceButton
              onResult={(x) => {
                if (x) {
                  Toast.show(langObj.deviceLoginSuccess, Toast.SHORT);
                  close();
                }
                else {
                  Toast.show(langObj.deviceLoginFail, Toast.SHORT);
                }
              }}
            />
            <Button
              buttonStyle={{ marginBottom: 10, marginTop: 10 }}
              containerViewStyle={{ margin: 10 }}
              onPress={() => { back(); }} title={langObj.back} />
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white"
  },
  innerContainer: {
    marginLeft: 50, marginRight: 50,
    alignItems: "center",
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3
  }
});