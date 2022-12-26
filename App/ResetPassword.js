import React, { Component } from 'react';
import { NativeModules, View, BackHandler, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LeftIconButton from './Component/LeftIconButton';
import NetInfo from "@react-native-community/netinfo";
import { Button } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import SharedPrefs from './Utils/SharedPrefs';
import ApiService from './Utils/ApiService';
import * as TR from './assets/tr.json';
import * as EN from './assets/en.json';

var ApiCall = new ApiService();

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

class ResetPassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mail: ""
    };
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
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

  reset() {
    if (this.state.mail != "") {
      NetInfo.fetch().then(state => {
        if (state.isConnected)
          ApiCall.resetpass(this.state.mail);
        else
          Toast.show(langObj.internetConnFail, Toast.LONG);
      });
    }
    else {
      Toast.show(langObj.validateFillEmail, Toast.SHORT);
    }
  }

  onBackPress = () => {
    this.props.navigation.goBack(null);
    return true;
  }

  render() {
    return (
      <KeyboardAwareScrollView extraHeight={20} enableOnAndroid={false} style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ width: '100%', backgroundColor: 'white', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ width: '100%', marginTop: 30, alignItems: "center" }}>
            <LeftIconButton
              iconname={langObj.inEmail}
              placeholder={langObj.email}
              type={'ip'}
              underlineColor={'black'}
              onTextChange={(t) => (this.pass2 = t)}
              ref={(ref) => (this.pass2InputRef = ref)}
              onTextChange={(t) => {
                this.setState({ mail: t });
              }}
              onSubmitEditing={() => this.reset()}
            />
          </View>
          <View style={{ width: '80%', marginTop: 30, alignItems: "stretch" }}>
            <Button
              borderRadius={4}
              buttonStyle={{ backgroundColor: '#cc1e18', width: '100%' }}
              title={langObj.submit}
              onPress={() => { this.reset(); }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default ResetPassword;