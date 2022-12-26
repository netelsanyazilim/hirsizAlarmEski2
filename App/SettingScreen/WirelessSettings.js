import React, { Component } from "react";
import { NativeModules, View, BackHandler, Platform, ScrollView } from "react-native";
import { CommonActions } from '@react-navigation/native';
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import NetInfo from "@react-native-community/netinfo";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import OptItem from "../Component/OptItem";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

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
class WirelessSettings extends Component {

  @observable loading = false;
  @observable psd = !global.deviceLoggedin;

  constructor(props) {
    super(props);
    makeObservable(this);
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
          <OptItem disabled={false} iconname={"add-circle"} title={langObj.addSensor} subtitle={langObj.addSensorSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("WirelessSettingAdd");
            }} />
          <OptItem disabled={false} iconname={"format-list-bulleted"} title={langObj.listSensor} subtitle={langObj.listSensorSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("WirelessSettingList");
            }} />
          <OptItem disabled={false} iconname={"speed"} title={langObj.rfOptimization} subtitle={langObj.rfOptimizationSub}
            onPress={() => {
              if (global.statusData != undefined)
                this.props.navigation.navigate("WirelessSettingOptimization");
            }} />
        </View>
      </ScrollView>
    );
  }
}

export default WirelessSettings;