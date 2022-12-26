import React, { Component } from "react";
import { Text, NativeModules, View, BackHandler, Alert, ActivityIndicator, Platform } from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import DatePicker from 'react-native-datepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeviceLogin from '../Component/DeviceLogin';
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
let dateUpdater = null;
let newData = null;
let ddate = null;
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
class DateAndTime extends Component {

  @observable Datenow = null;
  @observable day = null;
  @observable year = null;
  @observable systemDate = "";
  @observable weekDay = null;
  @observable psd = !global.deviceLoggedin;

  constructor(props) {
    super(props);
    makeObservable(this);
    dateUpdater = null;
    newData = global.statusData;
    this.state = { date: this.getDate(), loading: false };
    this.Datenow = this.getDate();
    this.day = this.getDay();
    this.year = this.getYear();
    this.loading = true;
    this.getData();
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
  getData() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        let flagDeviceId = global.deviceId;
        let result = flagDeviceId.substring(10).substring(0, 8);
        if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
        if (result == "00000000") {
          ApiCall.getTimeSettings(global.deviceId).then((x) => {
            this.loading = false;
            if (x) {
              ddate = new Date();
              ddate.setUTCFullYear(x.year, x.month - 1, x.date);
              ddate.setMinutes(x.minute);
              ddate.setHours(x.hour);
              ddate.setSeconds(x.second);
              this.weekDay = x.weekDay;
              this.systemDate = this.getSystemDate(ddate, x.weekDay);

            }
            else Alert.alert(
              langObj.connErr,
              langObj.timeLoadErr,
              [
                { text: langObj.tryAgain, onPress: () => this.getData() },
                { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
              ],
              { cancelable: false }
            )
          }, y => {
            setTimeout(() => {
              this.loading = false;
            }, 5000);
          });
        }
        else {
          ApiCall.getStatus(global.deviceId).then((x) => {
            this.loading = false;
            if (x) {
              ddate = new Date();
              ddate.setUTCFullYear(global.statusData.data.yıl, global.statusData.data.ay - 1, global.statusData.data.gun);
              ddate.setMinutes(global.statusData.data.dakika);
              ddate.setHours(global.statusData.data.saat);
              ddate.setSeconds(global.statusData.data.saniye);
              this.weekDay = x.weekDay;
              this.systemDate = this.getSystemDate(ddate, global.statusData.data.haftaningunu);
            }
            else Alert.alert(
              langObj.connErr,
              langObj.timeLoadErr,
              [
                { text: langObj.tryAgain, onPress: () => this.getData() },
                { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
              ],
              { cancelable: false }
            )
          }, y => {
            setTimeout(() => {
              this.loading = false;
            }, 5000);
          });
        }
      }
      else
        Toast.show(langObj.internetConnFail, Toast.LONG);
    });
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
    dateUpdater =
      setInterval(() => {
        this.systemDate = this.getSystemDate(ddate, this.weekDay);
      }, 1000);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    clearInterval(dateUpdater);
  }

  getDate() {
    // DD MM YYYY,HH:mm:ss
    let now = new Date();
    let year = "" + now.getFullYear();
    let month = "" + now.getMonth() + 1; if (month.length == 1) { month = "0" + month; }
    let day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    let hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return day + ' ' + month + ' ' + year + ',' + hour + ':' + minute + ':' + second; //year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  getYear() {
    // DD MM YYYY,HH:mm:ss
    let now = new Date();
    let year = "" + now.getFullYear();
    let month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    let day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    return day + '/' + month + '/' + year//year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  getDay() {
    // DD MM YYYY,HH:mm:ss
    let now = new Date();
    let hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return hour + ':' + minute + ':' + second; //year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  @action
  getSystemDate(sDate, weekDay) {
    if (sDate == null)
      return ""
    else {
      sDate.setSeconds(sDate.getSeconds() + 1);
      let now = sDate;
      let year = "" + now.getFullYear();
      let month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
      let day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
      let hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
      let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
      let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
      let weekDayText = "";
      let haftaninGunleri = [langObj.day1, langObj.day2, langObj.day3, langObj.day4, langObj.day5, langObj.day6, langObj.day7];

      if (weekDay == 0)
        weekDayText = haftaninGunleri[6];
      else if (weekDay < 7)
        weekDayText = haftaninGunleri[weekDay - 1];
      else
        weekDayText = "";

      if (weekDayText == undefined)
        weekDayText = "";

      //console.log(day + '/' + month + '/' + '20' + year + ' ' + hour + ':' + minute + ':' + second + ' ' + weekDayText);
      return day + '/' + month + '/' + '20' + year + ' ' + hour + ':' + minute + ':' + second + ' ' + weekDayText;
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView extraHeight={20} enableOnAndroid={false} style={{ flex: 1, backgroundColor: 'white' }}>
        <DeviceLogin loading={this.psd} close={() => { this.psd = false; }} back={() => { this.props.navigation.goBack(); }} />
        <Text style={{ margin: 20, fontWeight: '400', fontSize: 20 }} >
          {langObj.dateTimeTop}
        </Text>
        <View style={{ alignItems: 'center', alignSelf: 'center', margin: 20 }} >
          <Text style={{ fontWeight: "bold" }}>
            {langObj.dateTimeBot}
          </Text>
          {this.systemDate == '' ? (<ActivityIndicator
            animating={true} />) :
            (<Text style={{ marginTop: 10 }}>
              {this.systemDate}
            </Text>)}
        </View>
        <View style={{ alignSelf: 'center' }}>
          {Platform.OS === 'android' && <View style={{ width: '90%', alignSelf: 'center', alignItems: "center" }}>
            <DatePicker
              style={{
                width: '90%', borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 1, alignItems: "center",
                backgroundColor: 'gainsboro', borderWidth: 1, borderColor: 'black', borderBottomWidth: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 3,
                marginTop: 20
              }}
              androidMode={'spinner'}
              date={this.year}
              mode="date"
              format="DD/MM/YYYY"
              is24Hour={true}
              showIcon={true}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36,
                  borderWidth: 0
                }
              }}
              onDateChange={(date) => { this.year = date; }}
            />
            <DatePicker
              style={{
                width: '90%', borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 1, alignItems: "center",
                backgroundColor: 'gainsboro', borderWidth: 1, borderColor: 'black', borderBottomWidth: 2,
                shadowColor: '#000', marginTop: 30,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 3
              }}
              date={this.day}
              placeholder={`Searched for ${this.d}`}
              androidMode="spinner"
              mode="time"
              format="HH:mm:ss"
              is24Hour={true}
              showIcon={true}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36,
                  borderWidth: 0
                }
              }}
              onDateChange={date => { this.day = date; }}
            />
          </View>
          }
          {Platform.OS === 'ios' && <View style={{ width: '100%' }}>
            <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>
              {langObj.newDateSystem}
            </Text>
            <DateTimePicker
              testID="dateTimePicker3"
              style={{ width: 115, alignSelf: 'center', marginTop: 10 }}
              value={new Date(this.year.split("/")[2], this.year.split("/")[1] - 1, this.year.split("/")[0], 0, 0, 0)}
              mode="date"
              locale={langObj === TR ? 'tr' : 'en-US'}
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                var d = currentDate,
                  y = d.getFullYear(),
                  m = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1),
                  d = (d.getDate() < 10 ? '0' : '') + d.getDate();
                this.year = d + '/' + m + '/' + y;
              }}
            />
            <Text style={{ fontWeight: "bold", marginTop: 20 }}>
              {langObj.newHourSystem}
            </Text>
            <DateTimePicker
              testID="dateTimePicker4"
              style={{ width: 105, marginTop: 5 }}
              value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.day.split(":")[0], this.day.split(":")[1], 0)}
              mode="time"
              is24Hour={true}
              display="inline"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                var d = currentDate,
                  h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                  m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                this.day = h + ':' + m;
              }}
            />
          </View>
          }
        </View>
        <View style={{ marginBottom: 10, marginTop: 30, width: "100%" }} >
          <Button disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginLeft: 30, marginRight: 30 }} title={langObj.submit}
            onPress={() => {

              click();
              this.forceUpdate();

              let date = this.year;
              let time = this.day;
              // try {
              //   let a = date.split('/')[2].substr(2, 4);
              // } catch (err) {
              //   console.log('this.year', err)
              // }
              newData.data.gun = date.split('/')[0];
              newData.data.ay = date.split('/')[1];
              newData.data.yıl = date.split('/')[2].substr(2, 4);
              newData.data.saat = time.split(':')[0];
              newData.data.dakika = time.split(':')[1];
              newData.data.saniye = time.split(':')[2];
              let hdate = new Date();
              hdate.setUTCFullYear(newData.data.yıl, newData.data.ay - 1, newData.data.gun);
              newData.data.haftaningunu = hdate.getDay();
              this.setState({ loading: true });

              let flagDeviceId = global.deviceId;
              let result = flagDeviceId.substring(10).substring(0, 8);
              if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
              if (result == "00000000") {
                ApiCall.setTimeSettings(newData.data).then((x => {
                  if (x) {
                    this.loading = true;
                    this.systemDate = '';
                    this.getData();
                    this.setState({ loading: false });
                  }
                  else {
                    this.setState({ loading: false });
                  }
                }));
              } else {
                ApiCall.setZoneSettings(newData.data).then((x => {
                  if (x) {
                    this.loading = true;
                    this.systemDate = '';
                    this.getData();
                    this.setState({ loading: false });
                  }
                  else {
                    this.setState({ loading: false });
                  }
                }));
              }


              setTimeout(() => {
                click();
                this.forceUpdate();
              }, 3000);
            }
            }
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default DateAndTime;