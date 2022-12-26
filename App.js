import React, { useEffect } from 'react';
import { NativeModules, Image, Dimensions, Platform, View, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ChooseDevice from './App/ChooseDevice';
import CreateAccount from './App/CreateAccount';
import ResetPassword from './App/ResetPassword';
import Password from './App/SettingScreen/Password';
import PCRemotePassword from './App/SettingScreenPassword/PCRemotePassword';
import DeviceMasterPassword from './App/SettingScreenPassword/DeviceMasterPassword';
import SectionMasterPassword from './App/SettingScreenPassword/SectionMasterPassword';
import SectionPanicPassword from './App/SettingScreenPassword/SectionPanicPassword';
import SectionSilentPassword from './App/SettingScreenPassword/SectionSilentPassword';
import UserPassword from './App/SettingScreenPassword/UserPassword';
import System from './App/SettingScreen/System';
import EntryDelayTimer from './App/SettingScreenSystem/EntryDelayTimer';
import ExitDelayTimer from './App/SettingScreenSystem/ExitDelayTimer';
import SirenSoundingDuration from './App/SettingScreenSystem/SirenSoundingDuration';
import AlarmRepeatCount from './App/SettingScreenSystem/AlarmRepeatCount';
import PhoneCallLineSelection from './App/SettingScreenSystem/PhoneCallLineSelection';
import GSMGprsModSelection from './App/SettingScreenSystem/GSMGprsModSelection';
import SMSNotificationSetting from './App/SettingScreenSystem/SMSNotificationSetting';
import NumberCallRepetitions from './App/SettingScreenSystem/NumberCallRepetitions';
import NumberPhoneRings from './App/SettingScreenSystem/NumberPhoneRings';
import PasswordFreeArm from './App/SettingScreenSystem/PasswordFreeArm';
import FireZoneSetting from './App/SettingScreenSystem/FireZoneSetting';
import AudioFeedback from './App/SettingScreenSystem/AudioFeedback';
import CentralBuzzerSetting from './App/SettingScreenSystem/CentralBuzzerSetting';
import SirenErrorSetting from './App/SettingScreenSystem/SirenErrorSetting';
import ZoneSettings from './App/SettingScreen/ZoneSettings';
import Program from './App/SettingScreen/Program';
import Phone from './App/SettingScreen/Phone';
import SMS from './App/SettingScreen/SMS';
import DateAndTime from './App/SettingScreen/DateAndTime';
import Notification from './App/SettingScreen/Notification';
import AkmSettings from './App/SettingScreen/AkmSettings';
import SectionSettings from './App/SettingScreen/SectionSettings';
import RelaySettings from './App/SettingScreen/RelaySettings';
import SectionSelectionSettings from './App/SettingScreen/SectionSelectionSettings';
import SectionSelectionPassword from './App/SettingScreenSection/SectionSelectionPassword';
import SectionSelectionZone from './App/SettingScreenSection/SectionSelectionZone';
import SectionSelectionRemote from './App/SettingScreenSection/SectionSelectionRemote';
import SectionSelectionTelephone from './App/SettingScreenSection/SectionSelectionTelephone';
import SectionSelectionSMS from './App/SettingScreenSection/SectionSelectionSMS';
import WirelessSettings from './App/SettingScreen/WirelessSettings';
import WirelessSettingAdd from './App/SettingScreenWireless/WirelessSettingAdd';
import WirelessSettingOptimization from './App/SettingScreenWireless/WirelessSettingOptimization';
import WirelessSettingList from './App/SettingScreenWireless/WirelessSettingList';
import WifiSettings from './App/SettingScreen/WifiSettings';
import WifiSettingSearch from './App/SettingScreenWifi/WifiSettingSearch';
import EventLog from './App/SettingScreen/EventLog';
import Warnings from './App/SettingScreen/Warnings';
import ResetDevice from './App/SettingScreen/ResetDevice';
import ResetAllSystem from './App/SettingScreenReset/ResetAllSystem';
import RebootDevice from './App/SettingScreenReset/RebootDevice';
import ResetModules from './App/SettingScreenReset/ResetModules';
import ResetSystem from './App/SettingScreenReset/ResetSystem';
import DevicesUser from './App/SettingScreen/DevicesUser';
import Language from './App/SettingScreen/Language';
import Index1 from './App/LoginScreen';
import SettingsTab from './App/SettingsTab';
import AddDevice from './App/AddDevice';
import SharedPrefs from './App/Utils/SharedPrefs';
import * as TR from './App/assets/tr.json';
import * as EN from './App/assets/en.json';

var en = Dimensions.get('window').width;

SharedPrefs.settingsTab();

const Stack = createStackNavigator();
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

const CustomNavigator = () => (

  <Stack.Navigator>
    <Stack.Screen name="LoginScreen" component={Index1}
      options={{
        headerShown: false,
        title: langObj.login,
        headerBackTitle: null
      }} />
    <Stack.Screen name="ChooseDevice" component={ChooseDevice}
      options={{
        title: langObj.chooseDeviceHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="CreateAccount" component={CreateAccount}
      options={{
        title: langObj.createAccount,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="ResetPassword" component={ResetPassword}
      options={{
        title: langObj.resetPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="SettingsTab" component={SettingsTab}
      options={{
        title: langObj.settingsTabHeader,  //
        headerStyle: {
          backgroundColor: '#cc1e18'
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerLeft: null,
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="AddDevice" component={AddDevice}
      options={{
        title: langObj.addDevice,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="Password" component={Password}
      options={{
        title: langObj.password,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="System" component={System}
      options={{
        title: langObj.system,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="ZoneSettings" component={ZoneSettings}
      options={{
        title: langObj.zoneSetting,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="Program" component={Program}
      options={{
        title: langObj.program,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="Phone" component={Phone}
      options={{
        title: langObj.phonesHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="DateAndTime" component={DateAndTime}
      options={{
        title: langObj.dateTimeHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="Notification" component={Notification}
      options={{
        title: langObj.notificationHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="AkmSettings" component={AkmSettings}
      options={{
        title: langObj.akmHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="EventLog" component={EventLog}
      options={{
        title: langObj.eventLogHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="ResetDevice" component={ResetDevice}
      options={{
        title: langObj.resetDeviceHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="DevicesUser" component={DevicesUser}
      options={{
        title: langObj.deviceUserHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="Language" component={Language}
      options={{
        title: langObj.languageHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="UserPassword" component={UserPassword}
      options={{
        title: langObj.userPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionPanicPassword" component={SectionPanicPassword}
      options={{
        title: langObj.sectionPanicPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionSilentPassword" component={SectionSilentPassword}
      options={{
        title: langObj.sectionSilentPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionMasterPassword" component={SectionMasterPassword}
      options={{
        title: langObj.sectionMasterPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="PCRemotePassword" component={PCRemotePassword}
      options={{
        title: langObj.pcRemotePassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="DeviceMasterPassword" component={DeviceMasterPassword}
      options={{
        title: langObj.deviceMasterPassword,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="EntryDelayTimer" component={EntryDelayTimer}
      options={{
        title: langObj.entryDelayTimer,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="ExitDelayTimer" component={ExitDelayTimer}
      options={{
        title: langObj.exitDelayTimer,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SirenSoundingDuration" component={SirenSoundingDuration}
      options={{
        title: langObj.sirenSoundingDuration,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="AlarmRepeatCount" component={AlarmRepeatCount}
      options={{
        title: langObj.alarmRepeatCount,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="PhoneCallLineSelection" component={PhoneCallLineSelection}
      options={{
        title: langObj.phoneCallLineSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="GSMGprsModSelection" component={GSMGprsModSelection}
      options={{
        title: langObj.gsmGprsModSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SMSNotificationSetting" component={SMSNotificationSetting}
      options={{
        title: langObj.smsNotificationSetting,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="NumberCallRepetitions" component={NumberCallRepetitions}
      options={{
        title: langObj.numberCallRepetitions,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="NumberPhoneRings" component={NumberPhoneRings}
      options={{
        title: langObj.numberPhoneRings,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="PasswordFreeArm" component={PasswordFreeArm}
      options={{
        title: langObj.passwordFreeArm,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="FireZoneSetting" component={FireZoneSetting}
      options={{
        title: langObj.fireZoneSetting,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="AudioFeedback" component={AudioFeedback}
      options={{
        title: langObj.audioFeedback,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="CentralBuzzerSetting" component={CentralBuzzerSetting}
      options={{
        title: langObj.centralBuzzerSetting,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SirenErrorSetting" component={SirenErrorSetting}
      options={{
        title: langObj.sirenErrorSetting,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SMS" component={SMS}
      options={{
        title: langObj.smsHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="SectionSettings" component={SectionSettings}
      options={{
        title: langObj.sectionHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="SectionSelectionSettings" component={SectionSelectionSettings}
      options={{
        title: langObj.sectionSelectionHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="SectionSelectionPassword" component={SectionSelectionPassword}
      options={{
        title: langObj.sectionPasswordSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionSelectionZone" component={SectionSelectionZone}
      options={{
        title: langObj.sectionZoneSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionSelectionRemote" component={SectionSelectionRemote}
      options={{
        title: langObj.sectionRemoteSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionSelectionTelephone" component={SectionSelectionTelephone}
      options={{
        title: langObj.sectionTelephoneSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="SectionSelectionSMS" component={SectionSelectionSMS}
      options={{
        title: langObj.sectionSMSSelection,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="WirelessSettings" component={WirelessSettings}
      options={{
        title: langObj.wirelessSettingsHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="WirelessSettingAdd" component={WirelessSettingAdd}
      options={{
        title: langObj.addSensor,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="WirelessSettingOptimization" component={WirelessSettingOptimization}
      options={{
        title: langObj.rfOptimization,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="WirelessSettingList" component={WirelessSettingList}
      options={{
        title: langObj.listSensor,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="Warnings" component={Warnings}
      options={{
        title: langObj.warnings,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="WifiSettings" component={WifiSettings}
      options={{
        title: langObj.wifiSettingsHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="WifiSettingSearch" component={WifiSettingSearch}
      options={{
        title: langObj.findedConnections,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="RelaySettings" component={RelaySettings}
      options={{
        title: langObj.relayHeader,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <Image
          source={require('./App/assets/netelsan.png')}
          resizeMode="contain"
          style={{ width: en * 0.25, marginRight: 5 }}
        />,
      }} />
    <Stack.Screen name="ResetAllSystem" component={ResetAllSystem}
      options={{
        title: langObj.resetAllSystem,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />

    <Stack.Screen name="RebootDevice" component={RebootDevice}
      options={{
        title: langObj.rebootSystem,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />


    <Stack.Screen name="ResetModules" component={ResetModules}
      options={{
        title: langObj.resetModules,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
    <Stack.Screen name="ResetSystem" component={ResetSystem}
      options={{
        title: langObj.resetSystem,
        headerStyle: {
          backgroundColor: '#cc1e18',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: 'white',
          alignSelf: "center"
        },
        headerTintColor: '#ffffff',
        headerRight: () => <View></View>,
      }} />
  </Stack.Navigator>
);

function App() {
  const [, updateState] = React.useState();
  const forceUpdateSc = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    getLanguage();
  }, []);

  const schemaColor = useColorScheme();

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

    const styles = StyleSheet.create({

      lightContainer: {
        backgroundColor: '#d0d0c0',
      }
    });
  } 

  return (
    <NavigationContainer>
      <CustomNavigator />
    </NavigationContainer>
  );
}



export default App;