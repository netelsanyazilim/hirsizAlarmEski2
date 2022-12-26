import { NativeModules, Platform } from 'react-native';
import Toast from 'react-native-simple-toast';
import SharedPrefs from '../Utils/SharedPrefs';
import Crypto from './crypto';
const url = "http://37.148.211.144:3000";//'http://37.148.212.48:3000';//

//'http://www.uks.netelsan.com.tr:3000';
//'https://www.uks.netelsan.com.tr:3000'; //'http://37.148.211.144:3000'; //'http://192.168.1.155:3000'; //'https://37.148.212.48:3000';   //"http://www.uks.nural.com.tr:3000"  // http://www.uks.netelsan.com.tr:3000'
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';
import { observable, action, autorun, makeObservable, configure } from "mobx";
//import { observer } from 'mobx-react';

configure({
  enforceActions: "never",
});

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

export default class ApiService {

  @observable message = {};
  @observable apiServiceState = "wait"; //"pending" // "pending" / "done" / "error"
  @observable armState = "wait";
  @observable stateStatus = "wait";
  @observable shortStatusState = 'wait';
  @observable phoneState = 'wait';
  @observable phoneData = [];
  @observable smsPhoneData = [];
  @observable statusData = undefined;
  @observable shortStatusData = undefined;
  @observable mixedControls = null;
  @observable userDevice = [];
  @observable userDeviceStatus = "wait";
  @observable kuruluyor = undefined;
  @observable sistemkurulummodu = null;
  @observable hatanoktasi = null;


