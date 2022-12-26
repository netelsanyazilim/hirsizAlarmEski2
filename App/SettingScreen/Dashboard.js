
import React, { Component } from "react";
import {
  NativeModules, Text, TouchableOpacity, View, Platform, LayoutAnimation,
  SafeAreaView, Alert, Dimensions, StyleSheet, ScrollView, FlatList
} from "react-native";
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import ZonView from '../Component/ZonView';
import ZonView2 from '../Component/ZonView2';
import { Icon } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import DisarmAlert from '../Component/DisarmAlert';
import Eventlog2 from '../SettingScreen/EventLog';
import ErrorAndAlarmAlert from '../Component/ErrorAndAlarmAlert';
import ErrorAndAlarmAlertNew from '../Component/ErrorAndAlarmAlertNew';
import Spinner from "react-native-spinkit";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';
import ZonePublic from '../SettingScreen/ZoneSettings';
//import NetInfo from "@react-native-community/netinfo";
//import Accordian from '../Component/Accordian';
import Toast from 'react-native-simple-toast';

import { LogBox } from 'react-native'

LogBox.ignoreLogs(['VirtualizedLists should never be nested']); // TODO: ScrollView içinde Flatlist kullanıldığı için uyarı! 

let deviceWidth = Dimensions.get('window').width;
let deviceHeigth = Dimensions.get('window').height * 0.14;


var ApiCall = new ApiService();
let a = null;
let user = undefined;


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
var zoneConnectionTypes = [langObj.normallyClosed, langObj.normallyOpen, langObj.rfWireless, langObj.netbus];
let errorHataNoktasi = [langObj.sirenErr, langObj.panicErr, langObj.powerErr, langObj.batteryErr];
let errorAlarmNoktasi = [langObj.sirenAlarm, langObj.panicAlarm, langObj.powerAlarm, langObj.batterAlarm];

@observer
class Dashboard extends Component {

  @observable arr = null;
  @observable weekOfDayText = "";
  @observable deviceId = "";
  @observable ZonName = new Array(9);
  @observable load = false;
  @observable deviceName = "";
  @observable disarmSystemAlert = false;
  @observable showAlarmAlert = false;
  @observable htmlSetupColor = "#ffa000";
  @observable durum = [langObj.statusDisabled, langObj.statusArmed, langObj.statusHome, langObj.statusProgram, langObj.statusProgramAway, langObj.statusProgramHome];
  @observable currentIndex = null;
  @observable errorFound = false;


  @observable panicAlarmCeviri = "";
  @observable aktifsayi = -1;
  @observable aktifbolge = -1;
  @observable aktifbolgesayac = 0;
  @observable aktifbolgesayac2 = 0;
  @observable aktifdil = "";

