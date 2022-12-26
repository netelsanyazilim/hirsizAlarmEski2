import React, { Component, useEffect, useState } from "react";
import {
  StyleSheet, Text, NativeModules, View, ScrollView,
  TextInput, Modal, BackHandler, Platform
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import NetInfo from "@react-native-community/netinfo";
import { Icon, Button } from "react-native-elements";
import CounterStore from '../Utils/CounterStore';
import ApiService from '../Utils/ApiService';
import DeviceLogin from '../Component/DeviceLogin';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import OptItem from "../Component/OptItem";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();

let enable = false;

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

function click() {
  if (!enable) {
    enable = true;
  }
  else {
    enable = false;
  }

}

@observer
class System extends Component {

  @observable psd = !global.deviceLoggedin;

  constructor(props) {
    super(props);
    makeObservable(this);
    CounterStore.push(Number(global.statusData.data.girissuresi));
    CounterStore.push(Number(global.statusData.data.cikissuresi));
    CounterStore.push(global.statusData.data.sirensuresi);
    CounterStore.push(global.statusData.data.alarmtekrarsayisi);
    CounterStore.push(20);
    CounterStore.push(210);
    CounterStore.push(20);


    var d = new Date();
    d.getDate();
    this.state = { date: false, modalVisible: false, psd: false };
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

  @action
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.getLanguage();
    this.psd = !global.deviceLoggedin;
  }

  renderChild(title, placeholder, count) {
    let i = count;
    let newData = global.statusData;
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
          {/*<Icon
            containerStyle={{ width: 40, margin: 10 }}
            name="info"
            //  type="font-awesome"
            color="gray"
            onPress={() => this.setState({ modalVisible: true })}
          />*/}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: 'whitesmoke',
            borderColor: "gainsboro",
            borderBottomWidth: 1,
            width: "100%"
          }}
        >
          {this.countView(placeholder, i)}
          <View>
            <Button
              disabled={enable}
              borderRadius={4}
              buttonStyle={{ margin: 10, backgroundColor: "#cc1e18" }}
              title={langObj.submit}
              onPress={
                () => {
                  click();
                  this.forceUpdate();
                  NetInfo.fetch().then(state => {
                    if (state.isConnected) {
                      newData.data.girissuresi = CounterStore.listofCounter[0];
                      newData.data.cikissuresi = CounterStore.listofCounter[1];
                      newData.data.sirensuresi = CounterStore.listofCounter[2];
                      newData.data.alarmtekrarsayisi = CounterStore.listofCounter[3];
                      ApiCall.setSystemSettings(newData.data);
                    }
                    else
                      Toast.show(langObj.internetConnFail, Toast.LONG);
                  });
                  setTimeout(() => {
                    click();
                    this.forceUpdate();
                  }, 3000);
                }
              }
            />
          </View>
        </View>
      </View>
    );
  }

  countView(unit, itemPos) {
    return (
      <View style={{ flexDirection: 'row', marginLeft: 15, }}>
        <Icon
          size={18}
          name="plus"
          color="gray"
          type="font-awesome"
          containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
          onPress={() => CounterStore.incrementList(itemPos)}
        />
        <TextInput
          style={styles.textInput}
          textAlign={'center'}
          autoCapitalize={"none"}
          autoCorrect={false}
          value={CounterStore.listofCounter[itemPos].toString()}
          onChangeText={(text) => CounterStore.setText(itemPos, text)}
          maxLength={3}
          keyboardType={'numeric'}
          underlineColorAndroid={"black"}
          placeholderTextColor={"rgba(0,0,0,0.4)"}
          selectionColor={"black"}
        />
        <Icon
          size={18}
          name="minus"
          type="font-awesome"
          color="gray"
          containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
          onPress={() => { CounterStore.decrementList(itemPos) }}
        />
        <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{unit}</Text>
      </View>
    );
  }

  azalt(itemPos) {
    alert("azalt");
    ls.decrease(itemPos);
  }

  render() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

    if (result == "00000000") {
      return (
        <ScrollView style={{ backgroundColor: 'white' }}>
          <View style={{ flex: 1, marginTop: 10 }} >
            <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
            <OptItem disabled={false} iconname={"arrow-forward"} title={langObj.entryDelayTimer} subtitle={langObj.entryDelayTimerSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("EntryDelayTimer");
              }} />
            <OptItem disabled={false} iconname={"arrow-back"} title={langObj.exitDelayTimer} subtitle={langObj.exitDelayTimerSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("ExitDelayTimer");
              }} />
            <OptItem disabled={false} iconname={"timer"} title={langObj.sirenSoundingDuration} subtitle={langObj.sirenSoundingDurationSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("SirenSoundingDuration");
              }} />
            <OptItem disabled={false} iconname={"refresh"} title={langObj.alarmRepeatCount} subtitle={langObj.alarmRepeatCountSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("AlarmRepeatCount");
              }} />
            <OptItem disabled={false} iconname={"phone-forwarded"} title={langObj.phoneCallLineSelection} subtitle={langObj.phoneCallLineSelectionSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("PhoneCallLineSelection");
              }} />
            <OptItem disabled={false} iconname={"settings-phone"} title={langObj.gsmGprsModSelection} subtitle={langObj.gsmGprsModSelectionSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("GSMGprsModSelection");
              }} />
            <OptItem disabled={false} iconname={"perm-phone-msg"} title={langObj.smsNotificationSetting} subtitle={langObj.smsNotificationSettingSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("SMSNotificationSetting");
              }} />
            <OptItem disabled={false} iconname={"call-missed-outgoing"} title={langObj.numberCallRepetitions} subtitle={langObj.numberCallRepetitionsSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("NumberCallRepetitions");
              }} />
            <OptItem disabled={false} iconname={"ring-volume"} title={langObj.numberPhoneRings} subtitle={langObj.numberPhoneRingsSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("NumberPhoneRings");
              }} />
            <OptItem disabled={false} iconname={"no-encryption"} title={langObj.passwordFreeArm} subtitle={langObj.passwordFreeArmSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("PasswordFreeArm");
              }} />
            <OptItem disabled={false} iconname={"local-fire-department"} title={langObj.fireZoneSetting} subtitle={langObj.fireZoneSettingSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("FireZoneSetting");
              }} />
            <OptItem disabled={false} iconname={"hearing"} title={langObj.audioFeedback} subtitle={langObj.audioFeedbackSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("AudioFeedback");
              }} />
            <OptItem disabled={false} iconname={"speaker-phone"} title={langObj.centralBuzzerSetting} subtitle={langObj.centralBuzzerSettingSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("CentralBuzzerSetting");
              }} />
            <OptItem disabled={false} iconname={"disc-full"} title={langObj.sirenErrorSetting} subtitle={langObj.sirenErrorSettingSub}
              onPress={() => {
                if (global.statusData != undefined)
                  this.props.navigation.navigate("SirenErrorSetting");
              }} />
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
          <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
          {this.renderChild(langObj.system1, langObj.system1Unit, 0)}
          {this.renderChild(langObj.system2, langObj.system2Unit, 1)}
          {this.renderChild(langObj.system3, langObj.system3Unit, 2)}
          {this.renderChild(langObj.system4, langObj.system4Unit, 3)}
          <View style={{ height: 30 }} ></View>
          {/*<Modal
            visible={this.state.modalVisible}
            animationType={"slide"}
            onRequestClose={() => console.log('onReq close')}
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.innerContainer}>
                <Text style={{ margin: 10 }} >
                  Giriş Süresi Sistem Kurulu moddayken herhangi bir sensörden
                  alarm bilgisi gelmesi durumunda siren ve flaşörlerle alarm
                  verilene kadar beklenecek süredir. Bu süre zarfında herhangi bir
                  kullanıcı şifresi veya master şifre girilmesi halinde alarm
                  bilgisi sıfırlanır ve sistem kapalı moda geçer.
                </Text>
                <Button onPress={() => this.closeModal()} title="Kapat" />
              </View>
            </View>
          </Modal>*/}
        </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "space-around"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  innerContainer: {
    marginLeft: 50, marginRight: 50,
    alignItems: "center",
    alignSelf: 'center',
    backgroundColor: 'white', borderWidth: 2, borderColor: 'gainsboro', borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3,
  },
  textInput: {
    margin: 5,
    width: 50,
    fontSize: 20,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        borderBottomWidth: 2,
        borderColor: 'gray',
      }
    }),
  }
});

export default System;