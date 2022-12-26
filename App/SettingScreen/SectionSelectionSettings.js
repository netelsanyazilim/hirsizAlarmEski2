import React, { Component } from "react";
import {
  NativeModules, View, BackHandler, Platform, ScrollView
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import SharedPrefs from '../Utils/SharedPrefs';
import DeviceLogin from '../Component/DeviceLogin';
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import OptItem from "../Component/OptItem";
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

@observer
class SectionSelectionSettings extends Component {

  @observable loading = false;
  @observable psd = !global.deviceLoggedin;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = ({
      isEnabled: [false, false, false, false]
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = async () => {
    this.props.navigation.dispatch(
      CommonActions.navigate({
        name: 'SettingsTab'
      })
    );
    setTimeout(() => { }, 500);
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

  render() {
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
        <View style={{ flex: 1, marginTop: 10 }} >
          <OptItem disabled={false} iconname={"lock"} title={langObj.sectionPasswordSelection} subtitle={langObj.sectionPasswordSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("SectionSelectionPassword");
            }} />
          <OptItem disabled={false} iconname={"control-camera"} title={langObj.sectionZoneSelection} subtitle={langObj.sectionZoneSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("SectionSelectionZone");
            }} />
          <OptItem disabled={false} iconname={"speaker-phone"} title={langObj.sectionRemoteSelection} subtitle={langObj.sectionRemoteSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("SectionSelectionRemote");
            }} />
          <OptItem disabled={false} iconname={"settings-phone"} title={langObj.sectionTelephoneSelection} subtitle={langObj.sectionTelephoneSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("SectionSelectionTelephone");
            }} />
          <OptItem disabled={false} iconname={"perm-phone-msg"} title={langObj.sectionSMSSelection} subtitle={langObj.sectionSMSSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("SectionSelectionSMS");
            }} />
        </View>
      </ScrollView>
    );
  }
}

export default SectionSelectionSettings;