import React, { Component } from "react";
import {
  StyleSheet, Text, NativeModules, View, Platform,
  ScrollView, Switch, BackHandler
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();

let enable = false;
function click() {
  if (!enable) {
    enable = true;
  }
  else {
    enable = false;
  }

}

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
class System extends Component {

  @observable email = [false, false, false, false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false, false, false];
  @observable loading = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.getNotifSettings();
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

  @action
  async getNotifSettings() {
    this.loading = true;
    let user = await SharedPrefs.getlogindata();
    let notifSettings = user.notifSettings;

    this.email[0] = notifSettings.sendNotification;
    this.email[1] = notifSettings.sendMail;
    this.email[2] = notifSettings.battery_low;
    this.email[3] = notifSettings.battery_dead;
    this.email[4] = notifSettings.ac_loss;
    this.email[5] = notifSettings.siren_trouble;
    this.email[6] = notifSettings.armed_by_user;
    this.email[7] = notifSettings.remote_arm;
    this.email[8] = notifSettings.periodic_test;
    this.email[9] = notifSettings.polling_loop_open;
    this.email[10] = notifSettings.offline;

    //bunlar önceki sistemde olmadığı için eski kullanıcıların telefon datalarında olmayabilir
    //bu sebeple kontrol edip değerleri atanıyor.
    if (notifSettings.systemReset != undefined)
      this.email[11] = notifSettings.systemReset;
    else
      this.email[11] = false;

    if (notifSettings.centralDoorOpen != undefined)
      this.email[12] = notifSettings.centralDoorOpen;
    else
      this.email[12] = false;

    if (notifSettings.sirenDoorOpen != undefined)
      this.email[13] = notifSettings.sirenDoorOpen;
    else
      this.email[13] = false;

    if (notifSettings.keypadRemoval != undefined)
      this.email[14] = notifSettings.keypadRemoval;
    else
      this.email[14] = false;

    if (notifSettings.jammerError != undefined)
      this.email[15] = notifSettings.jammerError;
    else
      this.email[15] = false;

    if (notifSettings.telLineError != undefined)
      this.email[16] = notifSettings.telLineError;
    else
      this.email[16] = false;

    if (notifSettings.rfLostDevice != undefined)
      this.email[17] = notifSettings.rfLostDevice;
    else
      this.email[17] = false;

    if (notifSettings.rfBatteryError != undefined)
      this.email[18] = notifSettings.rfBatteryError;
    else
      this.email[18] = false;

    if (notifSettings.rfAddRemove != undefined)
      this.email[19] = notifSettings.rfAddRemove;
    else
      this.email[19] = false;

    if (notifSettings.rfTamperError != undefined)
      this.email[20] = notifSettings.rfTamperError;
    else
      this.email[20] = false;

    this.loading = false;
  }

  render() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

    if (result == "00000000") {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ backgroundColor: "white" }}>
            {this.renderChild(langObj.notif1, langObj.notif1Text, 0)}
            {this.renderChild(langObj.notif2, langObj.notif2Text, 1)}
            {this.renderChild(langObj.notif3, langObj.notif3Text, 2)}
            {this.renderChild(langObj.notif4, langObj.notif4Text, 3)}
            {this.renderChild(langObj.notif5, langObj.notif5Text, 4)}
            {this.renderChild(langObj.notif6, langObj.notif6Text, 5)}
            {this.renderChild(langObj.notif7, langObj.notif7Text, 6)}
            {this.renderChild(langObj.notif8, langObj.notif8Text, 7)}
            {this.renderChild(langObj.notif9, langObj.notif9Text, 8)}
            {this.renderChild(langObj.notif10, langObj.notif10Text, 10)}
            {this.renderChild(langObj.notif12, langObj.notif12Text, 12)}
            {this.renderChild(langObj.notif13, langObj.notif13Text, 13)}
            {this.renderChild(langObj.notif14, langObj.notif14Text, 14)}
            {this.renderChild(langObj.notif15, langObj.notif15Text, 15)}
            {this.renderChild(langObj.notif16, langObj.notif16Text, 16)}
            {this.renderChild(langObj.notif17, langObj.notif17Text, 17)}
            {this.renderChild(langObj.notif18, langObj.notif18Text, 18)}
            {this.renderChild(langObj.notif19, langObj.notif19Text, 19)}
            {this.renderChild(langObj.notif20, langObj.notif20Text, 20)}
            {this.renderChild(langObj.notif11, langObj.notif11Text, 11)}
            <View style={{ height: 80 }} ></View>
          </ScrollView>
          <View style={{
            position: "absolute", display: "flex", bottom: 0, right: 0, left: 0, height: 80,
            borderColor: "red", borderTopWidth: 2, backgroundColor: "white", width: "100%"
          }}
          >
            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }} title={langObj.submit}
              onPress={() => {
                NetInfo.fetch().then(state => {
                  if (state.isConnected) {
                    this.loading = true;
                    ApiCall.setNotifSettingsNew(this.email[0] == 1, this.email[1] == 1, this.email[2] == 1,
                      this.email[3] == 1, this.email[4] == 1, this.email[5] == 1, this.email[6] == 1,
                      this.email[7] == 1, this.email[8] == 1, this.email[9] == 1, this.email[10] == 1,
                      this.email[11] == 1, this.email[12] == 1, this.email[13] == 1, this.email[14] == 1,
                      this.email[15] == 1, this.email[16] == 1, this.email[17] == 1, this.email[18] == 1,
                      this.email[19] == 1, this.email[20] == 1
                    ).then(async (x) => {
                      if (x) {
                        let notifData = {
                          sendNotification: this.email[0] == 1,
                          sendMail: this.email[1] == 1,
                          battery_low: this.email[2] == 1,
                          battery_dead: this.email[3] == 1,
                          ac_loss: this.email[4] == 1,
                          siren_trouble: this.email[5] == 1,
                          armed_by_user: this.email[6] == 1,
                          remote_arm: this.email[7] == 1,
                          periodic_test: this.email[8] == 1,
                          polling_loop_open: this.email[9] == 1,
                          offline: this.email[10] == 1,
                          systemReset: this.email[11] == 1,
                          centralDoorOpen: this.email[12] == 1,
                          sirenDoorOpen: this.email[13] == 1,
                          keypadRemoval: this.email[14] == 1,
                          jammerError: this.email[15] == 1,
                          telLineError: this.email[16] == 1,
                          rfLostDevice: this.email[17] == 1,
                          rfBatteryError: this.email[18] == 1,
                          rfAddRemove: this.email[19] == 1,
                          rfTamperError: this.email[20] == 1,
                        }
                        await SharedPrefs.saveNotifSettings(notifData);
                        ApiCall.getStatus(global.deviceId);
                      }
                      else
                        console.log('set notification fail!');
                      this.loading = false;
                    });
                  }
                  else
                    Toast.show(langObj.internetConnFail, Toast.LONG);
                });
              }}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ backgroundColor: "white" }}>
            {this.renderChild(langObj.notif1, langObj.notif1Text, 0)}
            {this.renderChild(langObj.notif2, langObj.notif2Text, 1)}
            {this.renderChild(langObj.notif3, langObj.notif3Text, 2)}
            {this.renderChild(langObj.notif4, langObj.notif4Text, 3)}
            {this.renderChild(langObj.notif5, langObj.notif5Text, 4)}
            {this.renderChild(langObj.notif6, langObj.notif6Text, 5)}
            {this.renderChild(langObj.notif7, langObj.notif7Text, 6)}
            {this.renderChild(langObj.notif8, langObj.notif8Text, 7)}
            {this.renderChild(langObj.notif9, langObj.notif9Text, 8)}
            {this.renderChild(langObj.notif10, langObj.notif10Text, 10)}
            <View style={{ height: 80 }} ></View>
          </ScrollView>
          <View
            style={{
              position: "absolute",
              display: "flex",
              bottom: 0,
              right: 0,
              left: 0,
              height: 80,
              borderColor: "red",
              borderTopWidth: 2,
              backgroundColor: "white",
              width: "100%"
            }}
          >
            <Button disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }} title={langObj.submit}
              onPress={() => {
                click();
                this.forceUpdate();
                NetInfo.fetch().then(state => {
                  if (state.isConnected) {
                    this.loading = true;
                    ApiCall.setNotifSettings(this.email[0] == 1,
                      this.email[1] == 1,
                      this.email[2] == 1,
                      this.email[3] == 1,
                      this.email[4] == 1,
                      this.email[5] == 1,
                      this.email[6] == 1,
                      this.email[7] == 1,
                      this.email[8] == 1,
                      this.email[9] == 1,
                      this.email[10] == 1
                    ).then(async (x) => {
                      if (x) {
                        let notifData = {
                          sendNotification: this.email[0] == 1
                          , sendMail: this.email[1] == 1
                          , battery_low: this.email[2] == 1
                          , battery_dead: this.email[3] == 1
                          , ac_loss: this.email[4] == 1
                          , siren_trouble: this.email[5] == 1
                          , armed_by_user: this.email[6] == 1
                          , remote_arm: this.email[7] == 1
                          , periodic_test: this.email[8] == 1
                          , polling_loop_open: this.email[9] == 1
                          , offline: this.email[10] == 1
                        }
                        await SharedPrefs.saveNotifSettings(notifData);
                        ApiCall.getStatus(global.deviceId);
                      }
                      else
                        console.log('set notification fail!');
                      this.loading = false;
                    });
                  }
                  else
                    Toast.show(langObj.internetConnFail, Toast.LONG);
                });

                setTimeout(() => {
                  click();
                  this.forceUpdate();
                }, 3000);
              }}
            />
          </View>
        </View>
      );
    }
  }

  renderChild(title, placeholder, count) {
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            backgroundColor: "transparent",
            width: "100%",
            justifyContent: "space-between"
          }}
        >
          <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
            {title}
          </Text>
          <Switch
            style={{ marginRight: 20, alignSelf: 'center' }}
            onValueChange={(value) => {
              this.email[count] = value;
            }}
            onTintColor={'#cc1e18'}
            value={this.email[count]} />
        </View>
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          backgroundColor: 'whitesmoke', borderColor: "gainsboro", borderBottomWidth: 1, width: "100%"
        }}
        >
          <Text style={{ margin: 10, fontSize: 16, fontWeight: '400' }} >{placeholder}</Text>
        </View>
      </View>
    );
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
    backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3
  }
});

export default System;