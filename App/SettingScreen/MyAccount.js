import React, { useState, useEffect, useRef } from "react";
import {
  Text, NativeModules, TouchableOpacity, Dimensions, View, StyleSheet,
  ScrollView, Alert, Modal, Platform, TextInput
} from "react-native";
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import GetLocation from 'react-native-get-location';
import NetInfo from "@react-native-community/netinfo";
import OptItem from "../Component/OptItem";
import SharedPrefs from '../Utils/SharedPrefs';
import ApiService from '../Utils/ApiService';
import Toast from 'react-native-simple-toast';
import QrScanner from "../Component/QrScanner";
import Spinner from "react-native-spinkit";
import { Icon } from "react-native-elements";
import { WebView } from 'react-native-webview';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import openMap from 'react-native-open-maps';
import Crypto from '../Utils/crypto';
import html_script from '../assets/html_script';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
const url = 'http://37.148.211.144:3000'; //'http://192.168.1.155:3000'; //'https://37.148.212.48:3000';  değişebilir
let deviceWidth = Dimensions.get('window').width * 0.8;
let deviceHeigth = Dimensions.get('window').height * 0.5;

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

function MyAccount(props) {
  const [user, setUser] = useState({});
  const [location, setLocation] = useState({});
  const [deviceInfoGetted, setDeviceInfoGetted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, onChangeNewPassword] = useState(null);
  const [newPassword2, onChangeNewPassword2] = useState(null);
  const [, updateState] = React.useState();
  const forceUpdateSc = React.useCallback(() => updateState({}), []);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [newDeviceName, onChangeNewDeviceName] = useState(null);
  const [showAddNewDeviceModal, setShowAddNewDeviceModal] = useState(false);
  const [addedNewDeviceID, onChangeAddedNewDeviceID] = useState(null);
  const [addedNewDeviceName, onChangeAddedNewDeviceName] = useState(null);
  const [showQRReadModal, setShowQRReadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangeDeviceModal, setShowChangeDeviceModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceIds, setDeviceIds] = useState([]);
  const [flagDeviceId, setFlagDeviceId] = useState(null);
  const [flagDeviceName, setFlagDeviceName] = useState(null);

  useEffect(() => {
    getLanguage();
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        getUser();
        ApiCall.getStatus(global.deviceId);
      }
      else
        Toast.show(langObj.internetConnFail, Toast.LONG);
    });

    const { navigation } = props;
    const unsubscribe = navigation.addListener('focus', () => {
      getUser();
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
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

    setDeviceName(global.deviceName);
    setDeviceId(global.deviceId);

    const a = await SharedPrefs.getlogindata();
    let flagDeviceIds = [];
    let flagDeviceNames = [];
    for (let index = 0; index < a.deviceId.length; index++) {
      flagDeviceIds.push(a.deviceId[index]);
      flagDeviceNames.push(a.deviceName[index]);
    }
    setDevices(flagDeviceNames);
    setDeviceIds(flagDeviceIds);

    forceUpdateSc();
  }

  const encryptData = (data) => {
    return new Promise((resolve, reject) => {
      try {
        let a = Crypto.decrypt(data);
        resolve(JSON.parse(a));
      } catch (err) {
        reject();
      }
    });
  }

  const encryptbody = (body) => {
    try {
      let a = Crypto.encrypt(JSON.stringify(body));
      return a;
    } catch (err) {
      return false;
    }
  }

  const updateDeviceId = (value) => () => {
    let infoCpy = [...deviceInfo];
    infoCpy.data.cihazID = value;
    setDeviceInfo(infoCpy);
  }

  const getDeviceInfo = async () => {
    let user2 = await SharedPrefs.getlogindata();
    updateDeviceId(global.deviceId);
    return new Promise((resolve, reject) => {
      if (global.deviceId != null) {
        let mail = user2.mail;
        let token = user2.token;
        let deviceId = global.deviceId;
        let datas = {
          mail: mail.toString(),
          deviceId: deviceId.toString(),
          commandType: "deviceId",
          commandData: "",
        };
        let data = { data: encryptbody(datas) };
        fetch(url + '/api/v1/sendCmd', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
          body: JSON.stringify(data),
        }).then((response) => response.text())
          .then((responseText) => encryptData(responseText))
          .then(async (responseJson) => {
            if (responseJson.status & (responseJson.msg == 'success')) {
              resolve(responseJson);
            } else {
              resolve(false);
            }
          })
          .catch((err) => {
            resolve(false);
          });
      } else {
        resolve(false);
      }
    });
  }

  const getUser = async () => {
    setDeviceInfoGetted("pending");
    let flagUser = await SharedPrefs.getlogindata();
    let flagDeviceIds = [];
    let flagDeviceNames = [];
    for (let index = 0; index < flagUser.deviceId.length; index++) {
      flagDeviceIds.push(flagUser.deviceId[index]);
      flagDeviceNames.push(flagUser.deviceName[index]);
    }
    setDevices(flagDeviceNames);
    setDeviceIds(flagDeviceIds);
    setUser(flagUser);
    getDeviceInfo().then((x) => {
      if (x) {
        setDeviceInfo(x);
        setDeviceInfoGetted("done");
      }
      else {
        setDeviceInfoGetted("error");
      }
    })
  }

  const logout = (mail, token, navigation, jump) => {
    let datas = { mail: mail };
    let data = { data: encryptbody(datas) };
    fetch(url + '/api/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.text())
      .then((responseText) => encryptData(responseText))
      .then(() => {
        SharedPrefs.saveloginData(null, null, null, null, null, null, null);
        global.deviceId = undefined;
        global.deviceLoggedin = false;
        global.statusData = undefined;
        //SharedPrefs.removeDevicePass();
        props.navigation.navigate("LoginScreen");
      })
      .catch((err) => {
        console.log('logout err', err);
      });
  }

  const renderDeviceId = () => {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
    return (<OptItem iconname={"label"} title={langObj.deviceID} subtitle={flagDeviceId} disabled={true} />);
  }

  const mapRef = useRef();

  _goToMyPosition = (lat, lon) => {
    mapRef.current.injectJavaScript(`
      mymap.setView([${lat}, ${lon}], 10)
      L.marker([${lat}, ${lon}]).addTo(mymap)
    `);
  }

  const onResult = (data) => {
    setShowQRReadModal(false);
    onChangeAddedNewDeviceID(data);
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <QrScanner back={() => { setShowQRReadModal(false); }} showQr={showQRReadModal} onResult={(data) => { onResult(data); }} />

      <Modal visible={showPanicModal} animationType={"fade"} onRequestClose={() => { setShowPanicModal(false) }} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
          <View style={{
            margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
          }}>
            <View style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 14, color: "red", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center" }}>
                {location.mail}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 14, color: "red", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center" }}>
                {location.panicDateTime}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "red", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center" }}>
                {location.latitude}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 14, color: "red", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center" }}>
                {location.longitude}
              </Text>
            </View>
            <WebView style={{ height: deviceHeigth, width: deviceWidth }} ref={mapRef} source={{ html: html_script }} javaScriptEnabled={true} />
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity style={{ elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => { setShowPanicModal(false); openMap({ latitude: location.latitude, longitude: location.longitude }); }}>
                <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.showOnMap}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 30, elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => setShowPanicModal(false)}>
                <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} animationType={"fade"} onRequestClose={() => { setShowPasswordModal(false) }} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
          <View style={{
            margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
          }}>
            <TextInput style={styles.input} placeholderTextColor={"rgba(0,0,0,0.4)"}
              selectionColor={"black"} onChangeText={onChangeNewPassword} value={newPassword} placeholder={langObj.newPassword} secureTextEntry={true} />
            <TextInput style={styles.input} placeholderTextColor={"rgba(0,0,0,0.4)"}
              selectionColor={"black"} onChangeText={onChangeNewPassword2} value={newPassword2} placeholder={langObj.newPasswordAgain} secureTextEntry={true} />
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => { setShowPasswordModal(false); onChangeNewPassword(null); onChangeNewPassword2(null); }}>
                <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => {
                  if (newPassword == newPassword2) {
                    if (newPassword.length >= 6) {
                      NetInfo.fetch().then(state => {
                        if (state.isConnected) {
                          ApiCall.changePassword(user.mail, user.token, newPassword).then(async (x) => {
                            if (x) {
                              const a = await SharedPrefs.getlogindata();
                              if (a !== undefined && a.token !== null) {
                                SharedPrefs.saveloginData(a.mail, a.token, newPassword, a.name, a.deviceId, a.deviceName, a.notifsettings);
                              }
                              setShowPasswordModal(false);
                              onChangeNewPassword(null);
                              onChangeNewPassword2(null);
                            }
                          });
                        }
                        else Toast.show(langObj.internetConnFail, Toast.LONG);
                      });
                    } else Toast.show(langObj.validatePassLength, Toast.LONG);
                  } else Toast.show(langObj.passwordMatchFail, Toast.LONG);
                }}>
                <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.changePassword}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeviceNameModal} animationType={"fade"} onRequestClose={() => { setShowDeviceNameModal(false) }} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
          <View style={{
            margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
          }}>
            <TextInput style={styles.input} placeholderTextColor={"rgba(0,0,0,0.4)"} selectionColor={"black"} onChangeText={onChangeNewDeviceName} value={newDeviceName} placeholder={langObj.newDeviceName} />
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => { setShowDeviceNameModal(false); onChangeNewDeviceName(null); }}>
                <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => {
                  if (newDeviceName != "") {
                    NetInfo.fetch().then(state => {
                      if (state.isConnected) {
                        ApiCall.changeDeviceName(user.mail, user.token, global.deviceId, newDeviceName).then(async (x) => {
                          if (x) {
                            const a = await SharedPrefs.getlogindata();
                            let flagDeviceNames = a.deviceName;
                            for (let index = 0; index < a.deviceId.length; index++) {
                              if (a.deviceName[index] == global.deviceName)
                                flagDeviceNames[index] = newDeviceName;
                            }
                            if (a !== undefined && a.token !== null) {
                              SharedPrefs.saveloginData(a.mail, a.token, a.pass, a.name, a.deviceId, flagDeviceNames, a.notifsettings);
                            }
                            setDevices(flagDeviceNames);
                            setDeviceName(newDeviceName);
                            global.deviceName = newDeviceName;
                            setShowDeviceNameModal(false);
                            onChangeNewDeviceName(null);
                          }
                        });
                      }
                      else Toast.show(langObj.internetConnFail, Toast.LONG);
                    });
                  } else Toast.show(langObj.deviceNameNotEmpty, Toast.LONG);
                }}>
                <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.changeDeviceName}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddNewDeviceModal} animationType={"fade"} onRequestClose={() => { setShowAddNewDeviceModal(false) }} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
          <View style={{
            margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
          }}>
            <View style={{ flexDirection: 'row' }} >
              <TextInput style={styles.input} placeholderTextColor={"rgba(0,0,0,0.4)"} selectionColor={"black"} editable={!loading}
                onChangeText={onChangeAddedNewDeviceID} value={addedNewDeviceID} placeholder={langObj.newDeviceID} />
              <Icon
                containerStyle={{ marginLeft: 10, marginRight: 5, width: 40, alignSelf: 'flex-end' }}
                name="qrcode"
                type="font-awesome"
                color='#30363b'
                size={50}
                disabled={loading}
                onPress={() => { setShowQRReadModal(true); }}
              />
            </View>
            <TextInput style={{ height: 40, margin: 12, padding: 10, width: 250, borderBottomWidth: 1 }}
              placeholderTextColor={"rgba(0,0,0,0.4)"} editable={!loading} selectionColor={"black"} onChangeText={onChangeAddedNewDeviceName}
              value={addedNewDeviceName} placeholder={langObj.newDeviceName} />
            {loading && <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Spinner size={30} type={'Wave'} color={"#000000"} />
              <Text style={{ marginTop: 10, color: "black" }}>{langObj.waitingUser}</Text>
            </View>}
            {!loading && <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => { setShowAddNewDeviceModal(false); onChangeAddedNewDeviceName(null); onChangeAddedNewDeviceID(null); }}>
                <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => {
                  if ((addedNewDeviceID != "") && (addedNewDeviceName != "") && (addedNewDeviceID != null) && (addedNewDeviceName != null)) {
                    if (addedNewDeviceName.length < 3) {
                      Toast.show(langObj.deviceNameHaveto3Word, Toast.LONG);
                    }
                    else {
                      if ((addedNewDeviceID.length == 20) || (addedNewDeviceID.length == 8)) {
                        NetInfo.fetch().then(state => {
                          if (state.isConnected) {
                            setLoading(true);
                            let flagAddedNewDeviceID = addedNewDeviceID;
                            if (flagAddedNewDeviceID.length == 8) {
                              flagAddedNewDeviceID = addedNewDeviceID.substring(0, 6) + "000000000000" + addedNewDeviceID.substring(6, 8);
                            }
                            ApiCall.addDeviceFromProfile(user.mail, user.token, flagAddedNewDeviceID, addedNewDeviceName).then(async (x) => {
                              if (x) {
                                let flagDeviceIds = user.deviceId;
                                let flagDeviceNames = user.deviceName;
                                flagDeviceIds.push(flagAddedNewDeviceID);
                                flagDeviceNames.push(addedNewDeviceName);
                                setDevices(flagDeviceNames);
                                setDeviceIds(flagDeviceIds);

                                if (user !== undefined && user.token !== null) {
                                  SharedPrefs.saveloginData(user.mail, user.token, user.pass, user.name, flagDeviceIds, flagDeviceNames, user.notifsettings);
                                }

                                setShowAddNewDeviceModal(false);
                                onChangeAddedNewDeviceName(null);
                                onChangeAddedNewDeviceID(null);
                              }
                              setLoading(false);
                            });
                          }
                          else Toast.show(langObj.internetConnFail, Toast.LONG);
                        });
                      } else Toast.show(langObj.deviceNameOrDeviceIdNotValid, Toast.LONG);
                    }

                  } else Toast.show(langObj.deviceNameOrDeviceIdNotEmpty, Toast.LONG);
                }}>
                <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.addNewDeviceTitle}</Text>
              </TouchableOpacity>
            </View>}
          </View>
        </View>
      </Modal>

      <Modal visible={showChangeDeviceModal} animationType={"fade"} onRequestClose={() => { setShowChangeDeviceModal(false) }} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{
            margin: 10, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
          }}>
            <Text style={{ marginTop: 10, marginBottom: 20, fontSize: 18 }} >
              {langObj.chooseDevice}
            </Text>
            <SelectDropdown
              data={devices}
              onSelect={(selectedItem, index) => {
                setFlagDeviceId(deviceIds[index]);
                setFlagDeviceName(selectedItem);
              }}
              defaultButtonText={langObj.chooseADevice}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem;
              }}
              rowTextForSelection={(item, index) => {
                return item;
              }}
              buttonStyle={styles.dropdownBtnStyle}
              buttonTextStyle={styles.dropdownBtnTxtStyle}
              renderDropdownIcon={() => {
                return (
                  <FontAwesome name="chevron-down" color={"#FFF"} size={18} />
                );
              }}
              dropdownIconPosition={"right"}
              dropdownStyle={styles.dropdownDropdownStyle}
              rowStyle={styles.dropdownRowStyle}
              rowTextStyle={styles.dropdownRowTxtStyle}
            />
            <TouchableOpacity style={{ marginTop: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
              onPress={() => {
                if ((flagDeviceId != null) && (flagDeviceName != null)) {
                  global.deviceId = flagDeviceId;
                  global.deviceName = flagDeviceName;
                  global.deviceLoggedin = false;
                  setDeviceName(global.deviceName);
                  setDeviceId(global.deviceId);
                  getUser();
                  //ApiCall.getStatus(1, flagDeviceId);
                  setShowChangeDeviceModal(false);
                } else Toast.show(langObj.selectDeviceToCont, Toast.LONG);
              }}>
              <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.chooseDeviceButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View>
        <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20, backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }} >{langObj.accountInfo}</Text>
        <View style={{ backgroundColor: 'white', alignItems: 'center', marginTop: 10 }} >
          <OptItem iconname={"account-box"} subtitle={user == null ? "" : user.name} title={langObj.userName} disabled={true} />
          <OptItem iconname={"email"} subtitle={user == null ? "" : user.mail} title={langObj.userMail} disabled={true} />
          <OptItem iconname={"lock"} subtitle={langObj.changePasswordSubtitle} title={langObj.changePasswordTitle} onPress={() => { setShowPasswordModal(true); }} />
          {user.deviceId !== undefined && user.deviceId.length > 0 && <OptItem iconname={"add-moderator"}
            subtitle={langObj.addNewDeviceSubtitle} title={langObj.addNewDeviceTitle} onPress={() => { setShowAddNewDeviceModal(true); }} />}
          {user.deviceId !== undefined && user.deviceId.length > 1 && <OptItem iconname={"swap-horizontal-circle"}
            subtitle={langObj.changeActiveDeviceSubtitle} title={langObj.changeActiveDevice} onPress={() => { setShowChangeDeviceModal(true); }} />}
          {user.deviceId != undefined && user.deviceId.length > 0 && <OptItem iconname={"remove-circle"} title={langObj.removeDevice} subtitle={langObj.removedAccount}
            onPress={() => {
              Alert.alert(langObj.sure, '',
                [{
                  text: langObj.remove, onPress: async () => {
                    const user = await SharedPrefs.getlogindata();
                    NetInfo.fetch().then(state => {
                      if (!state.isConnected)
                        Toast.show(langObj.internetConnFail, Toast.LONG);
                      else {
                        ApiCall.removeDevice(user.mail, user.token, global.deviceId).then(async (x) => {
                          if (x) {
                            await SharedPrefs.removeDeviceId(deviceId).then(async (newData) => {
                              let flagUser = newData;
                              setUser(flagUser);
                              if (flagUser.deviceId.length == 0) {
                                setDeviceInfo(null);
                                setDeviceId(null);
                                setDeviceInfoGetted("notDone");

                                //aktif cihazı değiştir kısmı için
                                if (user !== undefined && user.token !== null) {
                                  SharedPrefs.saveloginData(user.mail, user.token, user.pass, user.name, null, null, user.notifsettings);
                                }
                                let flagDeviceIds = [];
                                let flagDeviceNames = [];
                                setDevices(flagDeviceNames);
                                setDeviceIds(flagDeviceIds);
                                ApiCall.getStatus(undefined);
                              } else {
                                global.deviceId = flagUser.deviceId[0];
                                global.deviceName = flagUser.deviceName[0];
                                setDeviceId(flagUser.deviceId[0]);
                                setDeviceName(flagUser.deviceName[0]);
                                getDeviceInfo().then((x) => {
                                  if (x) {
                                    setDeviceInfo(x);
                                    setDeviceInfoGetted("done");
                                  }
                                  else {
                                    setDeviceInfoGetted("error");
                                  }
                                });

                                //aktif cihazı değiştir kısmı için
                                let flagDeviceIds = [];
                                let flagDeviceNames = [];
                                if (user.deviceId.length > 1) {
                                  const indexDevice1 = user.deviceId.indexOf(deviceId);
                                  if (indexDevice1 > -1) {
                                    user.deviceId.splice(indexDevice1, 1);
                                    user.deviceName.splice(indexDevice1, 1);
                                    flagDeviceIds = user.deviceId;
                                    flagDeviceNames = user.deviceName;
                                  }
                                }
                                else {
                                  flagDeviceIds = [];
                                  flagDeviceNames = [];
                                }

                                if (user !== undefined && user.token !== null) {
                                  SharedPrefs.saveloginData(user.mail, user.token, user.pass, user.name, flagDeviceIds, flagDeviceNames, user.notifsettings);
                                }
                                let newFlagUser = await SharedPrefs.getlogindata();;
                                setUser(newFlagUser);
                                setDevices(flagDeviceNames);
                                setDeviceIds(flagDeviceIds);
                                console.log(flagDeviceIds[0]);
                                ApiCall.getStatus(flagDeviceIds[0]);
                              }
                              //this.props.jump(1);
                            }).catch(e => {
                              console.log(e);
                            });
                          }
                        });
                      }
                    });
                  }
                },
                { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' }],
                { cancelable: false }
              );
            }} />}
        </View>
      </View>

      {user.deviceId !== undefined && user.deviceId.length > 0 && <View>
        <View>
          <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 20, backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }} >{langObj.deviceInfo}</Text>
          <View style={{ backgroundColor: 'white', marginTop: 10 }} >
            <View>
              <OptItem iconname={"developer-board"} title={langObj.deviceName} subtitle={global.deviceName} disabled={false} onPress={() => { setShowDeviceNameModal(true); }} />
              {renderDeviceId()}
            </View>
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 20, backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }} >{langObj.panicButton}</Text>
          <View style={{ backgroundColor: 'white', marginTop: 10 }} >
            <OptItem iconname={"warning"} title={langObj.panicButton} subtitle={langObj.panicButtonDescription}
              onPress={() => {
                Alert.alert(langObj.sure, '',
                  [{
                    text: langObj.submit, onPress: async () => {
                      NetInfo.fetch().then(state => {
                        if (!state.isConnected)
                          Toast.show(langObj.internetConnFail, Toast.LONG);
                        else {
                          if (Platform.OS === 'android') {
                            RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
                              .then(data => {
                                if (data === "already-enabled") {
                                  GetLocation.getCurrentPosition({
                                    enableHighAccuracy: true,
                                    timeout: 10000
                                  }).then(location => {
                                    if (location.latitude != undefined && location.longitude != undefined)
                                      ApiCall.addPanicLog(location.latitude, location.longitude);
                                    else
                                      Toast.show(langObj.locationGetError, Toast.SHORT);
                                  }).catch(error => {
                                    const { code, message } = error;
                                    console.warn(code, message);
                                    Toast.show(langObj.locationGetError, Toast.SHORT);
                                  });
                                } else {
                                  setTimeout(() => {
                                    GetLocation.getCurrentPosition({
                                      enableHighAccuracy: true,
                                      timeout: 10000
                                    }).then(location => {
                                      if (location.latitude != undefined && location.longitude != undefined)
                                        ApiCall.addPanicLog(location.latitude, location.longitude);
                                      else
                                        Toast.show(langObj.locationGetError, Toast.SHORT);
                                    })
                                  }, 1000);
                                }
                              }).catch(error => {
                                const { code, message } = error;
                                console.warn(code, message);
                                Toast.show(langObj.locationGetError, Toast.SHORT);
                              });
                          } else {
                            GetLocation.getCurrentPosition({
                              enableHighAccuracy: true,
                              timeout: 10000
                            }).then(location => {
                              if (location.latitude != undefined && location.longitude != undefined)
                                ApiCall.addPanicLog(location.latitude, location.longitude);
                              else
                                Toast.show(langObj.locationGetError, Toast.SHORT);
                            }).catch(error => {
                              const { code, message } = error;
                              console.warn(code, message);
                              Toast.show(langObj.locationGetError, Toast.SHORT);
                            });
                          }
                        }
                      });
                    }
                  },
                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' }],
                  { cancelable: false }
                );
              }} />
          </View>
        </View>

        <View>
          <View style={{ backgroundColor: 'white' }} >
            <OptItem iconname={"location-pin"} title={langObj.panicLocationButton} subtitle={langObj.panicLocationDescription}
              onPress={() => {
                NetInfo.fetch().then(state => {
                  if (state.isConnected) {
                    ApiCall.getPanicLog().then((x) => {
                      if (x) {
                        if (x.length > 0) {
                          let flagLocation = JSON.parse(x[0]);
                          setLocation(flagLocation);
                          setShowPanicModal(true);
                          if (flagLocation.latitude != undefined && flagLocation.longitude != undefined) {
                            setTimeout(() => {
                              _goToMyPosition(flagLocation.latitude, flagLocation.longitude);
                            }, 2500);
                          }
                        }
                        else {
                          Toast.show(langObj.panicLocationDataNotFound, Toast.LONG);
                        }
                      }
                    });
                  }
                  else
                    Toast.show(langObj.internetConnFail, Toast.LONG);
                });
              }} />
          </View>
        </View>

      </View>}

      <View>
        <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 20, backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }} >{langObj.endSession}</Text>
        <View style={{ backgroundColor: 'white', marginTop: 10 }} >
          <OptItem iconname={"exit-to-app"} title={langObj.exit} subtitle={langObj.exitNotification}
            onPress={
              () => {
                Alert.alert(langObj.sure, '',
                  [{
                    text: langObj.exit, onPress: async () => {
                      const user = await SharedPrefs.getlogindata();
                      NetInfo.fetch().then(state => {
                        if (state.isConnected) {
                          logout(user.mail, user.token, props.nav, props.jump);
                        }
                        else
                          Toast.show(langObj.internetConnFail, Toast.LONG);
                      });
                    }
                  },
                  { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' }],
                  { cancelable: false }
                );
              }} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    width: 200,
    borderBottomWidth: 1
  },
  dropdownBtnStyle: {
    width: "90%",
    height: 50,
    backgroundColor: "#444",
    borderRadius: 8,
  },
  dropdownBtnTxtStyle: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  dropdownDropdownStyle: { backgroundColor: "#444" },
  dropdownRowStyle: { backgroundColor: "#444", borderBottomColor: "#C5C5C5" },
  dropdownRowTxtStyle: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default MyAccount;