  @observable ZonState = [];
  @observable ZonTip = [];
  @observable ZonStateHataNoktasi = [];
  @observable ZonStateAlarmNoktasi = [];
  @observable Zone = [
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 }
  ];

  //yeni cihaz için
  @observable ZonStateHataNoktasiNew = [];
  @observable ZonStateAlarmNoktasiNew = [];
  @observable ZoneNew = [
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 },
    { state: 0, tip: 0, Hata: 0, Alarm: 0 }
  ];
  @observable partStatus1 = null;
  @observable partStatus2 = null;
  @observable partStatus3 = null;
  @observable partStatus4 = null;

  //yeni cihaz için getStatus
  @observable zonBilgisi = null;
  @observable zonShortDurum = null;
  @observable programAyar = null;
  @observable girisSuresi = new Array(4);
  @observable cikisSuresi = new Array(4);
  @observable sirenSuresi = null;
  @observable alarmTekrarSayisi = null;
  @observable aramaHatSecimi = null;
  @observable gprsModulMod = null;
  @observable smsBildirim = null;
  @observable aramaTekrarSayisi = null;
  @observable telCalmaSayisi = null;
  @observable sifresizKurulum = null;
  @observable yanginZonTipi = null;
  @observable sesliGeriBildirim = null;
  @observable santralBuzzer = null;
  @observable sirenHataKontrol = null;
  @observable bolgeAktif = new Array(4);
  @observable bolgeStatus = new Array(4);
  @observable bolgeAlarm = new Array(4);
  @observable sistemStatus = null;
  @observable sistemFault = null;
  @observable yanginDurum = null;
  @observable sirenMode = null;
  @observable sistemResetInfo = null;
  @observable akuStatus = null;
  @observable keypadStatus = null;
  @observable akuVolt = null;
  @observable sebekeVolt = null;
  @observable gsmSignalQuality = null;
  @observable wifiSignalQuality = null;
  @observable haftaninGunu = null;

  constructor() {
    makeObservable(this);
  }

  componentDidMount() {
    this.getLanguage();
  }

  setStateStatus(status) {
    this.stateStatus = status;
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
  }

  @action
  async addPanicLog(latitude, longitude) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, '0');
    var min = String(today.getMinutes()).padStart(2, '0');
    let panicDateTime = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      token: token,
      panicDateTime: panicDateTime,
      latitude: latitude,
      longitude: longitude
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/addPanic', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & (responseJson.msg == 'success')) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => { resolve(false); }, 500);
          }
        })
        .catch((err) => {
          console.log('err addPanicLog' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => { resolve(false); }, 500);
        });
    });
  }

  @action
  async getPanicLog() {
    let user = await SharedPrefs.getlogindata();
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = { deviceId: deviceId.toString() };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/getPanic', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.message) {
            resolve(responseJson.panicLog);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getPanicLog: ' + err);
          resolve(false);
        });
    });
  }

  @action
  logout(mail, token, navigation, jump) {
    apiServiceState = 'pending';
    let datas = { mail: mail };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => console.log(JSON.stringify(response)))
      .then(async (responseJson) => {
        console.log('err' + JSON.stringify(responseJson));
        this.message = responseJson.movies;
        await SharedPrefs.saveloginData(null, null, null, null);
        apiServiceState = 'wait';
        navigation.navigate('Index', { reset: true });
      })
      .catch((err) => {
        console.log('logout err', err);
        apiServiceState = 'error';
      });
  }

  @action
  createUser(username, password, mail, language, goback) {
    this.getLanguage();
    apiServiceState = 'pending';
    let datas = { username: username, password: password, mail: mail, language: language };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/createUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((resp) => this.encryptData(resp))
      .then(async (responseJson) => {
        if (responseJson.statusCode) {
          Toast.show(langObj.accountCreated, Toast.LONG);
          goback();
          setTimeout(() => {
            apiServiceState = 'done';
            apiServiceState = 'wait';
          }, 700);
        } else {
          Toast.show(langObj.errAccountCreate, Toast.LONG);
          setTimeout(() => {
            apiServiceState = 'error';
          }, 500);
        }
      })
      .catch((err) => {
        console.log('error _ ' + err);
        Toast.show(langObj.errAccountCreate, Toast.LONG);
        setTimeout(() => {
          apiServiceState = 'error';
        }, 500);
      });
  }

  @action
  changePassword(mail, token, newPassword) {
    this.getLanguage();
    return new Promise((resolve, reject) => {
      let datas = { mail: mail, token: token, newPassword: newPassword };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/changePassword', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.msg) {
            Toast.show(langObj.passwordChangeOK, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.passwordChangeError, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err passwordChange' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  updateUserLanguage(mail, language) {
    return new Promise((resolve, reject) => {
      apiServiceState = 'pending';
      let datas = { mail: mail, language: language };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/updateUserLanguage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((resp) => this.encryptData(resp))
        .then(async (responseJson) => {
          if (responseJson.statusCode) {
            resolve(true);
            setTimeout(() => {
              apiServiceState = 'done';
              apiServiceState = 'wait';
            }, 700);
          } else {
            resolve(false);
            setTimeout(() => {
              apiServiceState = 'error';
            }, 500);
          }
        })
        .catch((err) => {
          console.log('error _ ' + err);
          resolve(false);
          setTimeout(() => {
            apiServiceState = 'error';
          }, 500);
        });
    });
  }

  @action
  login(mail, pass, fcmtoken, langobj) {
    this.getLanguage();
    apiServiceState = 'pending';
    let datas = { mail: mail.toString(), password: pass.toString() };
    let data = { data: this.encryptbody(datas) };
    setTimeout(() => {
      if (apiServiceState != 'done') {
        apiServiceState = 'error';
      }
    }, 5000);
    fetch(url + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if ((responseJson.status == 200) & responseJson.message) {
          apiServiceState = 'done';
        } else {
          Toast.show(langObj.connFail, Toast.SHORT);
          setTimeout(() => {
            apiServiceState = 'error';
          }, 500);
        }
      })
      .catch((err) => {
        Toast.show(langObj.connFail, Toast.SHORT);
        setTimeout(() => {
          apiServiceState = 'error';
        }, 500);
      });
  }

  @action
  async addDevice(mail, token, deviceId, deviceName, goback) {
    this.getLanguage();
    let flagDeviceName = "Netelsan-1";
    if (deviceName != undefined && deviceName != "")
      flagDeviceName = deviceName;
    return new Promise((resolve, reject) => {
      apiServiceState = 'pending';
      let datas = { mail: mail.toString(), deviceName: flagDeviceName.toString(), deviceId: deviceId.toString() };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sub', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json', 'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status == 200 & responseJson.message)//and msg true
          {
            SharedPrefs.saveDeviceName(deviceName);
            this.saveDeviceId(deviceId, deviceName);
            // SharedPrefs.saveloginData(responseJson.user.mail, responseJson.token,responseJson.user.name);
            Toast.show(langObj.awaitingDevice, Toast.LONG);
            this.addDeviceResult(mail, token, deviceId, deviceName).then((x) => {
              if (x) {
                global.deviceName = deviceName;
                global.deviceId = deviceId;
                resolve(true);
                this.getStatus(global.deviceId);
                goback();
                Toast.show(langObj.addSuccess, Toast.SHORT);
                setTimeout(() => { apiServiceState = 'done' }, 500);
              }
              else {
                resolve(false);
                Toast.show(langObj.addFail, Toast.LONG);
                setTimeout(() => { apiServiceState = 'error' }, 500);
              }
            });
          }
          else {
            resolve(false);
            Toast.show(langObj.addFail, Toast.LONG);
            setTimeout(() => { apiServiceState = 'error' }, 500)
          }
          console.log('apiServiceState ', apiServiceState);
        })
        .catch((err) => {
          resolve(false);
          console.log('err login' + err);
          Toast.show(langObj.connErr, Toast.LONG);
          setTimeout(() => { apiServiceState = 'error' }, 500)
        });
    });
  }

  @action
  async addDeviceFromProfile(mail, token, deviceId, deviceName) {
    this.getLanguage();
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceName: deviceName.toString(), deviceId: deviceId.toString() };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sub', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json', 'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status == 200 & responseJson.message) {
            this.saveDeviceId(deviceId);
            Toast.show(langObj.awaitingDevice, Toast.LONG);
            this.addDeviceResult(mail, token, deviceId, deviceName).then((x) => {
              if (x) {
                resolve(true);
                Toast.show(langObj.addSuccess, Toast.SHORT);
              }
              else {
                resolve(false);
                Toast.show(langObj.addFail, Toast.LONG);
              }
            });
          }
          else {
            resolve(false);
            Toast.show(langObj.addFail, Toast.LONG);
          }
        })
        .catch((err) => {
          resolve(false);
          console.log('err login' + err);
          Toast.show(langObj.connErr, Toast.LONG);
        });
    });
  }

  @action
  async addDeviceResult(mail, token, deviceId, deviceName) {
    const Fetch_Timeout = 31000;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, Fetch_Timeout);
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        deviceName: deviceName.toString()
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/subResult', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json', 'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('addDevice response ' + JSON.stringify(responseJson));
          if (responseJson.status == 200 & responseJson.message)//and msg true
          {
            clearTimeout(timeout);
            resolve(true);
          }
          else {
            clearTimeout(timeout);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err login' + err);
          clearTimeout(timeout);
          resolve(false)
        });
    })
  }

  @action
  async resetDevice() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandData: { time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/resetDevice', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('reset device' + JSON.stringify(responseJson));

          if ((responseJson.status == 200) & responseJson.message) {
            //and msg true
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);

            //  alert('Error')
          }
        })
        .catch((err) => {
          console.log('err resetDevice' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async resetDeviceNew(resetMode) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandData: { resetMode: resetMode, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/resetDevice', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('reset device' + JSON.stringify(responseJson));

          if ((responseJson.status == 200) & responseJson.message) {
            //and msg true
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);

            //  alert('Error')
          }
        })
        .catch((err) => {
          console.log('err resetDevice' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async rebootDeviceNew(resetMode) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandData: { resetMode: resetMode, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/rebootDevice', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('reboot device' + JSON.stringify(responseJson));

          if ((responseJson.status == 200) & responseJson.message) {
            //and msg true
            resolve(true);
          } else {
            setTimeout(() => {
              resolve(false);
            }, 500);

            //  alert('Error')
          }
        })
        .catch((err) => {
          console.log('err rebootDevice' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setPartition(partition, activePassive) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();

    if (activePassive)
      activePassive = 1;
    else
      activePassive = 0;

    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setPartition',
        commandData: { partition: partition, activePassive: activePassive, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('setPartition ' + JSON.stringify(responseJson));
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setPartition' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  async saveDeviceId(d) {
    await SharedPrefs.saveDeviceId(d);
  }

  @action
  removeDevice(mail, token, deviceId) {
    this.getLanguage();
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString() };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/unsub', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.message) {
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err removeDevice' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getStatus(deviceId2) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = deviceId2;
    this.userDevice = user.deviceId;
    const Fetch_Timeout = 10000;//5000
    this.stateStatus = 'pending';

    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);

    if (result == "00000000") {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.stateStatus = 'error';
          resolve(false);
        }, Fetch_Timeout);
        if (deviceId == undefined) { this.userDevice = []; this.stateStatus = 'wait'; resolve(false); }
        else {
          let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getStatus' };
          let data = { data: this.encryptbody(datas) };
          fetch(url + '/api/v1/sendCmd', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json', 'x-access-token': token
            },
            body: JSON.stringify(data)
          }).then((response) => response.text())
            .then((responseText) => this.encryptData(responseText))
            .then(async (responseJson) => {
              if (responseJson.status & responseJson.msg == 'success')//and msg true
              {
                clearTimeout(timeout);

                // console.log("---------------");
                // console.log(responseJson);
                // console.log("---------------");

                this.statusData = responseJson;
                global.statusData = responseJson;

                this.girisSuresi = [];
                this.girisSuresi[0] = responseJson.data.girisSuresi1;
                this.girisSuresi[1] = responseJson.data.girisSuresi2;
                this.girisSuresi[2] = responseJson.data.girisSuresi3;
                this.girisSuresi[3] = responseJson.data.girisSuresi4;

                this.cikisSuresi = [];
                this.cikisSuresi[0] = responseJson.data.cikisSuresi1;
                this.cikisSuresi[1] = responseJson.data.cikisSuresi2;
                this.cikisSuresi[2] = responseJson.data.cikisSuresi3;
                this.cikisSuresi[3] = responseJson.data.cikisSuresi4;

                this.bolgeAktif = [];
                this.bolgeAktif[0] = responseJson.data.bolgeAktif1;
                this.bolgeAktif[1] = responseJson.data.bolgeAktif2;
                this.bolgeAktif[2] = responseJson.data.bolgeAktif3;
                this.bolgeAktif[3] = responseJson.data.bolgeAktif4;

                this.bolgeStatus = [];
                this.bolgeStatus[0] = responseJson.data.bolgeStatus1;
                this.bolgeStatus[1] = responseJson.data.bolgeStatus2;
                this.bolgeStatus[2] = responseJson.data.bolgeStatus3;
                this.bolgeStatus[3] = responseJson.data.bolgeStatus4;

                this.bolgeAlarm = [];
                this.bolgeAlarm[0] = responseJson.data.bolgeAlarm1;
                this.bolgeAlarm[1] = responseJson.data.bolgeAlarm2;
                this.bolgeAlarm[2] = responseJson.data.bolgeAlarm3;
                this.bolgeAlarm[3] = responseJson.data.bolgeAlarm4;

                this.sirenSuresi = responseJson.data.sirenSuresi;
                this.alarmTekrarSayisi = responseJson.data.alarmTekrarSayisi;
                this.aramaHatSecimi = responseJson.data.aramaHatSecimi;
                this.gprsModulMod = responseJson.data.gprsModulMod;
                this.smsBildirim = responseJson.data.smsBildirim;
                this.aramaTekrarSayisi = responseJson.data.aramaTekrarSayisi;
                this.telCalmaSayisi = responseJson.data.telCalmaSayisi;
                this.sifresizKurulum = responseJson.data.sifresizKurulum;
                this.yanginZonTipi = responseJson.data.yanginZonTipi;
                this.sesliGeriBildirim = responseJson.data.sesliGeriBildirim;
                this.santralBuzzer = responseJson.data.santralBuzzer;
                this.sirenHataKontrol = responseJson.data.sirenHataKontrol;
                this.sistemStatus = responseJson.data.sistemStatus;
                this.sistemFault = responseJson.data.sistemFault;
                this.mixedControls = responseJson.data.mixedControls;

                this.yanginDurum = responseJson.data.yanginDurum;
                this.sirenMode = responseJson.data.sirenMode;
                this.sistemResetInfo = responseJson.data.sistemResetInfo;

                this.akuStatus = responseJson.data.akuStatus;
                this.keypadStatus = responseJson.data.keypadStatus;
                this.akuVolt = responseJson.data.akuVolt;
                this.sebekeVolt = responseJson.data.sebekeVolt;
                this.gsmSignalQuality = responseJson.data.gsmSignalQuality;
                this.wifiSignalQuality = responseJson.data.wifiSignalQuality;

                this.zonBilgisi = responseJson.data.zonBilgisi;
                this.programAyar = responseJson.data.programAyar;
                this.haftaninGunu = responseJson.data.haftaningunu;

                this.userDevice = user.deviceId;
                this.stateStatus = 'done';
                resolve(true);
              }
              else {
                if (deviceId.length != 0) {
                  this.userDevice = 'tryagain';
                }
                // console.log(responseJson.status);
                // console.log(responseJson.msg);
                Toast.show(langObj.deviceInfoFail, Toast.SHORT);
                this.stateStatus = 'error';
                resolve(false);
              }
            })
            .catch((err) => {
              this.userDevice = 'tryagain';
              console.log('err GetStatus' + err);
              Toast.show(langObj.connErr, Toast.SHORT);
              setTimeout(() => { this.stateStatus = 'error'; resolve(false); }, 500);
            });
        }
      });
    }
    else {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.stateStatus = 'error';
          resolve(false);
        }, Fetch_Timeout);
        if (deviceId == undefined) { this.userDevice = []; this.stateStatus = 'wait'; resolve(false); }
        else {
          let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getStatus' };
          let data = { data: this.encryptbody(datas) };
          fetch(url + '/api/v1/sendCmd', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json', 'x-access-token': token
            },
            body: JSON.stringify(data)
          }).then((response) => response.text())
            .then((responseText) => this.encryptData(responseText))
            .then(async (responseJson) => {
              if (responseJson.status & responseJson.msg == 'success')//and msg true
              {
                clearTimeout(timeout);
                this.statusData = responseJson;
                global.statusData = responseJson;
                this.sistemkurulummodu = responseJson.data.sistemkurulummodu;
                this.hatanoktasi = responseJson.data.hatanoktasi;

                this.ZonStateHataNoktasi = [
                  1 & responseJson.data.hatanoktasi,
                  2 & responseJson.data.hatanoktasi,
                  4 & responseJson.data.hatanoktasi,
                  8 & responseJson.data.hatanoktasi,
                  16 & responseJson.data.hatanoktasi,
                  32 & responseJson.data.hatanoktasi,
                  64 & responseJson.data.hatanoktasi,
                  128 & responseJson.data.hatanoktasi,
                  256 & responseJson.data.yanginzondurum,
                  (512 & responseJson.data.hatanoktasi),//siren
                  (1024 & responseJson.data.hatanoktasi),//panik
                  (2048 & responseJson.data.hatanoktasi),//ac
                  (4096 & responseJson.data.hatanoktasi)//akü
                ];

                this.ZonStateAlarmNoktasi = [
                  1 & responseJson.data.alarmnoktasi,
                  2 & responseJson.data.alarmnoktasi,
                  4 & responseJson.data.alarmnoktasi,
                  8 & responseJson.data.alarmnoktasi,
                  16 & responseJson.data.alarmnoktasi,
                  32 & responseJson.data.alarmnoktasi,
                  64 & responseJson.data.alarmnoktasi,
                  responseJson.data.alarmnoktasi & 128,
                  responseJson.data.yanginzondurum & 256,
                  (512 & responseJson.data.alarmnoktasi),//siren
                  (1024 & responseJson.data.alarmnoktasi),//panik
                  (2048 & responseJson.data.alarmnoktasi),//ac
                  (4096 & responseJson.data.alarmnoktasi)//akü
                ];

                this.Zone[0].Alarm = 1 & responseJson.data.alarmnoktasi;
                this.Zone[1].Alarm = 2 & responseJson.data.alarmnoktasi;
                this.Zone[2].Alarm = 4 & responseJson.data.alarmnoktasi;
                this.Zone[3].Alarm = 8 & responseJson.data.alarmnoktasi;
                this.Zone[4].Alarm = 16 & responseJson.data.alarmnoktasi;
                this.Zone[5].Alarm = 32 & responseJson.data.alarmnoktasi;
                this.Zone[6].Alarm = 64 & responseJson.data.alarmnoktasi;
                this.Zone[7].Alarm = responseJson.data.alarmnoktasi & 128;
                this.Zone[8].Alarm = responseJson.data.yanginzondurum & 256;

                this.Zone[0].Hata = 1 & responseJson.data.hatanoktasi;
                this.Zone[1].Hata = 2 & responseJson.data.hatanoktasi;
                this.Zone[2].Hata = 4 & responseJson.data.hatanoktasi;
                this.Zone[3].Hata = 8 & responseJson.data.hatanoktasi;
                this.Zone[4].Hata = 16 & responseJson.data.hatanoktasi;
                this.Zone[5].Hata = 32 & responseJson.data.hatanoktasi;
                this.Zone[6].Hata = 64 & responseJson.data.hatanoktasi;
                this.Zone[7].Hata = 128 & responseJson.data.hatanoktasi;
                this.Zone[8].Hata = responseJson.data.yanginzondurum & 256;

                this.Zone[0].state = responseJson.data.zonbilgisi.zon[0].durum;
                this.Zone[1].state = responseJson.data.zonbilgisi.zon[1].durum;
                this.Zone[2].state = responseJson.data.zonbilgisi.zon[2].durum;
                this.Zone[3].state = responseJson.data.zonbilgisi.zon[3].durum;
                this.Zone[4].state = responseJson.data.zonbilgisi.zon[4].durum;
                this.Zone[5].state = responseJson.data.zonbilgisi.zon[5].durum;
                this.Zone[6].state = responseJson.data.zonbilgisi.zon[6].durum;
                this.Zone[7].state = responseJson.data.zonbilgisi.zon[7].durum;
                this.Zone[8].state = responseJson.data.yanginzondurum || 1;

                this.Zone[0].tip = responseJson.data.zonbilgisi.zon[0].zontipi
                this.Zone[1].tip = responseJson.data.zonbilgisi.zon[1].zontipi
                this.Zone[2].tip = responseJson.data.zonbilgisi.zon[2].zontipi
                this.Zone[3].tip = responseJson.data.zonbilgisi.zon[3].zontipi
                this.Zone[4].tip = responseJson.data.zonbilgisi.zon[4].zontipi
                this.Zone[5].tip = responseJson.data.zonbilgisi.zon[5].zontipi
                this.Zone[6].tip = responseJson.data.zonbilgisi.zon[6].zontipi
                this.Zone[7].tip = responseJson.data.zonbilgisi.zon[7].zontipi
                this.Zone[8].tip = responseJson.data.yanginzontipi;

                this.userDevice = user.deviceId;
                this.stateStatus = 'done';
                resolve(true);
              }
              else {
                if (deviceId.length != 0) {
                  this.userDevice = 'tryagain';
                }
                // console.log(responseJson.status);
                // console.log(responseJson.msg);
                Toast.show(langObj.deviceInfoFail, Toast.SHORT);
                this.stateStatus = 'error';
                resolve(false);
              }
            })
            .catch((err) => {
              this.userDevice = 'tryagain';
              console.log('err GetStatus' + err);
              Toast.show(langObj.connErr, Toast.SHORT);
              setTimeout(() => { this.stateStatus = 'error'; resolve(false); }, 500);
            });
        }
      });
    }
  }

  @action
  async getStatusForPartition(deviceId2) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = deviceId2;
    this.userDevice = user.deviceId;
    const Fetch_Timeout = 5000;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, Fetch_Timeout);
      if (deviceId == undefined) { this.userDevice = []; this.stateStatus = 'wait'; resolve(false); }
      else {
        let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getStatus' };
        let data = { data: this.encryptbody(datas) };
        fetch(url + '/api/v1/sendCmd', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', 'x-access-token': token
          },
          body: JSON.stringify(data)
        }).then((response) => response.text())
          .then((responseText) => this.encryptData(responseText))
          .then(async (responseJson) => {
            if (responseJson.status & responseJson.msg == 'success')//and msg true
            {
              clearTimeout(timeout);
              resolve(responseJson.data);
            }
            else {
              resolve(false);
            }
          })
          .catch((err) => {
            console.log('err GetStatus' + err);
            Toast.show(langObj.connErr, Toast.SHORT);
            setTimeout(() => { resolve(false); }, 500);
          });
      }
    });
  }

  @action
  async getShortStatus(deviceId2) {
    if (this.shortStatusState != 'pending') {
      this.shortStatusState = 'pending';
      let user = await SharedPrefs.getlogindata();
      let mail = user.mail;
      let token = user.token;
      let deviceId = deviceId2;
      this.userDevice = user.deviceId;
      let flagDeviceId = global.deviceId;
      let result = flagDeviceId.substring(10).substring(0, 8);

      if (result == "00000000") {
        return new Promise((resolve, reject) => {
          let datas = {
            mail: mail.toString(),
            deviceId: deviceId.toString(),
            commandType: 'getShortStatus',
          };
          let data = { data: this.encryptbody(datas) };
          fetch(url + '/api/v1/sendCmd', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'x-access-token': token,
            },
            body: JSON.stringify(data),
          }).then((response) => response.text())
            .then((responseText) => this.encryptData(responseText))
            .then((responseJson) => {
              if (responseJson.status & (responseJson.msg == 'success')) {

                this.statusData = responseJson;
                global.shortStatusData = responseJson;

                
                this.bolgeAktif = [];
                this.bolgeAktif[0] = responseJson.data.bolgeAktif1;
                this.bolgeAktif[1] = responseJson.data.bolgeAktif2;
                this.bolgeAktif[2] = responseJson.data.bolgeAktif3;
                this.bolgeAktif[3] = responseJson.data.bolgeAktif4;

                this.bolgeStatus = [];
                this.bolgeStatus[0] = responseJson.data.bolgeStatus1;
                this.bolgeStatus[1] = responseJson.data.bolgeStatus2;
                this.bolgeStatus[2] = responseJson.data.bolgeStatus3;
                this.bolgeStatus[3] = responseJson.data.bolgeStatus4;

                this.bolgeAlarm = [];
                this.bolgeAlarm[0] = responseJson.data.bolgeAlarm1;
                this.bolgeAlarm[1] = responseJson.data.bolgeAlarm2;
                this.bolgeAlarm[2] = responseJson.data.bolgeAlarm3;
                this.bolgeAlarm[3] = responseJson.data.bolgeAlarm4;

                for (let index = 0; index < 32; index++) {
                  this.zonBilgisi.zon[index].durum = responseJson.data.zonDurum[index];
                }

                this.sistemStatus = responseJson.data.sistemStatus;
                this.sistemFault = responseJson.data.sistemFault;
                this.yanginDurum = responseJson.data.yanginDurum;
                this.sirenMode = responseJson.data.sirenMode;
                this.mixedControls = responseJson.data.mixedControls;

                console.log("feyhsn responseJson:" + responseJson.data.sistemStatus.toString())
                this.shortStatusState = 'done';
                resolve(true);
              } else {
                this.shortStatusState = 'wait';
                console.log("feyhsn2 responseJson  failedd:" )
                resolve(false);
              }
            })
            .catch((err) => {
              console.log('err login' + err);
              this.shortStatusState = 'error';
              console.log("feyhsn3 responseJson  hataa:" )
              resolve(false);
            });
        });
      }
      else {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            this.stateStatus = 'error';
            resolve(false);
          }, Fetch_Timeout);
          let datas = {
            mail: mail.toString(),
            deviceId: deviceId.toString(),
            commandType: 'getShortStatus',
          };
          let data = { data: this.encryptbody(datas) };
          fetch(url + '/api/v1/sendCmd', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'x-access-token': token,
            },
            body: JSON.stringify(data),
          }).then((response) => response.text())
            .then((responseText) => this.encryptData(responseText))
            .then((responseJson) => {
              if (responseJson.status & (responseJson.msg == 'success')) {
                this.sistemkurulummodu = responseJson.data.sistemkurulummodu;
                this.hatanoktasi = responseJson.data.hatanoktasi;
                clearTimeout(timeout);
                //zon durum 0=hat normal 1=hat kopuk 2=hat kısa 4=hat alarm
                this.ZonStateHataNoktasi = [
                  1 & this.hatanoktasi,
                  2 & this.hatanoktasi,
                  4 & this.hatanoktasi,
                  8 & this.hatanoktasi,
                  16 & this.hatanoktasi,
                  32 & this.hatanoktasi,
                  64 & this.hatanoktasi,
                  128 & this.hatanoktasi,
                  256 & responseJson.data.yanginzondurum,
                  512 & this.hatanoktasi, //siren
                  1024 & this.hatanoktasi, //panik
                  2048 & this.hatanoktasi, //ac
                  4096 & this.hatanoktasi, //akü
                ];

                this.ZonStateAlarmNoktasi = [
                  1 & responseJson.data.alarmnoktasi,
                  2 & responseJson.data.alarmnoktasi,
                  4 & responseJson.data.alarmnoktasi,
                  8 & responseJson.data.alarmnoktasi,
                  16 & responseJson.data.alarmnoktasi,
                  32 & responseJson.data.alarmnoktasi,
                  64 & responseJson.data.alarmnoktasi,
                  128 & responseJson.data.alarmnoktasi,
                  256 & responseJson.data.yanginzondurum,
                  512 & responseJson.data.alarmnoktasi, //siren
                  1024 & responseJson.data.alarmnoktasi, //panik
                  2048 & responseJson.data.alarmnoktasi, //ac
                  4096 & responseJson.data.alarmnoktasi, //akü
                ];

                this.Zone[0].Alarm = 1 & responseJson.data.alarmnoktasi;
                this.Zone[1].Alarm = 2 & responseJson.data.alarmnoktasi;
                this.Zone[2].Alarm = 4 & responseJson.data.alarmnoktasi;
                this.Zone[3].Alarm = 8 & responseJson.data.alarmnoktasi;
                this.Zone[4].Alarm = 16 & responseJson.data.alarmnoktasi;
                this.Zone[5].Alarm = 32 & responseJson.data.alarmnoktasi;
                this.Zone[6].Alarm = 64 & responseJson.data.alarmnoktasi;
                this.Zone[7].Alarm = responseJson.data.alarmnoktasi & 128;
                this.Zone[8].Alarm = responseJson.data.yanginzondurum & 256;

                this.Zone[0].Hata = 1 & this.hatanoktasi;
                this.Zone[1].Hata = 2 & this.hatanoktasi;
                this.Zone[2].Hata = 4 & this.hatanoktasi;
                this.Zone[3].Hata = 8 & this.hatanoktasi;
                this.Zone[4].Hata = 16 & this.hatanoktasi;
                this.Zone[5].Hata = 32 & this.hatanoktasi;
                this.Zone[6].Hata = 64 & this.hatanoktasi;
                this.Zone[7].Hata = 128 & this.hatanoktasi;
                this.Zone[8].Hata = responseJson.data.yanginzondurum & 256;

                this.Zone[0].state = responseJson.data.Zon1Durum;
                this.Zone[1].state = responseJson.data.Zon2Durum;
                this.Zone[2].state = responseJson.data.Zon3Durum;
                this.Zone[3].state = responseJson.data.Zon4Durum;
                this.Zone[4].state = responseJson.data.Zon5Durum;
                this.Zone[5].state = responseJson.data.Zon6Durum;
                this.Zone[6].state = responseJson.data.Zon7Durum;
                this.Zone[7].state = responseJson.data.Zon8Durum;
                this.Zone[8].state = responseJson.data.yanginzondurum;

                this.Zone[0].tip = responseJson.data.Zon1Tipi;
                this.Zone[1].tip = responseJson.data.Zon2Tipi;
                this.Zone[2].tip = responseJson.data.Zon3Tipi;
                this.Zone[3].tip = responseJson.data.Zon4Tipi;
                this.Zone[4].tip = responseJson.data.Zon5Tipi;
                this.Zone[5].tip = responseJson.data.Zon6Tipi;
                this.Zone[6].tip = responseJson.data.Zon7Tipi;
                this.Zone[7].tip = responseJson.data.Zon8Tipi;
                this.Zone[8].tip = responseJson.data.yanginzontipi;

                this.shortStatusState = 'done';
                resolve(true);
              } else {
                this.shortStatusState = 'wait';
              }
            })
            .catch((err) => {
              console.log('err login' + err);
              this.shortStatusState = 'error';
              resolve(false);
            });
        });
      }
    }
  }

  async loginDevice(pass) {
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'login',
        commandData: { pass: pass },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  async getAllPass() {
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getAllPass', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            resolve(responseJson);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('getAllPass', err);
          resolve(false);
        });
    });
  }

  async getDeviceInfo() {
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'deviceId',
        commandData: '',
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log(
            'get device info responseJson ',
            JSON.stringify(responseJson),
          );

          if (responseJson.status & (responseJson.msg == 'success')) {
            //and msg true
            console.log('get deviceInfo', JSON.stringify(responseJson));
            resolve(responseJson);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  async getDeviceUsers() {
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let deviceName = global.deviceName;
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'deviceId',
        deviceName: deviceName.toString(),
        commandData: '',
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/getSubs', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.message) {
            resolve(responseJson);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  async setAllPass(datax) {
    //console.log('setAllpass apicall', JSON.stringify(datax));
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setAllPass',
        commandData: { data: datax },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  @action
  async setSystemSettings(settingsData) {
    this.getLanguage();
    this.stateStatus = 'pending';
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'changeSettings',
      commandData: settingsData,
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status & (responseJson.msg == 'success')) {
          // SharedPrefs.saveloginData(responseJson.user.mail, responseJson.token,responseJson.user.name);
          this.getStatus(global.deviceId);
          Toast.show(langObj.success, Toast.SHORT);
          autorun(() => {
            this.stateStatus = 'done';
          }, 50);
        } else {
          Toast.show(langObj.deviceInfoFail, Toast.SHORT);
          autorun(() => {
            this.stateStatus = 'error';
            this.userDevice = 'tryagain';
          }, 50);
        }
      })
      .catch((err) => {
        console.log('err setSystemSettings' + err);

        Toast.show(langObj.connErr, Toast.SHORT);
        autorun(() => {
          this.stateStatus = 'error';
        }, 500);
      });
  }

  @action
  async setNotifSettings(sendNotification, sendMail, battery_low, battery_dead, ac_loss,
    siren_trouble, armed_by_user, remote_arm, periodic_test, polling_loop_open, offline) {
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      token: token,
      sendNotification: sendNotification,
      sendMail: sendMail,
      battery_low: battery_low,
      battery_dead: battery_dead,
      ac_loss: ac_loss,
      siren_trouble: siren_trouble,
      armed_by_user: armed_by_user,
      remote_arm: remote_arm,
      periodic_test: periodic_test,
      polling_loop_open: polling_loop_open,
      offline: offline,
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/settings', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & (responseJson.msg == 'success')) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setNotifSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setProgramSettings(settingsData) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setPrgSettings',
      commandData: settingsData,
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            Toast.show(langObj.programSettingDone, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.programSettingError, Toast.SHORT);
            this.getShortStatus(global.deviceId);
            resolve(false);
          }
        })
        .catch((err) => {
          Toast.show(langObj.programSettingError, Toast.SHORT);
          resolve(false);
        });
    });
  }

  @action
  async setZoneSettings(settingsData) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'changeSettings',
      commandData: settingsData,
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            Toast.show(langObj.success, Toast.SHORT);
            //FIXME:
            resolve(true);
            setTimeout(() => {
              resolve(true);
            }, 500);
          } else {
            this.getShortStatus(global.deviceId);
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setZoneSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setArm(kurulumModu) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    const timeout = setInterval(function () {
      this.stateStatus = 'error';
    }, 5000);
    this.stateStatus = 'pending';
    this.kuruluyor = true;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setArmSystem',
      commandData: { kurulumModu: kurulumModu, time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        console.log('response setArm' + JSON.stringify(responseJson));
        if (responseJson.status & (responseJson.msg == 'success')) {
          clearTimeout(timeout);
          this.getShortStatus(global.deviceId);
          this.kuruluyor = false;
          this.sistemkurulummodu = kurulumModu;
          this.stateStatus = 'done';
        } else {
          clearTimeout(timeout);
          this.kuruluyor = false;
          this.getShortStatus(global.deviceId);
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'error';
          this.userDevice = 'tryagain';
        }
      })
      .catch((err) => {
        console.log('err setArm' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        clearTimeout(timeout);
      });
  }

  @action
  async setArmNew(kurulumModu, partition) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    const timeout = setInterval(function () {
      this.stateStatus = 'error';
    }, 5000);
    this.stateStatus = 'pending';
    this.kuruluyor = true;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setArmSystem',
      commandData: { kurulumModu: kurulumModu, partition: partition, time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        //console.log('response setArm' + JSON.stringify(responseJson));
        if (responseJson.status & (responseJson.msg == 'success')) {
          clearTimeout(timeout);
          //this.getShortStatus(global.deviceId);
          this.kuruluyor = false;
          this.sistemkurulummodu = kurulumModu;
          this.stateStatus = 'done';
        } else {
          clearTimeout(timeout);
          this.kuruluyor = false;
          //this.getShortStatus(global.deviceId);
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'error';
          this.userDevice = 'tryagain';
        }
      })
      .catch((err) => {
        console.log('err setArm' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        clearTimeout(timeout);
      });
  }

  @action
  async setArmP(kurulumModu) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let time = new Date();
      const timeout = setInterval(function () {
        this.stateStatus = 'error';
      }, 5000);
      this.stateStatus = 'pending';
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setArmSystem',
        commandData: { kurulumModu: kurulumModu, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      console.log(data);
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          console.log('response setArm' + JSON.stringify(responseJson));
          if (responseJson.status & (responseJson.msg == 'success')) {
            clearTimeout(timeout);
            this.sistemkurulummodu = kurulumModu;
            this.getShortStatus(global.deviceId);
            Toast.show(langObj.programSettingDone, Toast.SHORT);
            this.kuruluyor = false;
            this.stateStatus = 'done';
            resolve(true);
          } else {
            clearTimeout(timeout);
            this.kuruluyor = false;
            this.stateStatus = 'error';
            this.getShortStatus(global.deviceId);
            Toast.show(langObj.programSettingError, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setarm' + err);
          Toast.show(langObj.programSettingError, Toast.SHORT);
          clearTimeout(timeout);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setArmPNew(kurulumModu, partition) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let time = new Date();
      const timeout = setInterval(function () {
        this.stateStatus = 'error';
      }, 5000);
      this.stateStatus = 'pending';
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setArmSystem',
        commandData: { kurulumModu: kurulumModu, partition: partition, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      //console.log(data);
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          //console.log('response setArm' + JSON.stringify(responseJson));
          if (responseJson.status & (responseJson.msg == 'success')) {
            clearTimeout(timeout);
            this.sistemkurulummodu = kurulumModu;
            //this.getShortStatus(global.deviceId);
            Toast.show(langObj.programSettingDone, Toast.SHORT);
            this.kuruluyor = false;
            this.stateStatus = 'done';
            resolve(true);
          } else {
            clearTimeout(timeout);
            this.kuruluyor = false;
            this.stateStatus = 'error';
            //this.getShortStatus(global.deviceId);
            Toast.show(langObj.programSettingError, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setarm' + err);
          Toast.show(langObj.programSettingError, Toast.SHORT);
          clearTimeout(timeout);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async disarmSystem() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    const timeout = setInterval(function () {
      this.stateStatus = 'error';
    }, 5000);
    this.stateStatus = 'pending';
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setDisarmSystem',
      commandData: { time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        //console.log('disarmSystem response ' + JSON.stringify(responseJson));
        if (responseJson.status & (responseJson.msg == 'success')) {
          clearTimeout(timeout);
          this.sistemkurulummodu = 0;
          this.stateStatus = 'done';
          this.getShortStatus(global.deviceId);
        } else {
          clearTimeout(timeout);
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'error';
          this.userDevice = 'tryagain';
        }
      })
      .catch((err) => {
        clearTimeout(timeout);
        Toast.show(langObj.connErr, Toast.SHORT);
        this.stateStatus = 'error';
      });
  }

  @action
  async disarmSystemNew(partition) {

    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    const timeout = setInterval(function () {
      this.stateStatus = 'error';
    }, 5000);
    this.stateStatus = 'pending';
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setDisarmSystem',
      commandData: { partition: partition, time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        //console.log('disarmSystem response ' + JSON.stringify(responseJson));
        if (responseJson.status & (responseJson.msg == 'success')) {
          clearTimeout(timeout);
          this.sistemkurulummodu = 0;
          this.stateStatus = 'done';
          //this.getShortStatus(global.deviceId);
        } else {
          clearTimeout(timeout);
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'error';
          this.userDevice = 'tryagain';
        }
      })
      .catch((err) => {
        clearTimeout(timeout);
        Toast.show(langObj.connErr, Toast.SHORT);
        this.stateStatus = 'error';
      });
  }

  /**
   * @param {string} mode setDisarmSystemPanic or setDisarmSystemSilent
   *
   */
  @action
  async disarmSystemWithMode(mode) {
    this.getLanguage();
    //0 silent
    //1 panic
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    this.stateStatus = 'pending';
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: mode,
      commandData: { kurulumModu: 1, time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status & (responseJson.msg == 'success')) {
          this.sistemkurulummodu = 0;
          this.stateStatus = 'done';
          this.getShortStatus(global.deviceId);
        } else {
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'done';
        }
      })
      .catch((err) => {
        console.log('err disarmSystemWithMode' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        this.stateStatus = 'done';
      });
  }

  @action
  async disarmSystemWithModeNew(mode, partition) {
    this.getLanguage();
    //0 silent
    //1 panic
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    this.stateStatus = 'pending';
    console.log(partition);

    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: mode,
      commandData: { kurulumModu: 1, partition: partition, time: time.toISOString() },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status & (responseJson.msg == 'success')) {
          this.sistemkurulummodu = 0;
          this.stateStatus = 'done';
          this.getShortStatus(global.deviceId);

        } else {
          Toast.show(langObj.fail, Toast.SHORT);
          this.stateStatus = 'done';
        }
      })
      .catch((err) => {
        console.log('err disarmSystemWithMode' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        this.stateStatus = 'done';
      });
  }

  encryptData(data) {
    return new Promise((resolve, reject) => {
      try {
        let a = Crypto.decrypt(data);
        resolve(JSON.parse(a));
      } catch (err) {
        console.log('encryptData _ API SERVICE _ ERROR: ' + err.toString());
        reject();
      }
    });
  }

  encryptbody(body) {
    try {
      let a = Crypto.encrypt(JSON.stringify(body));
      return a;
    } catch (err) {
      return false;
    }
  }

  @action
  checkToken(mail, token, pass) {
    let datas = { mail: mail };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/getUser', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then((responseJson) => {
        console.log(responseJson);
        let a = Crypto.decrypt(responseJson.user);
        SharedPrefs.saveloginData(
          responseJson.user.mail,
          token,
          pass,
          responseJson.user.name,
          responseJson.user.deviceId,
          responseJson.user.notifsettings,
        );
        if ((responseJson.status == 200) & responseJson.message) {
          apiServiceState = 'done';
        } else {
          apiServiceState = 'error';
        }
      })
      .catch((err) => {
        console.log('err checkToken' + JSON.stringify(err));
        apiServiceState = 'error';
      });
  }

  @action
  resetpass(mail) {
    this.getLanguage();
    apiServiceState = 'pending';
    let datas = { mail: mail };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/resetPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then((responseJson) => {
        this.message = responseJson.movies;
        if ((responseJson.status == 200) & responseJson.mailsendstatus) {
          Toast.show(langObj.success, Toast.SHORT);
          setTimeout(() => { apiServiceState = 'done'; }, 700);
        } else if ((responseJson.status == 200) & !responseJson.mailsendstatus) {
          Toast.show(langObj.failResetPassSend, Toast.SHORT);
          setTimeout(() => { apiServiceState = 'done'; }, 700);
        } else {
          Toast.show(langObj.tryAgainResetPass, Toast.SHORT);
          setTimeout(() => { apiServiceState = 'error'; }, 500);
        }
      })
      .catch((err) => {
        console.log('err resetpass' + JSON.stringify(err));
        Toast.show(langObj.tryAgainResetPass, Toast.SHORT);
        setTimeout(() => { apiServiceState = 'error'; }, 500);
      });
  }

  @action
  async getPhones() {
    this.getLanguage();
    this.phoneState = 'pending';
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getPhoneNumber',
        commandData: '',
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            this.phoneState = 'done';
            this.phoneData = responseJson.data.phones;
            resolve(true);
          } else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            setTimeout(() => {
              this.phoneState = 'error';
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err getPhones' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            (this.phoneState = 'error'), resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getSMSPhones() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getSMSNumber',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            this.smsPhoneData = responseJson.data.phones;
            resolve(true);
          } else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err getPhones' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setSMSPhones(phones, partitions) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    console.log(phones);
    console.log(partitions);
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setSMSNumber',
      commandData: {
        phones: phones,
        partitions: partitions
      },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status) {
          Toast.show(langObj.success, Toast.SHORT);
        } else {
          Toast.show(langObj.deviceInfoFail, Toast.SHORT);
        }
      })
      .catch((err) => {
        console.log('err setPhones' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
      });
  }

  @action
  async setPhones(phonesarray) {
    this.getLanguage();
    this.phoneState = 'pending';
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setPhoneNumber',
      commandData: phonesarray,
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status) {
          Toast.show(langObj.success, Toast.SHORT);
          this.phoneState = 'done';
        } else {
          Toast.show(langObj.deviceInfoFail, Toast.SHORT);
          setTimeout(() => {
            this.phoneState = 'error';
          }, 50);
        }
      })
      .catch((err) => {
        console.log('err setPhones' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        setTimeout(() => {
          this.phoneState = 'error';
        }, 500);
      });
  }

  @action
  async setPhonesNew(phones, partitions) {
    this.getLanguage();
    this.phoneState = 'pending';
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setPhoneNumber',
      commandData: {
        phones: phones,
        partitions: partitions
      },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        if (responseJson.status & (responseJson.msg == 'success')) {
          Toast.show(langObj.success, Toast.SHORT);
          this.phoneState = 'done';
        } else {
          Toast.show(langObj.deviceInfoFail, Toast.SHORT);
          setTimeout(() => {
            this.phoneState = 'error';
          }, 50);
        }
      })
      .catch((err) => {
        console.log('err setPhones' + err);
        Toast.show(langObj.connErr, Toast.SHORT);
        setTimeout(() => {
          this.phoneState = 'error';
        }, 500);
      });
  }

  @action
  async getAkmSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getAkmSettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            //console.log(responseJson.data);
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          setTimeout(() => { resolve(false) }, 2500);
        });
    });
  }

  @action
  async setAkm(akmadresi, akmbaglatiportu, akmkullanicihesapno, akmpingaraligi) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setAkmSettings',
      commandData: {
        akmadresi: akmadresi.toString(),
        akmbaglatiportu: akmbaglatiportu.toString(),
        akmkullanicihesapno: akmkullanicihesapno.toString(),
        akmpingaraligi: akmpingaraligi.toString(),
      },
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            Toast.show(langObj.success, Toast.SHORT);
            setTimeout(() => {
              resolve(true);
            }, 500);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setAkmNew(akmIndex, akmAdresi, akmBaglantiPortu, akmKullaniciHesapNo, akmPingAraligi, akmTelefonNo) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setAkmSettings',
      commandData: {
        akmIndex: akmIndex.toString(),
        akmAdresi: akmAdresi.toString(),
        akmBaglantiPortu: akmBaglantiPortu.toString(),
        akmKullaniciHesapNo: akmKullaniciHesapNo.toString(),
        akmPingAraligi: akmPingAraligi.toString(),
        akmTelefonNo: (akmTelefonNo + new Array((15 - akmTelefonNo.length)).join('f')).toString()
      },
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & (responseJson.msg == 'success')) {
            console.log("ok");
            Toast.show(langObj.success, Toast.SHORT);
            setTimeout(() => {
              resolve(true);
            }, 500);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getEventLog() {
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = { mail: mail.toString(), deviceId: deviceId.toString() };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/eventlog', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.message) {
            resolve(responseJson.eventLog);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  @action
  changeDeviceName(mail, token, deviceId, newDeviceName) {
    this.getLanguage();
    return new Promise((resolve, reject) => {
      let datas = { mail: mail, token: token, deviceId: deviceId, newDeviceName: newDeviceName };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/changeDeviceName', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & responseJson.msg) {
            global.deviceName = deviceName;
            Toast.show(langObj.deviceNameChangeOK, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.deviceNameChangeError, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err deviceNameChange' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getRelaySettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getRelaySettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false)
          }
        })
        .catch((err) => {
          console.log('err getRelaySettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setRelaySettings(relayIndex, mode) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();

    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setRelaySettings',
        commandData: { relayIndex: relayIndex, mode: mode, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setRelaySettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setRelay(relayIndex, status) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();

    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setRelay',
        commandData: { relayIndex: relayIndex, status: status, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setRelay' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async setRelayName(relayIndex, newName) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setRelayName',
        commandData: {
          relayIndex: relayIndex,
          newName: newName,
          time: time.toISOString()
        },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setRelayName' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getWifiSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getWifiSettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            console.log("Wifi ayarlarını almaya çalışıyor.");
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false)
          }
        })
        .catch((err) => {
          console.log('err getWifiSettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async searchWifiNetworks() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'searchWifiNetworks',
      commandData: ''
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify(data)
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        // if (responseJson.status & responseJson.msg == 'success') {
        //   resolve(responseJson.data);
        // }
        // else {
        //   Toast.show(langObj.cantFindWifi, Toast.SHORT);
        // }
      })
      .catch((err) => {
        console.log('err searchWifiNetworks' + err);
      });
  }

  @action
  async getWifiNetworks() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getWifiNetworks',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            //Toast.show(langObj.cantFindWifi, Toast.SHORT);
            resolve(false)
          }
        })
        .catch((err) => {
          console.log('err getWifiNetworks' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setWifiSettings(wifiName, wifiPassword) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      commandType: 'setWifiSettings',
      commandData: {
        wifiName: wifiName,
        wifiPassword: wifiPassword,
        time: time.toISOString()
      },
    };
    let data = { data: this.encryptbody(datas) };
    fetch(url + '/api/v1/sendCmd', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify(data)
    }).then((response) => response.text())
      .then((responseText) => this.encryptData(responseText))
      .then(async (responseJson) => {
        //console.log(responseJson.data);
      })
      .catch((err) => {
        console.log('err setWifiSettings' + err);
      });
  }

  @action
  async setPassword(passType, partition, password) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setPassword',
        commandData: { passType: passType, partition: (partition - 1), password: password, time: time.toISOString() },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setPassword' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getAllPassNew() {
    let user = await SharedPrefs.getlogindata();
    return new Promise((resolve, reject) => {
      let mail = user.mail;
      let token = user.token;
      let deviceId = global.deviceId;
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getAllPass',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            resolve(responseJson.data);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('getAllPass', err);
          resolve(false);
        });
    });
  }

  @action
  async getSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getSettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getSettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async changeSettings(settings) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'changeSettings',
        commandData: {
          girisSuresi1: settings.girisSuresi1,
          girisSuresi2: settings.girisSuresi2,
          girisSuresi3: settings.girisSuresi3,
          girisSuresi4: settings.girisSuresi4,
          cikisSuresi1: settings.cikisSuresi1,
          cikisSuresi2: settings.cikisSuresi2,
          cikisSuresi3: settings.cikisSuresi3,
          cikisSuresi4: settings.cikisSuresi4,
          sirenSuresi: settings.sirenSuresi,
          alarmTekrarSayisi: settings.alarmTekrarSayisi,
          aramaHatSecimi: settings.aramaHatSecimi,
          gprsModulMod: settings.gprsModulMod,
          smsBildirim: settings.smsBildirim,
          aramaTekrarSayisi: settings.aramaTekrarSayisi,
          telCalmaSayisi: settings.telCalmaSayisi,
          sifresizKurulum: settings.sifresizKurulum,
          yanginZonTipi: settings.yanginZonTipi,
          sesliGeriBildirim: settings.sesliGeriBildirim,
          santralBuzzer: settings.santralBuzzer,
          sirenHataKontrol: settings.sirenHataKontrol,
          time: time.toISOString()
        },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err changeSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getZoneSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getZoneSettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getSettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setZoneSettingsNew(newClickedZone, flagZone) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setZoneSettings',
        commandData: {
          zoneNumber: newClickedZone,
          zoneSettings: flagZone,
          time: time.toISOString()
        },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err changeSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getProgSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = { mail: mail.toString(), deviceId: deviceId.toString(), commandType: 'getProgSettings', commandData: '' };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getSettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setProgSettingsNew(partitionNo, progSettings) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setProgSettings',
        commandData: {
          partitionNo: partitionNo,
          progSettings: progSettings,
          time: time.toISOString()
        },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setProgSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getTimeSettings() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getTimeSettings',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            console.log(responseJson.data);
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getTimeSettings' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setTimeSettings(timeSettings) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setTimeSettings',
        commandData: timeSettings
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setTimeSettings' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getPasswordPart() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getPasswordPart',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getPasswordPart' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setPasswordPart(passwordParts) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setPasswordPart',
        commandData: passwordParts
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setPasswordPart' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getRemotePart() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getRemotePart',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getRemotePart' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setRemotePart(remoteParts) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setRemotePart',
        commandData: remoteParts
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setRemotePart' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getTelPart() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getTelPart',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getTelPart' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setTelPart(telephoneParts) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setTelPart',
        commandData: telephoneParts
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setTelPart' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getSMSPart() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getSmsPart',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getSmsPart' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setSMSPart(smsParts) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setSmsPart',
        commandData: smsParts
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setSmsPart' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getZonePart() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getZonePart',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err getZonePart' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setZonePart(zoneParts) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setZonePart',
        commandData: zoneParts
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setZonePart' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async getRFModulList() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise(async (resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'getRFModulList',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then((responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        }).catch((err) => {
          console.log('err getRFModulList' + err);
          setTimeout(() => {
            resolve(false)
          },
            500)
        });
    });
  }

  @action
  async startRfOptimize() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'startRfOptimize',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err startRfOptimize' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async delRfModule(moduleId) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'delRfModule',
        commandData: {
          moduleId: moduleId
        }
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(responseJson.data);
          }
          else {
            Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err delRfModule' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async startRFListen(zonNo) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'startRFListen',
        commandData: {
          zonNo: zonNo
        }
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            //Toast.show(langObj.success, Toast.SHORT);
            resolve(responseJson.data);
          }
          else {
           // Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        })
        .catch((err) => {
          console.log('err startRFListen' + err);
          setTimeout(() => { resolve(false) }, 500)
        });
    });
  }

  @action
  async setRfSettings(newClickedRf, flagRf) {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let time = new Date();
    return new Promise((resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'setRFModulInfo',
        commandData: {
          rfNumber: newClickedRf,
          rfSettings: flagRf,
          time: time.toISOString()
        },
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if (responseJson.status) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setRFModulInfo' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }

  @action
  async rfAddStatusCheck() {
    this.getLanguage();
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    return new Promise(async (resolve, reject) => {
      let datas = {
        mail: mail.toString(),
        deviceId: deviceId.toString(),
        commandType: 'rfAddStatusCheck',
        commandData: ''
      };
      let data = { data: this.encryptbody(datas) };
      fetch(url + '/api/v1/sendCmd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(data)
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then((responseJson) => {
          if (responseJson.status & responseJson.msg == 'success') {
            resolve(responseJson.data);
          }
          else {
           // Toast.show(langObj.deviceInfoFail, Toast.SHORT);
            resolve(false);
          }
        }).catch((err) => {
          console.log('err rfAddStatusCheck' + err);
          setTimeout(() => {
            resolve(false)
          },
            500)
        });
    });
  }

  @action
  async setNotifSettingsNew(sendNotification, sendMail, battery_low, battery_dead, ac_loss,
    siren_trouble, armed_by_user, remote_arm, periodic_test, polling_loop_open, offline,
    systemReset, centralDoorOpen, sirenDoorOpen, keypadRemoval, jammerError, telLineError,
    rfLostDevice, rfBatteryError, rfAddRemove, rfTamperError) {
    let user = await SharedPrefs.getlogindata();
    let mail = user.mail;
    let token = user.token;
    let deviceId = global.deviceId;
    let datas = {
      mail: mail.toString(),
      deviceId: deviceId.toString(),
      token: token,
      sendNotification: sendNotification,
      sendMail: sendMail,
      battery_low: battery_low,
      battery_dead: battery_dead,
      ac_loss: ac_loss,
      siren_trouble: siren_trouble,
      armed_by_user: armed_by_user,
      remote_arm: remote_arm,
      periodic_test: periodic_test,
      polling_loop_open: polling_loop_open,
      offline: offline,
      systemReset: systemReset,
      centralDoorOpen: centralDoorOpen,
      sirenDoorOpen: sirenDoorOpen,
      keypadRemoval: keypadRemoval,
      jammerError: jammerError,
      telLineError: telLineError,
      rfLostDevice: rfLostDevice,
      rfBatteryError: rfBatteryError,
      rfAddRemove: rfAddRemove,
      rfTamperError: rfTamperError
    };
    let data = { data: this.encryptbody(datas) };
    return new Promise((resolve, reject) => {
      fetch(url + '/api/v1/settings', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(data),
      }).then((response) => response.text())
        .then((responseText) => this.encryptData(responseText))
        .then(async (responseJson) => {
          if ((responseJson.status == 200) & (responseJson.msg == 'success')) {
            Toast.show(langObj.success, Toast.SHORT);
            resolve(true);
          } else {
            Toast.show(langObj.fail, Toast.SHORT);
            setTimeout(() => {
              resolve(false);
            }, 500);
          }
        })
        .catch((err) => {
          console.log('err setNotifSettingsNew' + err);
          Toast.show(langObj.connErr, Toast.SHORT);
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
    });
  }
}