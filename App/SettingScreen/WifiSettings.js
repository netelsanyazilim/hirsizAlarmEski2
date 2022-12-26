import React, { Component } from "react";
import {
  NativeModules, View, BackHandler, Platform, Text,
  TouchableOpacity, Modal, StyleSheet, TextInput
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import DeviceLogin from '../Component/DeviceLogin';
import NetInfo from "@react-native-community/netinfo";
import { observable, makeObservable, action } from "mobx";
import Toast from 'react-native-simple-toast';
import { Button } from "react-native-elements";
import { observer } from "mobx-react";
import OptItem from "../Component/OptItem";
import Spinner from "react-native-spinkit";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
var timerFlag = false;

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
class WifiSettings extends Component {

  @observable loading = false;
  @observable loadingStatus = false;
  @observable psd = !global.deviceLoggedin;
  @observable visibleSpinner = true;
  @observable visibleSpinner2 = true;
  @observable searchWifi = false;
  @observable searchWifiModal = false;
  @observable networks = [];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = ({
      wifiName: "",
      wifiSignalQuality: "",
      wifiConnectedB: 0,
      wifiConnected: false,
      wifiConnectError: 0,
      showPasswordModal: false,
      password: "",
      selectedWifi: ""
    });
  }

  componentWillUnmount() {
    if (timerFlag) {
      clearInterval(timerFlag);
    }

    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = async () => {
    if (timerFlag) {
      clearInterval(timerFlag);
    }

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

    if (global.deviceLoggedin) {
      this.getWifiSettingsFirst();
      this.getWifiNetworks();

      setTimeout(() => {
        timerFlag = setInterval(() => {
          if ((!this.searchWifi) && (!this.searchWifiModal))
            this.getWifiSettings();
        }, 4000);
      }, 7000);
    }
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

  decimalToUTF8(stringArray) {
    let flagName = "";
    let stringDecimalArray = stringArray.split(",");
    if (stringDecimalArray[0] != "0") {
      for (let index = 0; index < stringDecimalArray.length; index++) {
        if (parseInt(stringDecimalArray[index]) != 0) {
          flagName += String.fromCharCode(parseInt(stringDecimalArray[index]));
        } else
          break;
      }
    } else
      flagName = "";

    return flagName;
  }

  @action
  getWifiSettingsFirst() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiCall.getWifiSettings().then((x) => {
          if (x) {
            let flagWifiName = "";
            let flagWifiSignalQuality = "";
            let flagWifiConnected = false;
            let flagWifiConnectError = 0;

            flagWifiName = this.decimalToUTF8(x.wifiName);
            flagWifiSignalQuality = x.wifiSignalQuality;
            flagWifiConnected = ((x.wifiConnected == 1) ? true : false);
            flagWifiConnectError = x.wifiConnectError;

            this.setState({
              wifiName: flagWifiName,
              wifiSignalQuality: flagWifiSignalQuality,
              wifiConnected: flagWifiConnected,
              wifiConnectedB: x.wifiConnected,
              wifiConnectError: x.wifiConnectError
            });
            this.visibleSpinner = false;
          }
          else {

            if (timerFlag) {
              console.log("ilk seferde wifi settings alamadı");
              clearInterval(timerFlag);
            }

            this.props.navigation.dispatch(
              CommonActions.navigate({
                name: 'SettingsTab'
              })
            );
          }
        });
      }
      else {
        this.setState({
          wifiName: "",
          wifiSignalQuality: "",
          wifiConnectedB: 0,
          wifiConnectError: 0
        });
        Toast.show(langObj.internetConnFail, Toast.LONG);

        if (timerFlag) {
          clearInterval(timerFlag);
        }

        this.props.navigation.dispatch(
          CommonActions.navigate({
            name: 'SettingsTab'
          })
        );
      }
    });
  }

  @action
  getWifiSettings() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.loadingStatus = true;
        ApiCall.getWifiSettings().then((x) => {
          if (x) {
            let flagWifiName = "";
            let flagWifiSignalQuality = "";
            let flagWifiConnected = false;
            let flagWifiConnectError = 0;

            flagWifiName = this.decimalToUTF8(x.wifiName);
            flagWifiSignalQuality = x.wifiSignalQuality;
            flagWifiConnected = ((x.wifiConnected == 1) ? true : false);
            flagWifiConnectError = x.wifiConnectError;

            this.setState({
              wifiName: flagWifiName,
              wifiSignalQuality: flagWifiSignalQuality,
              wifiConnected: flagWifiConnected,
              wifiConnectedB: x.wifiConnected,
              wifiConnectError: x.wifiConnectError
            });

            this.loadingStatus = false;
          }
        });
      }
      else {
        this.setState({
          wifiName: "",
          wifiSignalQuality: "",
          wifiConnectedB: 0,
          wifiConnectError: 0
        });
        Toast.show(langObj.internetConnFail, Toast.LONG);
      }
    });
  }

  @action
  getWifiNetworks() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.visibleSpinner2 = true;
        this.searchWifi = true;
        ApiCall.searchWifiNetworks().then(() => {
          setTimeout(() =>
            ApiCall.getWifiNetworks().then((x) => {
              if (x) {
                if (x.wifiCount != undefined && x.wifiCount != null) {
                  let flagWifiNetworks = [];
                  for (let index = 0; index < x.wifiCount; index++) {
                    let flagWifiName = "";
                    flagWifiName = this.decimalToUTF8(x.wifiNetworks[index].wifiName);
                    flagWifiNetworks.push({ label: flagWifiName, index: index, signalQuality: x.wifiNetworks[index].signalQuality });
                  }

                  this.searchWifi = false;
                  this.networks = flagWifiNetworks;
                  this.visibleSpinner2 = false;
                } else {
                  if (!(this.networks.length > 0))
                    this.networks = [];
                  this.visibleSpinner2 = false;
                  this.searchWifi = false;
                  //Toast.show(langObj.cantFindWifi, Toast.LONG);
                }
              }
              else {
                if (!(this.networks.length > 0))
                  this.networks = [];
                this.visibleSpinner2 = false;
                this.searchWifi = false;
                //Toast.show(langObj.cantFindWifi, Toast.LONG);
              }
            }), 6000);
        });
      }
      else {
        this.networks = [];
        this.visibleSpinner2 = true;
        Toast.show(langObj.internetConnFail, Toast.LONG);
      }
    });
  }

  setWifiSettings() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiCall.setWifiSettings(this.state.selectedWifi, this.state.password).then(() => {
          setTimeout(() => {
            this.searchWifi = false;
            this.setState({
              showPasswordModal: false,
              password: ""
            });
          }, 3000);
        });
      }
      else
        Toast.show(langObj.internetConnFail, Toast.LONG);
    });
  }

  handlePassword = (text) => {
    this.setState({ password: text })
  }

  render() {
    let backColor = ['#cc1e18', 'green'];

    const wifiListRender = this.networks.map((data) => {
      return (
        <TouchableOpacity style={{ marginTop: 10, elevation: 5 }}
          onPress={() => {
            this.setState({ selectedWifi: data.label, showPasswordModal: true });
          }}>
          <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "bold", margin: 10, color: 'black', fontSize: 18 }}>{data.label + " - %" + data.signalQuality}</Text>
          </View>
          <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
        </TouchableOpacity>
      )
    });

    return (
      <View style={{ flex: 1 }}>
        <DeviceLogin loading={this.psd} close={() => {
          this.getWifiSettingsFirst();
          this.getWifiNetworks();
          setTimeout(() => {
            timerFlag = setInterval(() => {
              console.log("timer çalışmaya çalışıyor.");
              console.log(this.searchWifi);
              console.log(this.searchWifiModal);
              if ((!this.searchWifi) && (!this.searchWifiModal))
                this.getWifiSettings();
            }, 4000);
          }, 7000);

          this.psd = false;
        }} back={() => {

          if (timerFlag) {
            clearInterval(timerFlag);
          }

          this.props.navigation.goBack();
        }} />

        {this.visibleSpinner &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
            <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
            <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
          </View>
        }

        {!this.visibleSpinner && <View style={{ flex: 1, marginTop: 10 }} >
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <View style={{
              borderWidth: 1, borderRadius: 6, width: '90%', alignItems: 'center',
              justifyContent: 'space-between', borderBottomWidth: 0,
              backgroundColor: backColor[this.state.wifiConnectedB],
              borderColor: 'gray'
            }} >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: "bold", marginTop: 10, marginBottom: 20 }}>{langObj.connectionStatus}</Text>
              {(this.state.wifiName == "") && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.noRegisteredWifi}</Text>}
              {!(this.state.wifiName == "") && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connectionName + this.state.wifiName}</Text>}
              {this.state.wifiConnected && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connectionStatus + ": " + langObj.connected}</Text>}
              {!this.state.wifiConnected && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connectionStatus + ": " + langObj.notConnected}</Text>}
              {(this.state.wifiConnectError == 1) && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connErr + ": " + langObj.connectionTimeout}</Text>}
              {(this.state.wifiConnectError == 2) && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connErr + ": " + langObj.wrongPassword}</Text>}
              {(this.state.wifiConnectError == 3) && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connErr + ": " + langObj.cantFindAP}</Text>}
              {(this.state.wifiConnectError == 4) && <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connErr + ": " + langObj.connectionFailedWifi}</Text>}
              <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>{langObj.connectionPower + "% " + this.state.wifiSignalQuality}</Text>

              {/*

              {!this.loadingStatus && <Button borderRadius={4} buttonStyle={{ backgroundColor: "#50bad0", marginTop: 10, marginBottom: 10 }}
                fontWeight='bold' title={langObj.checkConnectionStatus}
                onPress={() => {
                  this.getWifiSettings();
                }} />}

              {this.loadingStatus && <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Spinner size={30} type={'Wave'} color={"#000000"} />
                <Text style={{ marginTop: 10, marginBottom: 5, color: "white" }}>{langObj.fetchingData}</Text>
              </View>}
              
              */}

            </View>
          </View>

          <OptItem disabled={false} iconname={"search"} title={langObj.wifiConnectionSearch} subtitle={langObj.wifiConnectionSearchSub}
            onPress={() => {
              this.searchWifiModal = true;
              this.getWifiNetworks();
              // Önceden bu sayfaya yönlendirilip wifi arama işlemleri yapılıyordu.
              // if (global.statusData != undefined)
              //   this.props.navigation.navigate("WifiSettingSearch");
            }} />
        </View>}

        <Modal visible={this.searchWifiModal} animationType={"slide"} onRequestClose={() => { this.searchWifiModal = false }} transparent={true}>

          <View style={{ backgroundColor: 'white', flex: 1 }}>
            {this.visibleSpinner2 &&
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
                <Spinner size={100} type={'Pulse'} color={"#FFFFFF"} />
                <Text style={{ marginTop: 10, color: "white" }}>{langObj.searchWifi}</Text>
              </View>
            }

            {!this.visibleSpinner2 && (this.networks.length > 0) && <View style={{
              backgroundColor: 'white', flex: 1, ...Platform.select({
                ios: {
                  marginTop: 40
                }
              }),
            }}>
              <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro' }} ></View>
              <Text style={{ margin: 10, fontSize: 20, color: "#cc1e18", fontWeight: 'bold', textAlign: 'center' }} >
                {langObj.findedConnections}
              </Text>
              {wifiListRender}
              <View style={{ marginTop: 20, alignSelf: 'center' }} >
                <Button title={langObj.cancel} buttonStyle={{ backgroundColor: "#cc1e18", width: 300 }}
                  onPress={() => {
                    this.searchWifiModal = false
                  }}
                />
              </View>
              <Modal visible={this.state.showPasswordModal} animationType={"fade"}
                onRequestClose={() => {
                  this.setState({ showPasswordModal: false })
                }} transparent={true}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
                  <View style={{
                    margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
                  }}>
                    <TextInput style={styles.input}
                      placeholderTextColor={"rgba(0,0,0,0.4)"}
                      selectionColor={"black"}
                      onChangeText={this.handlePassword}
                      value={this.state.password}
                      placeholder={langObj.inPassword}
                      secureTextEntry={true} />
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                      <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                        onPress={() => {
                          this.setState({
                            showPasswordModal: false,
                            password: ""
                          })
                        }}>
                        <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                        onPress={() => {
                          if (this.state.password != "") {
                            this.setWifiSettings();
                          } else Toast.show(langObj.cantBeEmpty, Toast.LONG);
                        }}>
                        <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.connect}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
            }

            {!this.visibleSpinner2 && (this.networks.length == 0) &&
              <View style={{
                flexDirection: 'row', justifyContent: 'center', marginBottom: 10, marginTop: 10, ...Platform.select({
                  ios: {
                    marginTop: 40
                  }
                }),
              }}>
                <View style={{
                  borderWidth: 1, borderRadius: 6, width: '90%', alignItems: 'center',
                  justifyContent: 'space-between', borderBottomWidth: 0,
                  backgroundColor: 'gray', borderColor: 'gray'
                }} >
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 15 }}>
                    {langObj.cantFindWifi}</Text>
                  <Button borderRadius={4}
                    buttonStyle={{ backgroundColor: "green", width: 200, marginTop: 10, marginBottom: 10 }}
                    fontWeight='bold' title={langObj.searchWifiAgain}
                    onPress={() => {
                      this.getWifiNetworks();
                    }} />
                  <View style={{ marginTop: 20, marginBottom: 10 }}>
                    <Button title={langObj.back} buttonStyle={{ backgroundColor: "#cc1e18", width: 200 }}
                      onPress={() => {
                        this.searchWifiModal = false
                      }}
                    />
                  </View>
                </View>
              </View>
            }
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    width: 200,
    borderBottomWidth: 1
  }
});

export default WifiSettings;