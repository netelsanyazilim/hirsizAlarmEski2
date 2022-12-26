import React, { useEffect } from "react";
import { NativeModules, View, ScrollView, Platform } from "react-native";
import SharedPrefs from '../Utils/SharedPrefs';
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

function Settings(props) {

  const [, updateState] = React.useState();
  const forceUpdateSc = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    getLanguage();
  }, []);

  const getLanguage = async () => {
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

    forceUpdateSc();
  }

  let flagDeviceId = global.deviceId;
  let result = "";

  if (flagDeviceId != undefined) {
    result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000")
      flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
  } else {
    result = "";
  }

  if (result == "00000000") {
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginTop: 10 }} >
          <OptItem disabled={false} iconname={"lock"} title={langObj.password} subtitle={langObj.passwordSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Password");
            }} />
          <OptItem disabled={false} iconname={"settings"} title={langObj.system} subtitle={langObj.systemSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("System")
            }} />
          <OptItem disabled={false} iconname={"dashboard"} title={langObj.zon} subtitle={langObj.zonSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("ZoneSettings")
            }} />
          <OptItem disabled={false} iconname={"timelapse"} title={langObj.program} subtitle={langObj.programSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Program")
            }} />
          <OptItem disabled={false} iconname={"local-phone"} title={langObj.phones} subtitle={langObj.phoneSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Phone")
            }} />
          <OptItem disabled={false} iconname={"perm-phone-msg"} title={langObj.smsPhones} subtitle={langObj.smsSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("SMS")
            }} />
          <OptItem disabled={false} iconname={"today"} title={langObj.dateTime} subtitle={langObj.dateTimeSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("DateAndTime")
            }} />
          <OptItem disabled={false} iconname={"notifications"} title={langObj.notification} subtitle={langObj.notificationSub}
            onPress={() => {
              props.navigation.navigate("Notification")
            }} />
          <OptItem disabled={false} iconname={"router"} title={langObj.akm} subtitle={langObj.akmSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("AkmSettings")
            }} />
          <OptItem disabled={false} iconname={"dashboard"} title={langObj.section} subtitle={langObj.sectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("SectionSettings")
            }} />
          <OptItem disabled={false} iconname={"dashboard-customize"} title={langObj.sectionSelection} subtitle={langObj.sectionSelectionSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("SectionSelectionSettings")
            }} />
          <OptItem disabled={false} iconname={"rss-feed"} title={langObj.wirelessSettings} subtitle={langObj.wirelessSettingsSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("WirelessSettings")
            }} />
          <OptItem disabled={false} iconname={"wifi"} title={langObj.wifiSettings} subtitle={langObj.wifiSettingsSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("WifiSettings")
            }} />
          <OptItem disabled={false} iconname={"swipe"} title={langObj.relaySettings} subtitle={langObj.relaySettingsSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("RelaySettings")
            }} />
          <OptItem disabled={false} iconname={"notifications-active"} title={langObj.warnings} subtitle={langObj.warningsSub}
            onPress={() => {
              props.navigation.navigate("Warnings")
            }} />
          <OptItem disabled={false} iconname={"event-note"} title={langObj.eventLog} subtitle={langObj.eventLogSub}
            onPress={() => {
              props.navigation.navigate("EventLog")
            }} />
          <OptItem disabled={false} iconname={"restore"} title={langObj.resetDevice} subtitle={langObj.resetDeviceSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("ResetDevice")
            }} />
          <OptItem disabled={false} iconname={"people"} title={langObj.users} subtitle={langObj.usersSub}
            onPress={() => {
              props.navigation.navigate("DevicesUser")
            }} />
          <OptItem disabled={false} iconname={"language"} title={langObj.languageHeader} subtitle={langObj.languageDescription}
            onPress={() => {
              props.navigation.navigate("Language")
            }} />
        </View>
      </ScrollView>
    );
  }
  else {
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginTop: 10 }} >
          <OptItem disabled={false} iconname={"lock"} title={langObj.password} subtitle={langObj.passwordSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Password");
            }} />
          <OptItem disabled={false} iconname={"settings"} title={langObj.system} subtitle={langObj.systemSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("System")
            }} />
          <OptItem disabled={false} iconname={"dashboard"} title={langObj.zon} subtitle={langObj.zonSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("ZoneSettings")
            }} />
          <OptItem disabled={false} iconname={"timelapse"} title={langObj.program} subtitle={langObj.programSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Program")
            }} />
          <OptItem disabled={false} iconname={"local-phone"} title={langObj.phones} subtitle={langObj.phoneSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("Phone")
            }} />
          <OptItem disabled={false} iconname={"today"} title={langObj.dateTime} subtitle={langObj.dateTimeSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("DateAndTime")
            }} />
          <OptItem disabled={false} iconname={"notifications"} title={langObj.notification} subtitle={langObj.notificationSub}
            onPress={() => {
              props.navigation.navigate("Notification")
            }} />
          {<OptItem disabled={false} iconname={"router"} title={langObj.akm} subtitle={langObj.akmSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("AkmSettings")
            }} />}
          <OptItem disabled={false} iconname={"event-note"} title={langObj.eventLog} subtitle={langObj.eventLogSub}
            onPress={() => {
              props.navigation.navigate("EventLog")
            }} />
          <OptItem disabled={false} iconname={"restore"} title={langObj.resetDevice} subtitle={langObj.resetDeviceSub}
            onPress={() => {
              if (global.statusData != undefined)
                props.navigation.navigate("ResetDevice")
            }} />
          <OptItem disabled={false} iconname={"people"} title={langObj.users} subtitle={langObj.usersSub}
            onPress={() => {
              props.navigation.navigate("DevicesUser")
            }} />
          <OptItem disabled={false} iconname={"language"} title={langObj.languageHeader} subtitle={langObj.languageDescription}
            onPress={() => {
              props.navigation.navigate("Language")
            }} />
        </View>
      </ScrollView>
    );
  }
}

export default Settings;