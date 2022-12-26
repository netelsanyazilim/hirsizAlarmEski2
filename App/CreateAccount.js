import React, { Component } from 'react';
import { NativeModules, View, BackHandler, Platform, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import LeftIconButton from './Component/LeftIconButton';
import { Button } from 'react-native-elements';
import ApiService from './Utils/ApiService';
import { makeObservable, observable } from "mobx";
import NetInfo from "@react-native-community/netinfo";
import SharedPrefs from './Utils/SharedPrefs';
import { observer } from "mobx-react";
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

@observer
class CreateAccount extends Component {

  @observable name = '';
  @observable mail = '';
  @observable pass1 = '';
  @observable pass2 = '';
  @observable header = langObj.createAccountHeader;

  constructor() {
    super();
    makeObservable(this);
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

  onBackPress = () => {
    this.props.navigation.goBack(null);
    return true;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  save() {
    if ((this.mail != '') & (this.name != '') & (this.pass1 != '') & (this.pass2 != '')) {
      NetInfo.fetch().then(state => {
        if (!state.isConnected)
          Toast.show(langObj.internetConnFail, Toast.LONG);
        else {
          if (!this.validateEmail(this.mail)) {
            Toast.show(langObj.validateMail, Toast.LONG);
          } else if (this.pass1.length < 6) {
            Toast.show(langObj.validatePassLength, Toast.LONG);
          } else if (this.pass1 != this.pass2) {
            Toast.show(langObj.validatePassMatch, Toast.LONG);
          } else {
            let language = "TR";
            if (NativeModules.I18nManager.localeIdentifier === 'tr_TR') {
              language = "TR";
            } else {
              language = "EN";
            }

            ApiCall.createUser(this.name, this.pass1, this.mail, language, () => {
              this.props.navigation.navigate("LoginScreen");
            });
          }
        }
      });
    } else {
      Toast.show(langObj.validateFillAll, Toast.LONG);
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView extraHeight={20} enableOnAndroid={false} style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ width: '100%', backgroundColor: 'white', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ width: '100%', marginTop: 30, alignItems: "center" }}>
            <LeftIconButton
              iconname={langObj.inName}
              textColor={'black'}
              placeholder={langObj.name}
              type={'ip'}
              returnKeyType="next"
              underlineColor={'rgba(0,0,0,0.4)'}
              onTextChange={(t) => (this.name = t)}
              ref={(ref) => (this.mobileInputRef = ref)}
              onSubmitEditing={() => this.emailInputRef.focus()}
            />
          </View>
          <View style={{ width: '100%', marginTop: 30, alignItems: "center" }}>
            <LeftIconButton
              iconname={langObj.inEmail}
              textColor={'black'}
              placeholder={langObj.email}
              type={'ip'}
              returnKeyType="next"
              onTextChange={(t) => (this.mail = t)}
              underlineColor={'rgba(0,0,0,0.4)'}
              ref={(ref) => (this.emailInputRef = ref)}
              onSubmitEditing={() => this.passInputRef.focus()}
            />
          </View>
          <View style={{ width: '100%', marginTop: 15, alignItems: "center" }}>
            <Text style={{ color: 'red', marginLeft: 20, marginRight: 10 }}>
              {langObj.remindActivation}
            </Text>
          </View>
          <View style={{ width: '100%', marginTop: 15, alignItems: "center" }}>
            <LeftIconButton
              iconname={langObj.inPassword}
              placeholder={langObj.phPass}
              type={'password'}
              underlineColor={'black'}
              returnKeyType="next"
              onTextChange={(t) => (this.pass1 = t)}
              ref={(ref) => (this.passInputRef = ref)}
              onSubmitEditing={() => this.pass2InputRef.focus()}
            />
          </View>
          <View style={{ width: '100%', marginTop: 30, alignItems: "center" }}>
            <LeftIconButton
              iconname={langObj.inPasswordAgain}
              placeholder={langObj.phPass}
              type={'password'}
              underlineColor={'black'}
              onTextChange={(t) => (this.pass2 = t)}
              ref={(ref) => (this.pass2InputRef = ref)}
              onSubmitEditing={() => this.save()}
            />
          </View>
          <View style={{ width: '80%', marginTop: 30, alignItems: "stretch" }}>
            <Button
              borderRadius={4}
              buttonStyle={{ backgroundColor: '#cc1e18', width: '100%' }}
              title={langObj.submit}
              onPress={() => { this.save(); }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default CreateAccount;