  @observable partition = 0;
  @observable zonNameNew = new Array(32);
  @observable zonTipi = new Array(32);
  @observable zonDurum = new Array(32);
  @observable zonBolge = new Array(32);
  @observable zonBagTip = new Array(32);


  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      date: false,
      menu: [],
      errorFound: false,
      sirenFault: false,
      sirenCable: false,
      electricFault: false,
      akuFault: false,
      akuNotFoundFault: false,
      centralDoorOpenFault: false,
      telLineFault: false,
      keypadError: false,
      jammerError: false,
      keypadIndex: [],
      zonData: false,
      zonBilgisi: null,
      bolgeStatus: [0, 0, 0, 0],
      bolgeAlarm: [0, 0, 0, 0],
      programAyar: null,
      haftaninGunu: 0,
      fireAlarm: false,
      expanded: [true, false, false, false],
      yanginZonu: false,
      yanginZonuError: false,
      zoneTest1: [],
      zoneTest2: [],
      zoneTest3: [],
      zoneTest4: [],
      programTime: ["", "", "", ""],

    };
    this.getLanguage();
    this.getZonName();

    ApiCall.getEventLog().then((x) => {
      this.arr = x;
    });

    ApiCall.getStatus(global.deviceId).then((x) => {
      if (x) {
        this.getUser();
        let flagAktifBolge = [];

        if (ApiCall.bolgeAktif[0]) {
          flagAktifBolge.push({ title: langObj.bolgeAktif1 });


        }

        if (ApiCall.bolgeAktif[1]) {
          flagAktifBolge.push({ title: langObj.bolgeAktif2 });

        }

        if (ApiCall.bolgeAktif[2]) {
          flagAktifBolge.push({ title: langObj.bolgeAktif3 });

        }

        if (ApiCall.bolgeAktif[3]) {
          flagAktifBolge.push({ title: langObj.bolgeAktif4 });
        }



        let flagSystemFault = "00000000";
        let flagSystemStatus = "00000000";
        let flagKeypadStatus = "00000000";
        let flagMixedControl = "00000000";

        if (!isNaN(ApiCall.sistemFault)) {
          flagSystemFault = ApiCall.sistemFault.toString(2);
          flagSystemFault = new Array((9 - flagSystemFault.length)).join('0') + flagSystemFault;
        }

        if (!isNaN(ApiCall.sistemStatus)) {
          flagSystemStatus = ApiCall.sistemStatus.toString(2);
          flagSystemStatus = new Array((9 - flagSystemStatus.length)).join('0') + flagSystemStatus;
        }

        if (!isNaN(ApiCall.keypadStatus)) {
          flagKeypadStatus = ApiCall.keypadStatus.toString(2);
          flagKeypadStatus = new Array((9 - flagKeypadStatus.length)).join('0') + flagKeypadStatus;
        }

        if (!isNaN(ApiCall.mixedControls)) {
          flagMixedControl = ApiCall.mixedControls.toString(2);
          flagMixedControl = new Array((9 - flagMixedControl.length)).join('0') + flagMixedControl;
        }

        let sirenFault = false;
        let sirenCable = false;
        let electricFault = false;
        let akuFault = false;
        let akuNotFoundFault = false;
        let centralDoorOpenFault = false;
        let telLineFault = false;
        let keypadError = false;
        let keypadIndex = [];
        let jammerError = false;

        if (flagSystemStatus[7] == "1") { this.setState({ fireAlarm: true }); }
        if (flagSystemFault[6] == "1") { this.setState({ sirenCable: true }); }
        if (flagSystemStatus[6] == "1") { sirenFault = true; this.setState({ sirenFault: true }); }
        if (flagSystemStatus[5] == "1") { electricFault = true; this.setState({ electricFault: true }); }
        if (((ApiCall.akuVolt / 10) < 11.5) && ApiCall.akuStatus != 0) {
          akuFault = true;
          this.setState({
            akuFault: true
          });
        }
        if (ApiCall.akuStatus == 0) {
          akuNotFoundFault = true;
          akuFault = false;
          this.setState({
            akuNotFoundFault: true,
            akuFault: false
          });
        }
        if (flagSystemStatus[4] == "1") { centralDoorOpenFault = true; this.setState({ centralDoorOpenFault: true }); }
        if (flagMixedControl[5] == "1") { telLineFault = true; this.setState({ telLineFault: true }); }
        if (flagSystemFault[4] == "1") { jammerError = true; this.setState({ jammerError: true }); }

        if (flagKeypadStatus[4] == "1" || flagKeypadStatus[5] == "1" || flagKeypadStatus[6] == "1" || flagKeypadStatus[7] == "1") {
          keypadError = true;
          for (let index = 0; index < 4; index++) {
            if (flagKeypadStatus[index] == "1")
              keypadIndex.push(index + 1);
          }
          this.setState({ keypadIndex: keypadIndex, keypadError: keypadError });
        }

        if (sirenFault || electricFault || akuFault || akuNotFoundFault || centralDoorOpenFault
          || telLineFault || keypadError || jammerError || sirenCable)
          this.setState({ errorFound: true });

        let flagYanginZonu = false;
        if (ApiCall.yanginZonTipi != undefined && ApiCall.yanginZonTipi == 1) {
          flagYanginZonu = true;
        }

        if (ApiCall.yanginDurum != undefined) {
          if (ApiCall.yanginDurum == "2") {
            this.setState({ yanginZonuError: true });
          } else {
            this.setState({ yanginZonuError: false });
          }
        }

        if (ApiCall.zonBilgisi != undefined && ApiCall.zonBilgisi != null)
          this.setState({
            menu: flagAktifBolge,
            zonData: true,
            zonBilgisi: JSON.parse(JSON.stringify(ApiCall.zonBilgisi.zon)),
            bolgeStatus: [ApiCall.bolgeStatus[0], ApiCall.bolgeStatus[1], ApiCall.bolgeStatus[2], ApiCall.bolgeStatus[3]],
            bolgeAlarm: [ApiCall.bolgeAlarm[0], ApiCall.bolgeAlarm[1], ApiCall.bolgeAlarm[2], ApiCall.bolgeAlarm[3]],
            programAyar: JSON.parse(JSON.stringify(ApiCall.programAyar.program)),
            haftaninGunu: ApiCall.haftaninGunu,
            yanginZonu: flagYanginZonu
          });

        this.getZon();

      }
    });
    //
    FCM.on(FCMEvent.Notification, async (notif) => {



      if (Platform.OS == 'android') {



        if (notif.fcm.body.includes("Bölge ")) {
          //  let flagString = notif.fcm.body.split("Bölge ");

          //  if (flagString[1][0] != undefined) {
          // partition = (Number(flagString[1][0]) - 1);
          // }
        }
        else {

          this.aktifdil = " ";
          if (notif.fcm.body.includes("panik modda") || notif.fcm.body.includes("panic mode!")) {
            this.aktifdil = " ";
          }

        }

        //  if (notif.fcm.body.includes("Partition ")) {
        //  if (!notif.fcm.body.includes("panik modda")) {
        //   let flagString = notif.fcm.body.split("Partition ");
        //   if (flagString[1][0] != undefined) {
        //  partition = (Number(flagString[1][0]) - 1);
        // }
        //}

        // }

        if (this.aktifbolgesayac == this.aktifbolgesayac2)
          if (notif.fcm.icon == 'alarm') {
            this.aktifbolgesayac++;
            this.aktifbolgesayac2++;
            // if (this.aktifbolgesayac == this.aktifbolgesayac2)
            Alert.alert(
              notif.fcm.title,
              notif.fcm.body + this.aktifdil,
              [
                { text: langObj.cancel, onPress: () => console.log('Cancel pressed'), style: 'cancel' },
                {
                  text: langObj.close, onPress: () => {
                    if (this.partition == 0)
                      ApiCall.disarmSystem();
                    if (this.partition == 1)
                      ApiCall.disarmSystemNew(1);
                    if (this.partition == 2)
                      ApiCall.disarmSystemNew(2);
                    if (this.partition == 3)
                      ApiCall.disarmSystemNew(3);

                  }
                },
              ],
              { cancelable: false }
            )
          }
          else {  //if (notif.fcm.icon == 'other') 
            Alert.alert(
              notif.fcm.title,
              notif.fcm.body,
              [
                { text: langObj.ok, onPress: () => console.log('Cancel'), style: 'cancel' },
              ],
              { cancelable: false }
            )
          }
        // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
        if (notif.local_notification) {
          //this is a local notification
          console.log('local notification')
        }
        if (notif.opened_from_tray) {
          //iOS: app is open/resumed because user clicked banner
          //Android: app is open/resumed because user clicked banner or tapped app icon
          console.log('notification open tray');
        }

        switch (notif._notificationType) {
          case NotificationType.Remote:
            notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
            break;
          case NotificationType.NotificationResponse:
            notif.finish();
            break;
          case NotificationType.WillPresent:
            notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
            break;
        }
      }


      if (Platform.OS === 'ios') {

        notif.finish();
        if (notif.test == 'alarm')
          Alert.alert(
            notif.aps.alert.title,
            notif.aps.alert.body,
            [
              { text: langObj.cancel, onPress: () => console.log('Cancel pressed'), style: 'cancel' },
              {
                text: langObj.close, onPress: () => {
                  if (this.partition == 0)
                    ApiCall.disarmSystem();
                  if (this.partition == 1)
                    ApiCall.disarmSystemNew(1);
                  if (this.partition == 2)
                    ApiCall.disarmSystemNew(2);
                  if (this.partition == 3)
                    ApiCall.disarmSystemNew(3);
                }
              },
            ],
            { cancelable: false }
          )
        if (notif.test == 'other')
          Alert.alert(
            notif.aps.alert.title,
            notif.aps.alert.body,
            [
              { text: langObj.ok, onPress: () => console.log('Cancel pressed'), style: 'cancel' },
            ],
            { cancelable: false }
          )

        if (notif._actionIdentifier === 'com.myapp.MyCategory.Confirm') {

        }
        //optional
        //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application.
        //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
        //notif._notificationType is available for iOS platfrom
        switch (notif._notificationType) {
          case NotificationType.Remote:
            notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
            break;
          case NotificationType.NotificationResponse:
            notif.finish();
            break;
          case NotificationType.WillPresent:
            notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
            break;
        }
      }
    });
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

    errorHataNoktasi = [langObj.sirenErr, langObj.panicErr, langObj.powerErr, langObj.batteryErr];
    errorAlarmNoktasi = [langObj.sirenAlarm, langObj.panicAlarm, langObj.powerAlarm, langObj.batterAlarm];
    this.durum = [langObj.statusDisabled, langObj.statusArmed, langObj.statusHome, langObj.statusProgram, langObj.statusProgramAway, langObj.statusProgramHome];

    this.forceUpdate();
  }

  @action
  componentDidMount() {
    this.getLanguage();
    if (this.props.index) {
      a = setInterval(() => {
        if (ApiCall.userDevice != null && ApiCall.userDevice.length != 0) {
          console.log("interval1")
          this.getShortStatusForDashboard();
        }
      }, 5000);
    }

    const { navigation } = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      this.getZonName();
      if (global.deviceId != undefined) {
        ApiCall.getStatus(global.deviceId).then((x) => {
          if (x) {
            this.getUser();
            let flagAktifBolge = [];
            if (ApiCall.bolgeAktif[0]) {
              flagAktifBolge.push({ title: langObj.bolgeAktif1 });
              this.aktifbolge = 0;
            }

            if (ApiCall.bolgeAktif[1]) {
              flagAktifBolge.push({ title: langObj.bolgeAktif2 });
              this.aktifbolge = 1;
            }

            if (ApiCall.bolgeAktif[2]) {
              flagAktifBolge.push({ title: langObj.bolgeAktif3 });
              this.aktifbolge = 2;
            }

            if (ApiCall.bolgeAktif[3]) {
              flagAktifBolge.push({ title: langObj.bolgeAktif4 });
              this.aktifbolge = 3;
            }

            this.setState({ menu: flagAktifBolge });

            let flagSystemFault = "00000000";
            let flagSystemStatus = "00000000";
            let flagKeypadStatus = "00000000";
            let flagMixedControl = "00000000";

            if (!isNaN(ApiCall.sistemFault)) {
              flagSystemFault = ApiCall.sistemFault.toString(2);
              flagSystemFault = new Array((9 - flagSystemFault.length)).join('0') + flagSystemFault;
            }

            if (!isNaN(ApiCall.sistemStatus)) {
              flagSystemStatus = ApiCall.sistemStatus.toString(2);
              flagSystemStatus = new Array((9 - flagSystemStatus.length)).join('0') + flagSystemStatus;
            }

            if (!isNaN(ApiCall.keypadStatus)) {
              flagKeypadStatus = ApiCall.keypadStatus.toString(2);
              flagKeypadStatus = new Array((9 - flagKeypadStatus.length)).join('0') + flagKeypadStatus;
            }

            if (!isNaN(ApiCall.mixedControls)) {
              flagMixedControl = ApiCall.mixedControls.toString(2);
              flagMixedControl = new Array((9 - flagMixedControl.length)).join('0') + flagMixedControl;
            }

            let sirenFault = false;
            let sirenCable = false;
            let electricFault = false;
            let akuFault = false;
            let akuNotFoundFault = false;
            let centralDoorOpenFault = false;
            let telLineFault = false;
            let keypadError = false;
            let keypadIndex = [];
            let jammerError = false;

            if (flagSystemStatus[7] == "1") { this.setState({ fireAlarm: true }); }
            if (flagSystemFault[6] == "1") { sirenCable = true; this.setState({ sirenCable: true }); }

            if (flagSystemStatus[6] == "1") { sirenFault = true; this.setState({ sirenFault: true }); }
            if (flagSystemStatus[5] == "1") { electricFault = true; this.setState({ electricFault: true }); }
            if ((ApiCall.akuVolt / 10) < 11.5) { akuFault = true; this.setState({ akuFault: true }); }
            if (ApiCall.akuStatus == 0) { akuNotFoundFault = true; this.setState({ akuNotFoundFault: true, akuFault: false }); }
            if (flagSystemStatus[4] == "1") { centralDoorOpenFault = true; this.setState({ centralDoorOpenFault: true }); }
            if (flagMixedControl[5] == "1") { telLineFault = true; this.setState({ telLineFault: true }); }
            if (flagSystemFault[4] == "1") { jammerError = true; this.setState({ jammerError: true }); }

            if (flagKeypadStatus[4] == "1" || flagKeypadStatus[5] == "1" || flagKeypadStatus[6] == "1" || flagKeypadStatus[7] == "1") {
              keypadError = true;
              for (let index = 0; index < 4; index++) {
                if (flagKeypadStatus[index] == "1")
                  keypadIndex.push(index + 1);
              }
              this.setState({ keypadIndex: keypadIndex, keypadError: keypadError });
            }

            if (sirenFault || electricFault || akuFault || akuNotFoundFault || centralDoorOpenFault
              || telLineFault || keypadError || jammerError || sirenCable)
              this.setState({ errorFound: true });

            let flagYanginZonu = false;
            if (ApiCall.yanginZonTipi != undefined && ApiCall.yanginZonTipi == 1) {
              flagYanginZonu = true;
            }

            if (ApiCall.yanginDurum != undefined) {
              if (ApiCall.yanginDurum == "2") {
                this.setState({ yanginZonuError: true });
              } else {
                this.setState({ yanginZonuError: false });
              }
            }

            if (ApiCall.zonBilgisi != undefined && ApiCall.zonBilgisi != null)
              this.setState({
                zonData: true,
                zonBilgisi: JSON.parse(JSON.stringify(ApiCall.zonBilgisi.zon)),
                bolgeStatus: [ApiCall.bolgeStatus[0], ApiCall.bolgeStatus[1], ApiCall.bolgeStatus[2], ApiCall.bolgeStatus[3]],
                bolgeAlarm: [ApiCall.bolgeAlarm[0], ApiCall.bolgeAlarm[1], ApiCall.bolgeAlarm[2], ApiCall.bolgeAlarm[3]],
                programAyar: JSON.parse(JSON.stringify(ApiCall.programAyar.program)),
                haftaninGunu: ApiCall.haftaninGunu,
                yanginZonu: flagYanginZonu,
                keyForRender: 1
              });

            this.getZon();
          }
        });
      }

      if (a == null) {
        a = setInterval(() => {
          if (ApiCall.userDevice != null && ApiCall.userDevice.length != 0) {
            console.log("startInterval2")
            this.getShortStatusForDashboard();
          }
        }, 5000);
      }
    });

  }


  componentWillUnmount() {
    if (a != undefined && a != null) {
      console.log("clearInterval1")
      clearInterval(a);
    }

    if (this.focusListener != null && this.focusListener.remove) {
      this.focusListener.remove();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.index !== this.props.index) {
      if (this.props.index != 1) {
        console.log("clearInterval2")
        clearInterval(a);
      }
      if ((prevProps.index == 0 || prevProps.index == 2) && this.props.index == 1) {
        if (global.deviceId != undefined) {
          ApiCall.getStatus(global.deviceId);
          if(a != null)
          {
            clearInterval(a);
            // a = setInterval(() => {
            //   console.log("startInterval")
            //   this.getShortStatusForDashboard();
            // },5000)
          }
        }
      }
      if (this.props.index == 1) {

        //06.01.2022 - 08:54
        ApiCall.getStatus(global.deviceId).then((x) => {
          if (x) {
            this.getUser();
            let flagAktifBolge = [];
            if (ApiCall.bolgeAktif[0])
              flagAktifBolge.push({ title: langObj.bolgeAktif1 });
            if (ApiCall.bolgeAktif[1])
              flagAktifBolge.push({ title: langObj.bolgeAktif2 });
            if (ApiCall.bolgeAktif[2])
              flagAktifBolge.push({ title: langObj.bolgeAktif3 });
            if (ApiCall.bolgeAktif[3])
              flagAktifBolge.push({ title: langObj.bolgeAktif4 });
            this.setState({ menu: flagAktifBolge });

            let flagSystemFault = "00000000";
            let flagSystemStatus = "00000000";
            let flagKeypadStatus = "00000000";
            let flagMixedControl = "00000000";

            if (!isNaN(ApiCall.sistemFault)) {
              flagSystemFault = ApiCall.sistemFault.toString(2);
              flagSystemFault = new Array((9 - flagSystemFault.length)).join('0') + flagSystemFault;
            }

            if (!isNaN(ApiCall.sistemStatus)) {
              flagSystemStatus = ApiCall.sistemStatus.toString(2);
              flagSystemStatus = new Array((9 - flagSystemStatus.length)).join('0') + flagSystemStatus;
            }

            if (!isNaN(ApiCall.keypadStatus)) {
              flagKeypadStatus = ApiCall.keypadStatus.toString(2);
              flagKeypadStatus = new Array((9 - flagKeypadStatus.length)).join('0') + flagKeypadStatus;
            }

            if (!isNaN(ApiCall.mixedControls)) {
              flagMixedControl = ApiCall.mixedControls.toString(2);
              flagMixedControl = new Array((9 - flagMixedControl.length)).join('0') + flagMixedControl;
            }

            let sirenFault = false;
            let sirenCable = false;
            let electricFault = false;
            let akuFault = false;
            let akuNotFoundFault = false;
            let centralDoorOpenFault = false;
            let telLineFault = false;
            let keypadError = false;
            let keypadIndex = [];
            let jammerError = false;

           
            if (flagSystemStatus[7] == "1") { this.setState({ fireAlarm: true }); }
            if (flagSystemFault[6] == "1") { sirenCable = true; this.setState({ sirenCable: true }); }
            if (flagSystemStatus[6] == "1") { sirenFault = true; this.setState({ sirenFault: true }); }
            if (flagSystemStatus[5] == "1") { electricFault = true; this.setState({ electricFault: true }); }
            if ((ApiCall.akuVolt / 10) < 11.5) { akuFault = true; this.setState({ akuFault: true }); }

            if (ApiCall.akuStatus == 0) { akuNotFoundFault = true; this.setState({ akuNotFoundFault: true, akuFault: false }); }
            if (flagSystemStatus[4] == "1") { centralDoorOpenFault = true; this.setState({ centralDoorOpenFault: true });  }
            if (flagMixedControl[5] == "1") { telLineFault = true; this.setState({ telLineFault: true }); }
            if (flagSystemFault[4] == "1") { jammerError = true; this.setState({ jammerError: true }); }

            if (flagKeypadStatus[4] == "1" || flagKeypadStatus[5] == "1" || flagKeypadStatus[6] == "1" || flagKeypadStatus[7] == "1") {
              keypadError = true;
              for (let index = 0; index < 4; index++) {
                if (flagKeypadStatus[index] == "1")
                  keypadIndex.push(index + 1);
              }
              this.setState({ keypadIndex: keypadIndex, keypadError: keypadError });
            }

            if (sirenFault || electricFault || akuFault || akuNotFoundFault || centralDoorOpenFault
              || telLineFault || keypadError || jammerError || sirenCable)
              this.setState({ errorFound: true });

            let flagYanginZonu = false;
            if (ApiCall.yanginZonTipi != undefined && ApiCall.yanginZonTipi == 1) {
              flagYanginZonu = true;
            }

            if (ApiCall.yanginDurum != undefined) {
              if (ApiCall.yanginDurum == "2") {
                this.setState({ yanginZonuError: true });
              } else {
                this.setState({ yanginZonuError: false });
              }
            }

            if (ApiCall.zonBilgisi != undefined && ApiCall.zonBilgisi != null)
              this.setState({
                zonData: true,
                zonBilgisi: JSON.parse(JSON.stringify(ApiCall.zonBilgisi.zon)),
                bolgeStatus: [ApiCall.bolgeStatus[0], ApiCall.bolgeStatus[1], ApiCall.bolgeStatus[2], ApiCall.bolgeStatus[3]],
                bolgeAlarm: [ApiCall.bolgeAlarm[0], ApiCall.bolgeAlarm[1], ApiCall.bolgeAlarm[2], ApiCall.bolgeAlarm[3]],
                programAyar: JSON.parse(JSON.stringify(ApiCall.programAyar.program)),
                haftaninGunu: ApiCall.haftaninGunu,
                yanginZonu: flagYanginZonu,
                keyForRender: 1
              });

            this.getZon();
          }
        });

        this.getZonName();
        a = setInterval(() => {
          if (ApiCall.userDevice != null && ApiCall.userDevice.length != 0) {
            this.getShortStatusForDashboard();
          }
        }, 5000);
      }
    }
  }

  //get all zone name from shared prefs
  @action
  async getZonName() {
    this.ZonName = await SharedPrefs.getAllZon();
    this.ZonName[8] = langObj.fireZone;

  }

  decimalToUTF8(stringArray, index) {
    let flagZoneName = "";
    let stringDecimalArray = stringArray.split(",");
    if (stringDecimalArray[0] != "0") {
      for (let index = 0; index < stringDecimalArray.length; index++) {
        if (parseInt(stringDecimalArray[index]) != 0) {
          flagZoneName += String.fromCharCode(parseInt(stringDecimalArray[index]));
        } else
          break;
      }
    } else
      flagZoneName = langObj.zon + " " + index;

    return flagZoneName;
  }

  @action
  async getZon() {
    if (this.state.zonBilgisi != null) {
      let zoneIndexes1 = [];
      let zoneIndexes2 = [];
      let zoneIndexes3 = [];
      let zoneIndexes4 = [];
      let flagZoneTest1 = [];
      let flagZoneTest2 = [];
      let flagZoneTest3 = [];
      let flagZoneTest4 = [];



      for (let index = 0; index < 32; index++) {//hsn
        if (this.state.zonBilgisi[index].partition == 0) {
          //hsn
          this.aktifbolge = 1;
          zoneIndexes1.push(index);
          if (this.state.zonBilgisi[index].zonTipi != 0)
            flagZoneTest1.push({ state: 0, tip: 0, Hata: 0, Alarm: 0, partition: 0, index: index });
        }

        if (this.state.zonBilgisi[index].partition == 1) {
          this.aktifbolge = 2;
          zoneIndexes2.push(index);
          if (this.state.zonBilgisi[index].zonTipi != 0)
            flagZoneTest2.push({ state: 0, tip: 0, Hata: 0, Alarm: 0, partition: 1, index: index });
        }

        if (this.state.zonBilgisi[index].partition == 2) {
          this.aktifbolge = 3;
          zoneIndexes3.push(index);
          if (this.state.zonBilgisi[index].zonTipi != 0)
            flagZoneTest3.push({ state: 0, tip: 0, Hata: 0, Alarm: 0, partition: 2, index: index });
        }

        if (this.state.zonBilgisi[index].partition == 3) {
          this.aktifbolge = 4;
          zoneIndexes4.push(index);
          if (this.state.zonBilgisi[index].zonTipi != 0)
            flagZoneTest4.push({ state: 0, tip: 0, Hata: 0, Alarm: 0, partition: 3, index: index });
        }
      }


      //hsn
      for (let index = 0; index < zoneIndexes1.length; index++) {
        let stringZoneName = this.decimalToUTF8(this.state.zonBilgisi[zoneIndexes1[index]].zonAdi, zoneIndexes1[index] + 1);
        this.zonNameNew[zoneIndexes1[index]] = stringZoneName;
        this.zonTipi[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].zonTipi;
        this.zonDurum[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].durum;
        if (this.state.zonBilgisi[zoneIndexes1[index]].durum != 0) {
          this.aktifsayi = index + 1;
        }
        this.zonBolge[zoneIndexes1[index]] = 1;
        this.zonBagTip[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].baglantiTipi;

      }

      for (let index = 0; index < zoneIndexes2.length; index++) {
        let stringZoneName = this.decimalToUTF8(this.state.zonBilgisi[zoneIndexes2[index]].zonAdi, zoneIndexes2[index] + 1);
        this.zonNameNew[zoneIndexes2[index]] = stringZoneName;
        this.zonTipi[zoneIndexes2[index]] = this.state.zonBilgisi[zoneIndexes2[index]].zonTipi;
        this.zonDurum[zoneIndexes2[index]] = this.state.zonBilgisi[zoneIndexes2[index]].durum;
        if (this.state.zonBilgisi[zoneIndexes1[index]].durum != 0) {
          this.aktifsayi = index + 1;
        }
        this.zonBolge[zoneIndexes2[index]] = 2;
        this.zonBagTip[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].baglantiTipi;
      }

      for (let index = 0; index < zoneIndexes3.length; index++) {
        let stringZoneName = this.decimalToUTF8(this.state.zonBilgisi[zoneIndexes3[index]].zonAdi, zoneIndexes3[index] + 1);
        this.zonNameNew[zoneIndexes3[index]] = stringZoneName;
        this.zonTipi[zoneIndexes3[index]] = this.state.zonBilgisi[zoneIndexes3[index]].zonTipi;
        this.zonDurum[zoneIndexes3[index]] = this.state.zonBilgisi[zoneIndexes3[index]].durum;
        if (this.state.zonBilgisi[zoneIndexes1[index]].durum != 0) {
          this.aktifsayi = index + 1;
        }
        this.zonBolge[zoneIndexes3[index]] = 3;
        this.zonBagTip[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].baglantiTipi;
      }

      for (let index = 0; index < zoneIndexes4.length; index++) {
        let stringZoneName = this.decimalToUTF8(this.state.zonBilgisi[zoneIndexes4[index]].zonAdi, zoneIndexes4[index] + 1);
        this.zonNameNew[zoneIndexes4[index]] = stringZoneName;
        this.zonTipi[zoneIndexes4[index]] = this.state.zonBilgisi[zoneIndexes4[index]].zonTipi;
        this.zonDurum[zoneIndexes4[index]] = this.state.zonBilgisi[zoneIndexes4[index]].durum;
        if (this.state.zonBilgisi[zoneIndexes1[index]].durum != 0) {
          this.aktifsayi = index + 1;
        }
        this.zonBolge[zoneIndexes4[index]] = 4;
        this.zonBagTip[zoneIndexes1[index]] = this.state.zonBilgisi[zoneIndexes1[index]].baglantiTipi;
      }


      this.setState({
        zoneTest1: flagZoneTest1,
        zoneTest2: flagZoneTest2,
        zoneTest3: flagZoneTest3,
        zoneTest4: flagZoneTest4

      });

      if (this.state.haftaninGunu != null && this.state.programAyar != null) {
        if (this.state.haftaninGunu < 6) {
          let flagProgramTime = [];
          for (let index = 0; index < 4; index++) {
            flagProgramTime.push(this.state.programAyar[index].haftaiciProgrami.timeString);
          }
          this.setState({ programTime: flagProgramTime });
        } else if (this.state.haftaninGunu == 6) {
          let flagProgramTime2 = [];
          for (let index = 0; index < 4; index++) {
            flagProgramTime2.push(this.state.programAyar[index].cumartesiProgrami.timeString);
          }
          this.setState({ programTime: flagProgramTime2 });
        } else if (this.state.haftaninGunu == 7) {
          let flagProgramTime3 = [];
          for (let index = 0; index < 4; index++) {
            flagProgramTime3.push(this.state.programAyar[index].pazarProgrami.timeString);
          }
          this.setState({ programTime: flagProgramTime3 });
        }
      }
    }
    else {
      this.getStatusForDashboard();
    }
  }

  //get user
  @action
  async getUser() {
    user = await SharedPrefs.getlogindata();

    //burada cihazID'sinden çekerek ismini almak gerekiyor.
    //this.deviceName = await SharedPrefs.getDeviceName();
    this.deviceName = global.deviceName;
    this.deviceId = user.deviceId;
  }

  //zon durum 0=hat normal 1=hat kopuk(blue) 2=hat kısa(yellow) 4=hat alarm(red)
  _renderItem = ({ item, index }) => {
    //zon item color and alert text
    let zColor = ['#f1c40f', '#f1c40f', '#f1c40f', '', "#c0392b"];
    let errorInfo = [langObj.zonStatusNormal, langObj.lineBroken, langObj.lineShortCircuit, '', langObj.lineAlarmed];
    if (item.tip == 0) {
      return (<ZonView
        color={"white"}
        text={this.ZonName[index] == null ? langObj.zon + " " + (index + 1) : this.ZonName[index]}
        blink={true}
      />)
    }
    else if (item.Alarm > 0 || item.Hata > 0) {
      return (
        <View >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                langObj.errorInfo,
                errorInfo[item.state],
                [
                  { text: langObj.close, onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false }
              );
            }} >
            <ZonView
              color={zColor[item.state]}
              text={this.ZonName[index] == null ? langObj.zon + " " + (index + 1) : this.ZonName[index]}
              blink={true}
            />
          </TouchableOpacity>
        </View>
      )
    }
    else return (
      <ZonView
        color={"#27ae60"}
        text={this.ZonName[index] == null ? langObj.zon + " " + (index + 1) : this.ZonName[index]}
        blink={true}
      />);
  }

  //hata ve alarm noktalarını kontrol et kurmadan önce
  checkErrorAndWarnings() {
    for (let a = 0; a < 4; a++) {
      if (ApiCall.ZonStateAlarmNoktasi[a + 9] > 0) { return true }
    }
    ApiCall.ZonStateHataNoktasi.map((entry) => {
      if (entry > 0) {
        return true;
      }
      else return false
    })
  }

  checkErrorAndWarningsNew(partition) {
    for (let index = 0; index < this.zonDurum.length; index++) {
      if (this.zonDurum[index] == 1 && this.zonBolge[index] == partition) {
        return true;
      }
    }

    if (this.state.errorFound) {
      return true;
    }
  }

  renderStatusCard() {
    //var d = new Date();
    //var weekOfDay = d.getDay();
    //console.log(ApiCall.statusData.data);
    // if (weekOfDay == 0) this.weekOfDayText = ApiCall.statusData.data.programayar.cumartesiprogrami.timestring;
    // else if (weekOfDay == 6) this.weekOfDayText = ApiCall.statusData.data.programayar.pazarprogrami.timestring;
    // else this.weekOfDayText = ApiCall.statusData.data.programayar.haftaiciprogrami.timestring;

    let iconType = ['clear', 'verified-user', 'home', 'timelapse', 'timelapse', 'timelapse']
    let iconColor = ['#cc1e18', 'green', 'blue', "#1abc9c", "#1abc9c", "#1abc9c"]
    return (
      <View style={{
        borderWidth: 1, borderRadius: 6,
        width: '90%', borderColor: iconColor[ApiCall.sistemkurulummodu],
        borderBottomWidth: 0, backgroundColor: iconColor[ApiCall.sistemkurulummodu],
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8, shadowRadius: 10, elevation: 3
      }}>
        <View style={{ flex: 0.8, alignSelf: 'center', backgroundColor: iconColor[ApiCall.sistemkurulummodu], width: '100%', borderRadius: 6 }} >
          <View style={{ flex: 0.7, backgroundColor: iconColor[ApiCall.sistemkurulummodu], flexDirection: 'row', borderBottomWidth: 1, borderColor: 'white', marginTop: 5 }} >
            <View style={{ flex: 0.4, alignItems: 'flex-start', justifyContent: 'center', marginLeft: 10 }} >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }} >{global.deviceName}</Text>
            </View>
            <View style={{ flex: 0.2, justifyContent: 'center' }}>
              <Icon
                containerStyle={{
                  width: 48, height: 48, alignSelf: 'center', borderRadius: 34, borderWidth: 2, borderColor: iconColor[ApiCall.sistemkurulummodu], elevation: 4, backgroundColor: 'white', shadowColor: '#ddd',
                  shadowOffset: { width: 2, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                }}
                name={iconType[ApiCall.sistemkurulummodu]}
                color={iconColor[ApiCall.sistemkurulummodu]}
                size={40}
                onPress={() => {
                  this.getShortStatusForDashboard();
                }}
              />
            </View>
            <View style={{ flex: 0.4, alignItems: 'flex-end', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700', fontSize: 22 }}  >{langObj.status}</Text>
              <Text style={{ color: 'white' }} >{this.durum[ApiCall.sistemkurulummodu]}</Text>
              {ApiCall.sistemkurulummodu > 2 && <Text>{this.weekOfDayText}</Text>}
            </View>
          </View>
          <TouchableOpacity style={{ flex: 0.3, flexDirection: 'row', justifyContent: 'space-between' }} onPress={() => { this.showAlarmAlert = true; }} >
            {this.renderError()}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderError() {
    let errorIcons = [{ logo: "volume-off", type: 'material-community' }, { logo: "exclamation", type: 'font-awesome' },
    { logo: "plug", type: 'font-awesome' }, { logo: "battery-quarter", type: 'font-awesome' }];
    let alarmIcons = [{ logo: "volume-off", type: 'material-community' }, { logo: "exclamation", type: 'font-awesome' },
    { logo: "plug", type: 'font-awesome' }, { logo: "battery-alert", type: 'material-community' }];

    return errorIcons.map((data, index) => {
      if (ApiCall.ZonStateHataNoktasi[index + 9] || ApiCall.ZonStateAlarmNoktasi[index + 9])
        return (
          <Icon
            containerStyle={{ width: '25%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={ApiCall.ZonStateHataNoktasi[index] ? errorIcons[index].logo : alarmIcons[index].logo}
            type={ApiCall.ZonStateHataNoktasi[index] ? errorIcons[index].type : alarmIcons[index].type}
            key={index}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                ApiCall.ZonStateHataNoktasi[index + 9] ? errorHataNoktasi[index] : errorAlarmNoktasi[index],
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />
        )
    });
  }

  renderErrorCardNew() {
    let errorIcons = [{ logo: "volume-off", type: 'material-community' }, { logo: "plug", type: 'font-awesome' },
    { logo: "battery-quarter", type: 'font-awesome' }, { logo: "battery-alert", type: 'material-community' },
    { logo: "door-open", type: 'material-community' }, { logo: "phone-off", type: 'material-community' },
    { logo: "keyboard-off", type: 'material-community' }, { logo: "wifi-off", type: 'material-community' }];

    return (
      <View style={{
        borderWidth: 1, borderRadius: 6, width: '90%', borderColor: "#cc1e18",
        borderBottomWidth: 0, backgroundColor: "#cc1e18", shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 3
      }}>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: "flex-start" }} onPress={() => { this.showAlarmAlert = true; }} >

          {this.state.sirenFault && <Icon  //
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[0].logo}
            type={errorIcons[0].type}
            key={0}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.sirenErr,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.sirenCable && <Icon  //
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[0].logo}
            type={errorIcons[0].type}
            key={0}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.sirenCut,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.electricFault && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[1].logo}
            type={errorIcons[1].type}
            key={1}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.powerAlarm,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.akuFault && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[2].logo}
            type={errorIcons[2].type}
            key={2}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.batteryErr,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.akuNotFoundFault && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[3].logo}
            type={errorIcons[3].type}
            key={3}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.batteryNotFound,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.centralDoorOpenFault && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[4].logo}
            type={errorIcons[4].type}
            key={4}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.centralDoorOpenErr,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.telLineFault && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[5].logo}
            type={errorIcons[5].type}
            key={5}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.noPhoneLineErr,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.keypadError && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[6].logo}
            type={errorIcons[6].type}
            key={6}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.keypadErrorErr,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

          {this.state.jammerError && <Icon
            containerStyle={{ width: '20%', height: '100%', alignSelf: 'center', marginTop: 20 }}
            name={errorIcons[7].logo}
            type={errorIcons[7].type}
            key={7}
            color={'white'}
            size={26}
            onPress={() => {
              Alert.alert(
                langObj.logInfo,
                langObj.jammerError,
                [
                  { text: langObj.ok, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          />}

        </TouchableOpacity>
      </View>
    )
  }

  toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let flagExpanded = this.state.expanded;
    flagExpanded[index] = !flagExpanded[index];
    this.setState({ expanded: flagExpanded })
  }

  renderNewZones = ({ item, index }) => {
    let zColor = ['#f1c40f', "#c0392b", '#f1c40f', '#f1c40f'];  //sarı, sarı, sarı, kırmızı
    let errorInfo = [langObj.zonStatusNormal, langObj.lineAlarmed, langObj.lineBroken, langObj.lineShortCircuit];   //[langObj.zonStatusNormal, langObj.lineAlarmed, langObj.lineBrokenOrShortCircuit, langObj.lineBrokenOrShortCircuit];

    if (this.zonTipi[item.index] == 0) {
      return (


        <View>
          <TouchableOpacity onPress={() => {
            Alert.alert(
              langObj.logInfo, langObj.zonStatusNormal,
              [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
              { cancelable: false }
            );
          }} >
            <ZonView2
              color={"white"}
              text={this.zonNameNew[item.index].substring(0, 20)}
              blink={true}
            />

          </TouchableOpacity>


        </View>

      )
    }
    else if (this.zonDurum[item.index] > 0) {   //item.index
      return (

        <View >
          <TouchableOpacity
            onPress={() => {

              // this.state.zonBilgisi[zoneIndexes3[index]].zonTipi
              /*     Alert.alert(
                     langObj.errorInfo, errorInfo[this.zonDurum[item.index]] + "  zon durumu:" + this.zonDurum[item.index] + " zon bağlantı tipi   " + this.zonTipi[item.index],
                     [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                     { cancelable: false }
                   );*/

              if (this.zonBagTip[item.index] == 1 && this.zonDurum[this.index] == 2) {
                Alert.alert(
                  langObj.errorInfo, langObj.lineBrokenOrShortCircuit,
                  [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                  { cancelable: false }
                );
              }
              else if (this.zonBagTip[item.index] == 3 && this.zonDurum[item.index] == 2) { //3
                Alert.alert(
                  langObj.errorInfo, langObj.deviceUnreached,
                  [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                  { cancelable: false }
                );
              }
              else if (this.zonDurum[item.index] == 1) { //1  alarm durumunda
                Alert.alert(
                  langObj.logInfo, errorInfo[this.zonDurum[item.index]],
                  [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                  { cancelable: false }
                );
              }
              else {
                Alert.alert(
                  langObj.errorInfo, errorInfo[this.zonDurum[item.index]],
                  [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                  { cancelable: false }
                );
              }

            }} >
            <ZonView2
              color={zColor[this.zonDurum[item.index]]}
              text={this.zonNameNew[item.index].substring(0, 20)}
              blink={true}
            />
          </TouchableOpacity>
        </View>
      )
    }
    else return (
      /*
      <ZonView2
        color={"#27ae60"}
        text={this.zonNameNew[item.index]}
        blink={true}
      /> */
      <View>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            langObj.logInfo, langObj.zonStatusNormal,
            [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
          );
        }} >
          <ZonView2
            color={"#27ae60"}
            text={this.zonNameNew[item.index].substring(0, 20)}
            blink={true}
          />

        </TouchableOpacity>
      </View>

    );
  }

  renderFireZone = () => {
    if (this.state.yanginZonuError) {
      return (
        <View >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                langObj.errorInfo, langObj.lineBroken,
                [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
              );
            }} >
            <ZonView2
              color={"#f1c40f"}
              text={langObj.fireZone.substring(0, 20)}
              blink={true}
            />
          </TouchableOpacity>
        </View>
      )
    } else if (this.state.fireAlarm) {
      return (
        <View >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                langObj.errorInfo, langObj.lineAlarmed,
                [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
              );
            }} >
            <ZonView2
              color={"#c0392b"}
              text={langObj.fireZone.substring(0, 20)}
              blink={true}
            />
          </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                langObj.logInfo, langObj.zonStatusNormal,
                [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
              );
            }} >
            <ZonView2
              color={"#27ae60"}
              text={langObj.fireZone.substring(0, 20)}
              blink={true}
            />
          </TouchableOpacity>
        </View>

      )
    }
  }

  getShortStatusForDashboard = () => {
    ApiCall.getShortStatus(global.deviceId).then((x) => {
      //Toast.show("centralDoorOpenFault: güncellendi", Toast.LONG);
      console.log("güncellendi getShort status  x degeri: " + x  +  "cihazın idsi:" + global.deviceId )
      if (x) {
        let flagAktifBolge = [];
        if (ApiCall.bolgeAktif[0])
          flagAktifBolge.push({ title: langObj.bolgeAktif1 });
        if (ApiCall.bolgeAktif[1])
          flagAktifBolge.push({ title: langObj.bolgeAktif2 });
        if (ApiCall.bolgeAktif[2])
          flagAktifBolge.push({ title: langObj.bolgeAktif3 });
        if (ApiCall.bolgeAktif[3])
          flagAktifBolge.push({ title: langObj.bolgeAktif4 });
        this.setState({ menu: flagAktifBolge });

        let flagSystemFault = "00000000";
        let flagSystemStatus = "00000000";
        let flagMixedControl = "00000000";

        if (!isNaN(ApiCall.sistemFault)) {
          flagSystemFault = ApiCall.sistemFault.toString(2);
          flagSystemFault = new Array((9 - flagSystemFault.length)).join('0') + flagSystemFault;
        }

        if (!isNaN(ApiCall.sistemStatus)) {
          flagSystemStatus = ApiCall.sistemStatus.toString(2);
          flagSystemStatus = new Array((9 - flagSystemStatus.length)).join('0') + flagSystemStatus;
        }

        if (!isNaN(ApiCall.mixedControls)) {
          flagMixedControl = ApiCall.mixedControls.toString(2);
          flagMixedControl = new Array((9 - flagMixedControl.length)).join('0') + flagMixedControl;
        }

        let sirenFault = false;
        let sirenCable = false;
        let electricFault = false;
        let akuNotFoundFault = false;
        let centralDoorOpenFault = false;
        let telLineFault = false;
        let jammerError = false;
        let keypadIndex = [];
        let keypadError = false;


        if (flagMixedControl[0] == "1" || flagMixedControl[1] == "1" || flagMixedControl[2] == "1" || flagMixedControl[3] == "1") {
          keypadError = true;
          for (let index = 0; index < 4; index++) {
            if (flagMixedControl[index] == "1")
              keypadIndex.push(index + 1);
          }
          this.setState({ keypadIndex: keypadIndex, keypadError: keypadError });
        }

        if (flagSystemStatus[7] == "1") this.setState({ fireAlarm: true }); else this.setState({ fireAlarm: false });
        if (flagSystemFault[6] == "1") { sirenCable = true; this.setState({ sirenCable: true }); } else this.setState({ sirenCable: false });
        if (flagSystemStatus[6] == "1") { sirenFault = true; this.setState({ sirenFault: true }); } else this.setState({ sirenFault: false });
        if (flagSystemStatus[5] == "1") { electricFault = true; this.setState({ electricFault: true }); } else this.setState({ electricFault: false });

        if (flagMixedControl[4] == "1") {
          akuNotFoundFault = true;
          this.setState({ akuNotFoundFault: true, akuFault: false });
        }
        else
          this.setState({ akuNotFoundFault: false });

        //Toast.show("flagSystemStatus:" + flagSystemStatus[4] )
        if (flagSystemStatus[4] == "1") { centralDoorOpenFault = true; this.setState({ centralDoorOpenFault: true }); } else this.setState({ centralDoorOpenFault: false });
        if (flagMixedControl[5] == "1") { telLineFault = true; this.setState({ telLineFault: true }); } else this.setState({ telLineFault: false });
        if (flagSystemFault[4] == "1") { jammerError = true; this.setState({ jammerError: true }); } else this.setState({ jammerError: false });

        if (sirenFault || electricFault || akuNotFoundFault || centralDoorOpenFault
          || telLineFault || jammerError || keypadError || sirenCable)
          this.setState({ errorFound: true });
        else
          this.setState({ errorFound: false });

        if (ApiCall.yanginDurum != undefined) {
          if (ApiCall.yanginDurum == "2") {
            this.setState({ yanginZonuError: true });
          } else {
            this.setState({ yanginZonuError: false });
          }
        }

        if (ApiCall.zonBilgisi != undefined && ApiCall.zonBilgisi != null) {
          this.setState({
            zonData: true,
            zonBilgisi: JSON.parse(JSON.stringify(ApiCall.zonBilgisi.zon)),
            bolgeStatus: [ApiCall.bolgeStatus[0], ApiCall.bolgeStatus[1], ApiCall.bolgeStatus[2], ApiCall.bolgeStatus[3]],
            bolgeAlarm: [ApiCall.bolgeAlarm[0], ApiCall.bolgeAlarm[1], ApiCall.bolgeAlarm[2], ApiCall.bolgeAlarm[3]]
          });

          this.getZon();
        }
      }
      else{

      }
    });
  }

  getStatusForDashboard = () => {
    ApiCall.getStatus(global.deviceId).then((x) => {
      if (x) {
        this.getUser();
        let flagAktifBolge = [];
        if (ApiCall.bolgeAktif[0])
          flagAktifBolge.push({ title: langObj.bolgeAktif1 });
        if (ApiCall.bolgeAktif[1])
          flagAktifBolge.push({ title: langObj.bolgeAktif2 });
        if (ApiCall.bolgeAktif[2])
          flagAktifBolge.push({ title: langObj.bolgeAktif3 });
        if (ApiCall.bolgeAktif[3])
          flagAktifBolge.push({ title: langObj.bolgeAktif4 });

        let flagSystemFault = "00000000";
        let flagSystemStatus = "00000000";
        let flagKeypadStatus = "00000000";
        let flagMixedControl = "00000000";

        if (!isNaN(ApiCall.sistemFault)) {
          flagSystemFault = ApiCall.sistemFault.toString(2);
          flagSystemFault = new Array((9 - flagSystemFault.length)).join('0') + flagSystemFault;
        }

        if (!isNaN(ApiCall.sistemStatus)) {
          flagSystemStatus = ApiCall.sistemStatus.toString(2);
          flagSystemStatus = new Array((9 - flagSystemStatus.length)).join('0') + flagSystemStatus;
        }

        if (!isNaN(ApiCall.keypadStatus)) {
          flagKeypadStatus = ApiCall.keypadStatus.toString(2);
          flagKeypadStatus = new Array((9 - flagKeypadStatus.length)).join('0') + flagKeypadStatus;
        }

        if (!isNaN(ApiCall.mixedControls)) {
          flagMixedControl = ApiCall.mixedControls.toString(2);
          flagMixedControl = new Array((9 - flagMixedControl.length)).join('0') + flagMixedControl;
        }

        let sirenFault = false;
        let sirenCable = false;
        let electricFault = false;
        let akuFault = false;
        let akuNotFoundFault = false;
        let centralDoorOpenFault = false;
        let telLineFault = false;
        let keypadError = false;
        let keypadIndex = [];
        let jammerError = false;

        if (flagSystemStatus[7] == "1") { this.setState({ fireAlarm: true }); }
        if (flagSystemFault[6] == "1") { sirenCable = true; this.setState({ sirenCable: true }); }
        if (flagSystemStatus[6] == "1") { sirenFault = true; this.setState({ sirenFault: true }); }
        if (flagSystemStatus[5] == "1") { electricFault = true; this.setState({ electricFault: true }); }
        if (((ApiCall.akuVolt / 10) < 11.5) && ApiCall.akuStatus != 0) {
          akuFault = true;
          this.setState({
            akuFault: true
          });
        }
        if (ApiCall.akuStatus == 0) {
          akuNotFoundFault = true;
          akuFault = false;
          this.setState({
            akuNotFoundFault: true,
            akuFault: false
          });
        }
        if (flagSystemStatus[4] == "1") { centralDoorOpenFault = true; this.setState({ centralDoorOpenFault: true }); }
        if (flagMixedControl[5] == "1") { telLineFault = true; this.setState({ telLineFault: true }); }
        if (flagSystemFault[4] == "1") { jammerError = true; this.setState({ jammerError: true }); }

        if (flagKeypadStatus[4] == "1" || flagKeypadStatus[5] == "1" || flagKeypadStatus[6] == "1" || flagKeypadStatus[7] == "1") {
          keypadError = true;
          for (let index = 0; index < 4; index++) {
            if (flagKeypadStatus[index] == "1")
              keypadIndex.push(index + 1);
          }
          this.setState({ keypadIndex: keypadIndex, keypadError: keypadError });
        }

        if (sirenFault || electricFault || akuFault || akuNotFoundFault || centralDoorOpenFault
          || telLineFault || keypadError || jammerError || sirenCable)
          this.setState({ errorFound: true });

        let flagYanginZonu = false;
        if (ApiCall.yanginZonTipi != undefined && ApiCall.yanginZonTipi == 1) {
          flagYanginZonu = true;
        }

        if (ApiCall.yanginDurum != undefined) {
          if (ApiCall.yanginDurum == "2") {
            this.setState({ yanginZonuError: true });
          } else {
            this.setState({ yanginZonuError: false });
          }
        }

        if (ApiCall.zonBilgisi != undefined && ApiCall.zonBilgisi != null)
          this.setState({
            menu: flagAktifBolge,
            zonData: true,
            zonBilgisi: JSON.parse(JSON.stringify(ApiCall.zonBilgisi.zon)),
            bolgeStatus: [ApiCall.bolgeStatus[0], ApiCall.bolgeStatus[1], ApiCall.bolgeStatus[2], ApiCall.bolgeStatus[3]],
            bolgeAlarm: [ApiCall.bolgeAlarm[0], ApiCall.bolgeAlarm[1], ApiCall.bolgeAlarm[2], ApiCall.bolgeAlarm[3]],
            programAyar: JSON.parse(JSON.stringify(ApiCall.programAyar.program)),
            haftaninGunu: ApiCall.haftaninGunu,
            yanginZonu: flagYanginZonu
          });
      }
    });
  }

  render() {
    let alarmInfo = ["", langObj.statusAlarmWillSound, langObj.statusAlarmEmergency, langObj.statusAlarmSudden, langObj.statusAlarmSilent,
      langObj.statusAlarmPanic, langObj.statusAlarmSounded, langObj.statusAlarmEmergencySounded, langObj.statusAlarmSuddenSounded,
      langObj.statusAlarmSilentSounded, langObj.statusAlarmPanicSounded, langObj.statusAlarmSoundEnd];
    let statusInfo = [langObj.disabled, langObj.outsideArmed, langObj.insideArmed, langObj.programmed, langObj.programOutsideArmed,
    langObj.programInsideArmed];
    let statusBackgroundColor = ['#cc1e18', 'green', 'blue', "#1abc9c", "#1abc9c", "#1abc9c"];  //kırmızı, yeşil, mavi, açık yeşil, aç...

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

        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'space-between' }} >
          <DisarmAlert show={this.disarmSystemAlert}
            silent={() => { this.disarmSystemAlert = false; ApiCall.disarmSystemWithModeNew('setArmSystemSilent', this.partition) }}
            panic={() => { this.disarmSystemAlert = false; ApiCall.disarmSystemWithModeNew('setArmSystemPanic', this.partition) }}
            normal={() => { this.disarmSystemAlert = false; ApiCall.disarmSystemNew(this.partition); }}
            close={() => { this.disarmSystemAlert = false }}
          />
          <ErrorAndAlarmAlertNew show={this.showAlarmAlert} close={() => { this.showAlarmAlert = false }} />
          {ApiCall.stateStatus == 'pending' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 &&
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.htmlSetupColor }}>
              <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
              <Text style={{ marginTop: 10, color: "white" }}>{langObj.loading}</Text>
            </View>}

          {ApiCall.stateStatus == 'done' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 && <View>
            <View style={{ alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
              <ScrollView>
                {this.state.errorFound && <View style={{ height: 60, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                  {this.renderErrorCardNew()}
                </View>}

                {this.state.zonData && <View>
                  {(this.state.menu[0] != undefined && this.state.menu[0] != null) && <View>
                    <View style={{ height: 1, color: '#ffffff', width: '100%' }} />
                    <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand(0)}>
                      <Text style={[styles.title]}>{this.state.menu[0].title}</Text>
                      <Icon name={this.state.expanded[0] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={'#5E5E5E'} />
                    </TouchableOpacity>
                    {this.state.expanded[0] && <View style={{ borderRadius: 6, marginTop: 5 }} >
                      <View style={{
                        width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
                        borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4, marginBottom: 10
                      }} >
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(1))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#1abc9c";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[0] = 3;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmNew(3, 0);

                                      // önceki hali...
                                      // ApiCall.setArmPNew(3, 0).then(() => {
                                      //   this.getShortStatusForDashboard();
                                      // });
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#1abc9c";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[0] = 3;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmNew(3, 0);

                              // önceki hali...
                              // ApiCall.setArmPNew(3, 0).then(() => {
                              //   this.getShortStatusForDashboard();
                              // });
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: (this.state.bolgeStatus[0] == 3 || this.state.bolgeStatus[0] == 4 || this.state.bolgeStatus[0] == 5) ? '#1abc9c' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="calendar-clock"
                              type="material-community"
                              color={(this.state.bolgeStatus[0] == 3 || this.state.bolgeStatus[0] == 4 || this.state.bolgeStatus[0] == 5) ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: (this.state.bolgeStatus[0] == 3 || this.state.bolgeStatus[0] == 4 || this.state.bolgeStatus[0] == 5) ? 'white' : '#30363b' }} >
                              {langObj.programming}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(1))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[0] = 2;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmNew(2, 0);

                                      // ApiCall.setArmNew(2, 0).then(() => {
                                      //   this.getShortStatusForDashboard();
                                      // });
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[0] = 2;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmNew(2, 0);

                              //önceki hali...
                              // ApiCall.setArmNew(2, 0).then(() => {
                              //   this.getShortStatusForDashboard();
                              // });
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[0] == 2 ? 'blue' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="home"
                              color={this.state.bolgeStatus[0] == 2 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[0] == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(1))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "green";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[0] = 1;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmNew(1, 0);

                                      // önceki hali...
                                      // ApiCall.setArmNew(1, 0).then(() => {
                                      //   this.getShortStatusForDashboard();
                                      // });
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              )
                            else {
                              this.htmlSetupColor = "green";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[0] = 1;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmNew(1, 0);

                              // önceki hali...
                              // ApiCall.setArmNew(1, 0).then(() => {
                              //   this.getShortStatusForDashboard();
                              // });
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[0] == 1 ? 'green' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="verified-user"
                              size={28}
                              color={this.state.bolgeStatus[0] == 1 ? 'white' : '#30363b'}
                            />
                            <Text style={{ color: this.state.bolgeStatus[0] == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            this.htmlSetupColor = "#d32f2f";
                            let flagBolgeStatus = this.state.bolgeStatus.slice();
                            flagBolgeStatus[0] = 0;
                            this.setState({
                              bolgeStatus: flagBolgeStatus
                            });

                            ApiCall.disarmSystemNew(0);

                            // önceki hali...
                            // ApiCall.disarmSystemNew(0).then(() => {
                            //   this.getShortStatusForDashboard();
                            // });
                          }}
                          delayLongPress={300} onLongPress={() => {
                            this.disarmSystemAlert = true;
                            this.partition = 0;
                          }} >
                          <View style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.bolgeStatus[0] == 0 ? '#cc1e18' : 'transparent' }}>
                            <Icon
                              containerStyle={{ width: 40, alignSelf: 'center' }}
                              name="clear"
                              color={this.state.bolgeStatus[0] == 0 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[0] == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {(!this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: this.state.bolgeStatus[0] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[0]],
                          backgroundColor: this.state.bolgeStatus[0] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[0]],
                        }}>
                          {(this.state.bolgeStatus[0] > 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{this.state.programTime[0]}</Text>}
                          {(this.state.bolgeStatus[0] <= 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{alarmInfo[this.state.bolgeAlarm[0]]}</Text>}
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[0]]}</Text>
                        </View>
                      </View>}

                      {(this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: "#cc1e18", backgroundColor: "#cc1e18"
                        }}>
                          <Icon containerStyle={{ marginLeft: 10, width: 30 }} name="local-fire-department" color='white' size={30} />
                          <Text style={{ color: 'white', fontSize: 13 }}>{langObj.statusAlarmFire}</Text>
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[0]]}</Text>
                        </View>
                      </View>}

                      <View style={{ alignItems: 'center' }}>
                        <FlatList
                          data={this.state.zoneTest1}
                          renderItem={(item) => this.renderNewZones(item)}
                          numColumns={4}
                          keyExtractor={(item, index) => index}
                          columnWrapperStyle={{ margin: 5 }}
                        />

                        {(this.state.yanginZonu) && <View>
                          {this.renderFireZone()}
                        </View>}
                      </View>
                    </View>}
                  </View>}

                  {(this.state.menu[1] != undefined && this.state.menu[1] != null) && <View>
                    <View style={{ height: 1, color: '#ffffff', width: '100%' }} />
                    <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand(1)}>
                      <Text style={[styles.title]}>{this.state.menu[1].title}</Text>
                      <Icon name={this.state.expanded[1] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={'#5E5E5E'} />
                    </TouchableOpacity>
                    {this.state.expanded[1] && <View style={{ borderRadius: 6, marginTop: 5 }} >
                      <View style={{
                        width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
                        borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4, marginBottom: 10
                      }} >
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(2))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm,
                                    onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[1] = 3;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmNew(3, 1);


                                      // ApiCall.setArmPNew(3, 1); 
                                      // this.getShortStatusForDashboard(); 
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[1] = 3;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmNew(3, 1);

                              // ApiCall.setArmPNew(3, 1);
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[1] == 3 ? '#1abc9c' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="calendar-clock"
                              type="material-community"
                              color={this.state.bolgeStatus[1] == 3 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[1] == 3 ? 'white' : '#30363b' }} >{langObj.programming}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(2))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[1] = 2;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmNew(2, 1);

                                      // ApiCall.setArmNew(2, 1);
                                      // this.getShortStatusForDashboard();
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[1] = 2;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmNew(2, 1);

                              // ApiCall.setArmNew(2, 1); 
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[1] == 2 ? 'blue' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="home"
                              color={this.state.bolgeStatus[1] == 2 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[1] == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          if (this.checkErrorAndWarningsNew(2))
                            Alert.alert(
                              langObj.sure,
                              langObj.alarmWillSound,
                              [
                                {
                                  text: langObj.arm, onPress: () => {
                                    this.htmlSetupColor = "green";

                                    let flagBolgeStatus = this.state.bolgeStatus.slice();
                                    flagBolgeStatus[1] = 1;
                                    this.setState({
                                      bolgeStatus: flagBolgeStatus
                                    });

                                    ApiCall.setArmNew(1, 1);

                                    // ApiCall.setArmNew(1, 1); 
                                    // this.getShortStatusForDashboard(); 
                                  }
                                },
                                { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                              ],
                              { cancelable: false }
                            )
                          else {
                            this.htmlSetupColor = "green";

                            let flagBolgeStatus = this.state.bolgeStatus.slice();
                            flagBolgeStatus[1] = 1;
                            this.setState({
                              bolgeStatus: flagBolgeStatus
                            });

                            ApiCall.setArmNew(1, 1);

                            // ApiCall.setArmNew(1, 1);
                            // this.getShortStatusForDashboard();
                          }
                        }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[1] == 1 ? 'green' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="verified-user"
                              size={28}
                              color={this.state.bolgeStatus[1] == 1 ? 'white' : '#30363b'}
                            />
                            <Text style={{ color: this.state.bolgeStatus[1] == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          this.htmlSetupColor = "#d32f2f";

                          let flagBolgeStatus = this.state.bolgeStatus.slice();
                          flagBolgeStatus[1] = 0;
                          this.setState({
                            bolgeStatus: flagBolgeStatus
                          });

                          ApiCall.disarmSystemNew(1);

                          // ApiCall.disarmSystemNew(1);
                          // this.getShortStatusForDashboard();
                        }}
                          delayLongPress={300} onLongPress={() => {
                            this.disarmSystemAlert = true;
                            this.partition = 1;
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: this.state.bolgeStatus[1] == 0 ? '#cc1e18' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ width: 40, alignSelf: 'center' }}
                              name="clear"
                              color={this.state.bolgeStatus[1] == 0 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[1] == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {(!this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: this.state.bolgeStatus[1] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[1]],
                          backgroundColor: this.state.bolgeStatus[1] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[1]],
                        }}>
                          {(this.state.bolgeStatus[1] > 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{this.state.programTime[1]}</Text>}
                          {(this.state.bolgeStatus[1] <= 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{alarmInfo[this.state.bolgeAlarm[1]]}</Text>}
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[1]]}</Text>
                        </View>
                      </View>}

                      {(this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: "#cc1e18", backgroundColor: "#cc1e18"
                        }}>
                          <Icon containerStyle={{ marginLeft: 10, width: 30 }} name="local-fire-department" color='white' size={30} />
                          <Text style={{ color: 'white', fontSize: 13 }}>{langObj.statusAlarmFire}</Text>
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[1]]}</Text>
                        </View>
                      </View>}

                      <View style={{ alignItems: 'center' }}>
                        <FlatList
                          data={this.state.zoneTest2}
                          renderItem={(item) => this.renderNewZones(item)}
                          numColumns={4}
                          keyExtractor={(item, index) => index}
                          columnWrapperStyle={{ margin: 5 }}
                        />

                        {(this.state.yanginZonu) && <View>
                          {this.renderFireZone()}
                        </View>}
                      </View>
                    </View>}
                  </View>}

                  {(this.state.menu[2] != undefined && this.state.menu[2] != null) && <View>
                    <View style={{ height: 1, color: '#ffffff', width: '100%' }} />
                    <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand(2)}>
                      <Text style={[styles.title]}>{this.state.menu[2].title}</Text>
                      <Icon name={this.state.expanded[2] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={'#5E5E5E'} />
                    </TouchableOpacity>
                    {this.state.expanded[2] && <View style={{ borderRadius: 6, marginTop: 5 }} >
                      <View style={{
                        width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
                        borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4, marginBottom: 10
                      }} >
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(3))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[2] = 3;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmPNew(3, 2);

                                      // ApiCall.setArmPNew(3, 2);
                                      // this.getShortStatusForDashboard();
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[2] = 3;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmPNew(3, 2);

                              // ApiCall.setArmPNew(3, 2);
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[2] == 3 ? '#1abc9c' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="calendar-clock"
                              type="material-community"
                              color={this.state.bolgeStatus[2] == 3 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[2] == 3 ? 'white' : '#30363b' }} >{langObj.programming}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(3))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[2] = 2;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmPNew(2, 2);

                                      // ApiCall.setArmNew(2, 2); 
                                      // this.getShortStatusForDashboard(); 
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[2] = 2;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmPNew(2, 2);

                              // ApiCall.setArmNew(2, 2);
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[2] == 2 ? 'blue' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="home"
                              color={this.state.bolgeStatus[2] == 2 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[2] == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          if (this.checkErrorAndWarningsNew(3))
                            Alert.alert(
                              langObj.sure,
                              langObj.alarmWillSound,
                              [
                                {
                                  text: langObj.arm, onPress: () => {
                                    this.htmlSetupColor = "green";

                                    let flagBolgeStatus = this.state.bolgeStatus.slice();
                                    flagBolgeStatus[2] = 1;
                                    this.setState({
                                      bolgeStatus: flagBolgeStatus
                                    });

                                    ApiCall.setArmPNew(1, 2);

                                    // ApiCall.setArmNew(1, 2);
                                    // this.getShortStatusForDashboard();
                                  }
                                },
                                { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                              ],
                              { cancelable: false }
                            )
                          else {
                            this.htmlSetupColor = "green";

                            let flagBolgeStatus = this.state.bolgeStatus.slice();
                            flagBolgeStatus[2] = 1;
                            this.setState({
                              bolgeStatus: flagBolgeStatus
                            });

                            ApiCall.setArmPNew(1, 2);


                            ApiCall.setArmNew(1, 2);
                            this.getShortStatusForDashboard();
                          }
                        }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[2] == 1 ? 'green' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="verified-user"
                              size={28}
                              color={this.state.bolgeStatus[2] == 1 ? 'white' : '#30363b'}
                            />
                            <Text style={{ color: this.state.bolgeStatus[2] == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          this.htmlSetupColor = "#d32f2f";

                          let flagBolgeStatus = this.state.bolgeStatus.slice();
                          flagBolgeStatus[2] = 0;
                          this.setState({
                            bolgeStatus: flagBolgeStatus
                          });

                          ApiCall.disarmSystemNew(2);

                          // ApiCall.disarmSystemNew(2);
                          // this.getShortStatusForDashboard();
                        }}
                          delayLongPress={300} onLongPress={() => {
                            this.disarmSystemAlert = true;
                            this.partition = 2;
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: this.state.bolgeStatus[2] == 0 ? '#cc1e18' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ width: 40, alignSelf: 'center' }}
                              name="clear"
                              color={this.state.bolgeStatus[2] == 0 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[2] == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {(!this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: this.state.bolgeStatus[2] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[2]],
                          backgroundColor: this.state.bolgeStatus[2] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[2]],
                        }}>
                          {(this.state.bolgeStatus[2] > 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{this.state.programTime[2]}</Text>}
                          {(this.state.bolgeStatus[2] <= 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{alarmInfo[this.state.bolgeAlarm[2]]}</Text>}
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[2]]}</Text>
                        </View>
                      </View>}

                      {(this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: "#cc1e18", backgroundColor: "#cc1e18"
                        }}>
                          <Icon containerStyle={{ marginLeft: 10, width: 30 }} name="local-fire-department" color='white' size={30} />
                          <Text style={{ color: 'white', fontSize: 13 }}>{langObj.statusAlarmFire}</Text>
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[2]]}</Text>
                        </View>
                      </View>}

                      <View style={{ alignItems: 'center' }}>
                        <FlatList
                          data={this.state.zoneTest3}
                          renderItem={(item) => this.renderNewZones(item)}
                          numColumns={4}
                          keyExtractor={(item, index) => index}
                          columnWrapperStyle={{ margin: 5 }}
                        />

                        {(this.state.yanginZonu) && <View>
                          {this.renderFireZone()}
                        </View>}
                      </View>
                    </View>}
                  </View>}

                  {(this.state.menu[3] != undefined && this.state.menu[3] != null) && <View>
                    <View style={{ height: 1, color: '#ffffff', width: '100%' }} />
                    <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand(3)}>
                      <Text style={[styles.title]}>{this.state.menu[3].title}</Text>
                      <Icon name={this.state.expanded[3] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={'#5E5E5E'} />
                    </TouchableOpacity>
                    {this.state.expanded[3] && <View style={{ borderRadius: 6, marginTop: 5 }} >
                      <View style={{
                        width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
                        borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4, marginBottom: 10
                      }} >
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(4))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[3] = 3;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmPNew(3, 3);

                                      // ApiCall.setArmPNew(3, 3);
                                      // this.getShortStatusForDashboard();
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[3] = 3;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmPNew(3, 3);

                              // ApiCall.setArmPNew(3, 3);
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[3] == 3 ? '#1abc9c' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="calendar-clock"
                              type="material-community"
                              color={this.state.bolgeStatus[3] == 3 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[3] == 3 ? 'white' : '#30363b' }} >{langObj.programming}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                          onPress={() => {
                            if (this.checkErrorAndWarningsNew(4))
                              Alert.alert(
                                langObj.sure,
                                langObj.alarmWillSound,
                                [
                                  {
                                    text: langObj.arm, onPress: () => {
                                      this.htmlSetupColor = "#2962ff";

                                      let flagBolgeStatus = this.state.bolgeStatus.slice();
                                      flagBolgeStatus[3] = 2;
                                      this.setState({
                                        bolgeStatus: flagBolgeStatus
                                      });

                                      ApiCall.setArmPNew(2, 3);


                                      // ApiCall.setArmNew(2, 3);
                                      // this.getShortStatusForDashboard();
                                    }
                                  },
                                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                              );
                            else {
                              this.htmlSetupColor = "#2962ff";

                              let flagBolgeStatus = this.state.bolgeStatus.slice();
                              flagBolgeStatus[3] = 2;
                              this.setState({
                                bolgeStatus: flagBolgeStatus
                              });

                              ApiCall.setArmPNew(2, 3);

                              // ApiCall.setArmNew(2, 3);
                              // this.getShortStatusForDashboard();
                            }
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[3] == 2 ? 'blue' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="home"
                              color={this.state.bolgeStatus[3] == 2 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[3] == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          if (this.checkErrorAndWarningsNew(4))
                            Alert.alert(
                              langObj.sure,
                              langObj.alarmWillSound,
                              [
                                {
                                  text: langObj.arm, onPress: () => {
                                    this.htmlSetupColor = "green";

                                    let flagBolgeStatus = this.state.bolgeStatus.slice();
                                    flagBolgeStatus[3] = 1;
                                    this.setState({
                                      bolgeStatus: flagBolgeStatus
                                    });

                                    ApiCall.setArmPNew(1, 3);

                                    // ApiCall.setArmNew(1, 3); 
                                    // this.getShortStatusForDashboard(); 
                                  }
                                },
                                { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                              ],
                              { cancelable: false }
                            )
                          else {
                            this.htmlSetupColor = "green";

                            let flagBolgeStatus = this.state.bolgeStatus.slice();
                            flagBolgeStatus[3] = 1;
                            this.setState({
                              bolgeStatus: flagBolgeStatus
                            });

                            ApiCall.setArmPNew(1, 3);

                            // ApiCall.setArmNew(1, 3);
                            // this.getShortStatusForDashboard();
                          }
                        }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: this.state.bolgeStatus[3] == 1 ? 'green' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                              name="verified-user"
                              size={28}
                              color={this.state.bolgeStatus[3] == 1 ? 'white' : '#30363b'}
                            />
                            <Text style={{ color: this.state.bolgeStatus[3] == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                          this.htmlSetupColor = "#d32f2f";

                          let flagBolgeStatus = this.state.bolgeStatus.slice();
                          flagBolgeStatus[3] = 0;
                          this.setState({
                            bolgeStatus: flagBolgeStatus
                          });

                          ApiCall.disarmSystemNew(3);

                          // ApiCall.disarmSystemNew(3);
                          // this.getShortStatusForDashboard();
                        }}
                          delayLongPress={300} onLongPress={() => {
                            this.disarmSystemAlert = true;
                            this.partition = 3;
                          }} >
                          <View style={{
                            flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: this.state.bolgeStatus[3] == 0 ? '#cc1e18' : 'transparent'
                          }}>
                            <Icon
                              containerStyle={{ width: 40, alignSelf: 'center' }}
                              name="clear"
                              color={this.state.bolgeStatus[3] == 0 ? 'white' : '#30363b'}
                              size={28}
                            />
                            <Text style={{ color: this.state.bolgeStatus[3] == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {(!this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: this.state.bolgeStatus[3] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[2]],
                          backgroundColor: this.state.bolgeStatus[3] == 0 ? 'gray' : statusBackgroundColor[this.state.bolgeStatus[2]],
                        }}>
                          {(this.state.bolgeStatus[3] > 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{this.state.programTime[3]}</Text>}
                          {(this.state.bolgeStatus[3] <= 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{alarmInfo[this.state.bolgeAlarm[3]]}</Text>}
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[3]]}</Text>
                        </View>
                      </View>}

                      {(this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                          borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'space-between', borderBottomWidth: 0,
                          borderColor: "#cc1e18", backgroundColor: "#cc1e18"
                        }}>
                          <Icon containerStyle={{ marginLeft: 10, width: 30 }} name="local-fire-department" color='white' size={30} />
                          <Text style={{ color: 'white', fontSize: 13 }}>{langObj.statusAlarmFire}</Text>
                          <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.bolgeStatus[3]]}</Text>
                        </View>
                      </View>}

                      <View style={{ alignItems: 'center' }}>
                        <FlatList
                          data={this.state.zoneTest4}
                          renderItem={(item) => this.renderNewZones(item)}
                          numColumns={4}
                          keyExtractor={(item, index) => index}
                          columnWrapperStyle={{ margin: 5 }}
                        />

                        {(this.state.yanginZonu) && <View>
                          {this.renderFireZone()}
                        </View>}
                      </View>
                    </View>}
                  </View>}

                </View>}
              </ScrollView>
            </View>
          </View>}

          {(ApiCall.userDevice == null || (ApiCall.userDevice != null && ApiCall.userDevice.length == 0)) &&
            <View style={{ flex: 8.5, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
              <View style={{
                borderWidth: 1, borderRadius: 6, width: '75%', borderColor: '#ddd', borderBottomWidth: 0,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 10,
                elevation: 3, alignSelf: 'center', backgroundColor: 'white'
              }} >
                <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.noDeviceFound} </Text>
                <Text>{"\n"}
                  {langObj.mustAddDevice}
                </Text>
                <TouchableOpacity onPress={() => {
                  // if (a !== null)
                  //   clearInterval(a);
                  this.props.navigation.navigate("AddDevice");
                }} >
                  <Text style={{ alignSelf: 'flex-end', margin: 10, color: "#cc1e18" }} >{"\n"} {langObj.addDevice}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }

          {ApiCall.stateStatus == 'error' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 &&
            <View style={{
              flex: 8.5, alignItems: 'center', flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }} >
              <View style={{
                borderWidth: 1,
                borderRadius: 6,
                width: '75%',
                borderColor: '#ddd',
                borderBottomWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 3, alignSelf: 'center', backgroundColor: 'white'
              }} >
                <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.connectionFailed}</Text>
                <Text style={{ marginLeft: 5 }} >{"\n"}
                  {langObj.sorry}
                  {langObj.connErrMakeSure}
                </Text>
                <TouchableOpacity onPress={() => {
                  ApiCall.getStatus(global.deviceId);
                  ApiCall.setStateStatus('pending');
                }} >
                  <Text style={{ alignSelf: 'flex-end', margin: 10, color: "#cc1e18" }} >{"\n"} {langObj.tryAgain}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        </SafeAreaView>
      );
    }
    else if (result == "") {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'space-between' }} >
          {(ApiCall.userDevice == null || (ApiCall.userDevice != null && ApiCall.userDevice.length == 0)) &&
            <View style={{ flex: 8.5, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
              <View style={{
                borderWidth: 1, borderRadius: 6, width: '75%', borderColor: '#ddd', borderBottomWidth: 0,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 10,
                elevation: 3, alignSelf: 'center', backgroundColor: 'white'
              }} >
                <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.noDeviceFound} </Text>
                <Text>{"\n"}
                  {langObj.mustAddDevice}
                </Text>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate("AddDevice");
                }} >
                  <Text style={{ alignSelf: 'flex-end', margin: 10, color: "#cc1e18" }} >{"\n"} {langObj.addDevice}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        </SafeAreaView>
      );
    }
    else {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'space-between' }} >
          <DisarmAlert show={this.disarmSystemAlert}
            silent={() => { this.disarmSystemAlert = false; ApiCall.disarmSystemWithMode('setArmSystemSilent') }}
            panic={() => { this.disarmSystemAlert = false; ApiCall.disarmSystemWithMode('setArmSystemPanic') }}
            normal={() => { this.disarmSystemAlert = false; ApiCall.disarmSystem(); }}
            close={() => { this.disarmSystemAlert = false }} />

          <ErrorAndAlarmAlert show={this.showAlarmAlert} close={() => { this.showAlarmAlert = false }} />

          {ApiCall.stateStatus != "error" && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 && <View style={{
            width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
            borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4
          }} >
            <TouchableOpacity style={{ flex: 1 }}
              onPress={() => {
                if (this.checkErrorAndWarnings())
                  Alert.alert(
                    langObj.sure,
                    langObj.alarmWillSound,
                    [
                      { text: langObj.arm, onPress: () => { this.htmlSetupColor = "#2962ff"; ApiCall.setArm(2); } },
                      { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    ],
                    { cancelable: false }
                  );
                else {
                  this.htmlSetupColor = "#2962ff"; ApiCall.setArm(2);
                }
              }} >
              <View style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: ApiCall.sistemkurulummodu == 2 ? 'blue' : 'transparent' }}>
                <Icon
                  containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                  name="home"
                  color={ApiCall.sistemkurulummodu == 2 ? 'white' : '#30363b'}
                  size={28}
                />
                <Text style={{ color: ApiCall.sistemkurulummodu == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => {
              if (this.checkErrorAndWarnings())
                Alert.alert(
                  langObj.sure,
                  langObj.alarmWillSound,
                  [
                    { text: langObj.arm, onPress: () => { this.htmlSetupColor = "green"; ApiCall.setArm(1); } },
                    { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  ],
                  { cancelable: false }
                )
              else {
                this.htmlSetupColor = "green";
                ApiCall.setArm(1);
              }
            }} >
              <View style={{
                flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                backgroundColor: ApiCall.sistemkurulummodu == 1 ? 'green' : 'transparent'
              }}>
                <Icon
                  containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                  name="verified-user"
                  size={28}
                  color={ApiCall.sistemkurulummodu == 1 ? 'white' : '#30363b'}
                />
                <Text style={{ color: ApiCall.sistemkurulummodu == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { this.htmlSetupColor = "#d32f2f"; ApiCall.disarmSystem(); }}
              delayLongPress={300} onLongPress={() => { this.disarmSystemAlert = true; }} >
              <View style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: ApiCall.sistemkurulummodu == 0 ? '#cc1e18' : 'transparent' }}>
                <Icon
                  containerStyle={{ width: 40, alignSelf: 'center' }}
                  name="clear"
                  color={ApiCall.sistemkurulummodu == 0 ? 'white' : '#30363b'}
                  size={28}
                />
                <Text style={{ color: ApiCall.sistemkurulummodu == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
              </View>
            </TouchableOpacity>
          </View>}

          {ApiCall.stateStatus == 'pending' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 &&
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.htmlSetupColor }}>
              <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
              <Text style={{ marginTop: 10, color: "white" }}>{langObj.loading}</Text>
            </View>}

          {ApiCall.stateStatus == 'done' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 && <View style={{ flex: 1 }}>
            <View style={{
              flex: 0.5, alignItems: 'center', flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }} >
              {this.renderStatusCard()}
            </View>
            <View style={{ flex: 0.6, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
              <View style={{ borderRadius: 6, marginTop: 10 }} >
                <FlatList
                  data={ApiCall.Zone}
                  renderItem={this._renderItem}
                  numColumns={3}
                  keyExtractor={(item, index) => index}
                  columnWrapperStyle={{ margin: 10 }}
                />
              </View>
            </View>
          </View>}

          {(ApiCall.userDevice == null || (ApiCall.userDevice != null && ApiCall.userDevice.length == 0)) &&
            <View style={{ flex: 8.5, alignItems: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
              <View style={{
                borderWidth: 1,
                borderRadius: 6,
                width: '75%',
                borderColor: '#ddd',
                borderBottomWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 3, alignSelf: 'center', backgroundColor: 'white'
              }} >
                <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.noDeviceFound} </Text>
                <Text>{"\n"}
                  {langObj.mustAddDevice}
                </Text>
                <TouchableOpacity onPress={() => {
                  // if (a !== null)
                  //   clearInterval(a);
                  this.props.navigation.navigate("AddDevice");
                }} >
                  <Text style={{ alignSelf: 'flex-end', margin: 10, color: "#cc1e18" }} >{"\n"} {langObj.addDevice}</Text>
                </TouchableOpacity>
              </View>
            </View>}

          {ApiCall.stateStatus == 'error' && ApiCall.userDevice != null && ApiCall.userDevice.length > 0 &&
            <View style={{
              flex: 8.5, alignItems: 'center', flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }} >
              <View style={{
                borderWidth: 1,
                borderRadius: 6,
                width: '75%',
                borderColor: '#ddd',
                borderBottomWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 3, alignSelf: 'center', backgroundColor: 'white'
              }} >
                <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.connectionFailed}</Text>
                <Text style={{ marginLeft: 5 }} >{"\n"}
                  {langObj.sorry}
                  {langObj.connErrMakeSure}
                </Text>
                <TouchableOpacity onPress={() => {
                  ApiCall.getStatus(global.deviceId);
                  ApiCall.setStateStatus('pending');
                }} >
                  <Text style={{ alignSelf: 'flex-end', margin: 10, color: "#cc1e18" }} >{"\n"} {langObj.tryAgain}</Text>
                </TouchableOpacity>
              </View>
            </View>}
        </SafeAreaView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5E5E',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    alignItems: 'center',
    backgroundColor: '#ececec',
  }
});

export default Dashboard;