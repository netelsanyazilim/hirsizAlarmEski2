import React, { Component } from "react";
import {
  Text, StyleSheet, NativeModules, View, TouchableOpacity,
  TextInput, BackHandler, Alert, Platform, Modal
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Icon, Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import NetInfo from "@react-native-community/netinfo";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
class AkmSettings extends Component {

  @observable AkmData = new Array(4);
  @observable AkmData1 = new Array(5);
  @observable AkmData2 = new Array(5);
  @observable psd = !global.deviceLoggedin;
  @observable akmadresi;
  @observable akmbaglatiportu;
  @observable akmkullanicihesapno;
  @observable akmpingaraligi;
  @observable retrieve = false;
  @observable selectedAKMIndex = null;

  constructor(props) {
    super(props);
    makeObservable(this);
    this._nodes = new Map();
    this.state = ({
      modalVisible: false,
      flagAkmSettings: null
    });
  }

  validateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
      return true;
    }
    return false;
  }

  @action
  setAkm() {
    this.retrieve = true;
    let flagSendAKMIP = this.AkmData[0];
    if (this.validateIPaddress(this.AkmData[0])) {
      let ipAddress = this.AkmData[0].split('.');
      if (ipAddress.length == 4) {
        for (let i = 0; i < 4; i++) {
          ipAddress[i] = new Array((4 - ipAddress[i].length)).join('0') + ipAddress[i];
        }
        flagSendAKMIP = ipAddress[0] + "." + ipAddress[1] + "." + ipAddress[2] + "." + ipAddress[3];
      }
    }

    if (this.AkmData[2].length < 4)
      this.AkmData[2] = this.AkmData[2] + new Array((4 - this.AkmData[2].length)).join('0');
    if (this.AkmData[1].length < 4)
      this.AkmData[1] = this.AkmData[1] + new Array((4 - this.AkmData[1].length)).join('0');
    if (this.AkmData[3].length < 4)
      this.AkmData[3] = this.AkmData[3] + new Array((4 - this.AkmData[3].length)).join('0');

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiCall.setAkm(flagSendAKMIP, this.AkmData[1], this.AkmData[2], this.AkmData[3]).then((x) => {
          this.retrieve = false;
        });
      }
      else
        Toast.show(langObj.internetConnFail, Toast.LONG);
    });
  }

  @action
  setAkm2() {
    this.retrieve = true;
    let flagAkmData = new Array(5);

    if (this.selectedAKMIndex == 1)
      flagAkmData = this.AkmData1;
    else if (this.selectedAKMIndex == 2)
      flagAkmData = this.AkmData2;

    if (this.selectedAKMIndex == 1 || this.selectedAKMIndex == 2) {
      let flagSendAKMIP = flagAkmData[0];
      if (this.validateIPaddress(flagAkmData[0])) {
        let ipAddress = flagAkmData[0].split('.');
        if (ipAddress.length == 4) {
          for (let i = 0; i < 4; i++) {
            ipAddress[i] = new Array((4 - ipAddress[i].length)).join('0') + ipAddress[i];
          }
          flagSendAKMIP = ipAddress[0] + "." + ipAddress[1] + "." + ipAddress[2] + "." + ipAddress[3];
        }
      }

      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          ApiCall.setAkmNew((this.selectedAKMIndex - 1), flagSendAKMIP, flagAkmData[1], flagAkmData[2], flagAkmData[3], flagAkmData[4]).then((x) => {
            this.retrieve = false;
            this.getAkmData();
          });
        }
        else
          Toast.show(langObj.internetConnFail, Toast.LONG);
      });
    }
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
    }

    return flagName;
  }

  @action
  getAkmData() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
    if (result == "00000000") {
      ApiCall.getAkmSettings().then((x) => {
        if (x) {
          this.setState({
            flagAkmSettings: x
          });

          let finalAkmAddress1 = this.decimalToUTF8(x[0].akmAdresi.toString());
          let finalAkmAddress2 = this.decimalToUTF8(x[1].akmAdresi.toString());
          let flagAkmAddress1 = this.decimalToUTF8(x[0].akmAdresi.toString());
          let flagAkmAddress2 = this.decimalToUTF8(x[1].akmAdresi.toString());

          let ipAddress1 = x[0].akmAdresi.toString().split('.');
          let ipAddress2 = x[1].akmAdresi.toString().split('.');

          if (ipAddress1.length == 4) {
            for (let i = 0; i < 4; i++) {
              ipAddress1[i] = Number(ipAddress1[i].toString().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, ''));
            }
            flagAkmAddress1 = ipAddress1[0] + "." + ipAddress1[1] + "." + ipAddress1[2] + "." + ipAddress1[3];
          }

          if (ipAddress2.length == 4) {
            for (let i = 0; i < 4; i++) {
              ipAddress2[i] = Number(ipAddress2[i].toString().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, ''));
            }
            flagAkmAddress2 = ipAddress2[0] + "." + ipAddress2[1] + "." + ipAddress2[2] + "." + ipAddress2[3];
          }

          if (this.validateIPaddress(flagAkmAddress1)) {
            finalAkmAddress1 = flagAkmAddress1;
          }

          if (this.validateIPaddress(flagAkmAddress2)) {
            finalAkmAddress2 = flagAkmAddress2;
          }

          if (x) {
            this.AkmData1 = [finalAkmAddress1, x[0].akmBaglantiPortu.toString(), x[0].akmKullaniciHesapNumarasi.toString(), x[0].akmPingAraligi.toString(), x[0].akmTelefonNo.toString().replace(/[#f]/g, '')];
            this.AkmData2 = [finalAkmAddress2, x[1].akmBaglantiPortu.toString(), x[1].akmKullaniciHesapNumarasi.toString(), x[1].akmPingAraligi.toString(), x[1].akmTelefonNo.toString().replace(/[#f]/g, '')];
            this.retrieve = false;
          }
        } else {
          this.props.navigation.dispatch(
            CommonActions.navigate({
              name: 'SettingsTab'
            })
          );
        }
      });
    } else {
      if (global.deviceLoggedin) {
        this.retrieve = true;
        ApiCall.getAkmSettings().then((x) => {

          let finalAkmAddress = x.akmadresi.toString();
          let flagAkmAddress = x.akmadresi.toString();
          let ipAddress = x.akmadresi.toString().split('.');

          if (ipAddress.length == 4) {
            for (let i = 0; i < 4; i++) {
              ipAddress[i] = Number(ipAddress[i].toString().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, ''));
            }
            flagAkmAddress = ipAddress[0] + "." + ipAddress[1] + "." + ipAddress[2] + "." + ipAddress[3];
          }

          if (this.validateIPaddress(flagAkmAddress)) {
            finalAkmAddress = flagAkmAddress;
          }

          if (x) {
            this.AkmData = [finalAkmAddress, x.akmbaglatiportu.toString(), x.akmkullanicihesapno.toString(), x.akmpingaraligi.toString()];
            this.retrieve = false;
          }
          else {
            Alert.alert(
              langObj.connErr,
              langObj.akmErr,
              [
                { text: langObj.tryAgain, onPress: () => this.getAkmData() },
                { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
              ],
              { cancelable: false }
            )
          }
        });
      }
    }
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
    NetInfo.fetch().then(state => {
      if (state.isConnected)
        this.getAkmData();
      else {
        Toast.show(langObj.internetConnFail, Toast.LONG);
        this.props.navigation.dispatch(
          CommonActions.navigate({
            name: 'SettingsTab'
          })
        );
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

    this.forceUpdate();
  }

  @action
  onChangeAkmSettingText(index, text) {
    if (index != 0 && index != 4) {
      if (text > 65535)
        text = 65535
      else
        text = text;
    } else {
      text = text;
    }

    if (this.selectedAKMIndex == null)
      this.AkmData[index] = text;
    else {
      if (this.selectedAKMIndex == 1)
        this.AkmData1[index] = text;
      else
        this.AkmData2[index] = text;
    }
  }

  renderChild(title, v, i, placeholder, Mlength) {
    return (
      <View>
        <View style={{ flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
            {title}
          </Text>
        </View>
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
          borderColor: "gainsboro", borderBottomWidth: 2, borderColor: 'gray', marginBottom: 10
        }}>
          {this.selectedAKMIndex == null && <TextInput
            style={styles.textInput}
            keyboardType='numeric'
            onChangeText={(text) => this.onChangeAkmSettingText(i, text)}
            autoCapitalize={"none"}
            value={this.AkmData[i] == undefined ? '' : this.AkmData[i].toString()}
            maxLength={Mlength}
            autoCorrect={false}
            placeholder={placeholder}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            selectionColor={'black'}
            returnKeyType={i < 3 ? 'next' : 'done'}
            ref={(ref) => current = ref}
            ref={c => this._nodes.set(i, c)}
            onSubmitEditing={() => i < 3 ? this._nodes.get(i + 1).focus() : this.setAkm()}
          />}
          {this.selectedAKMIndex == 1 && <TextInput
            style={styles.textInput}
            keyboardType='numeric'
            onChangeText={(text) => this.onChangeAkmSettingText(i, text)}
            autoCapitalize={"none"}
            value={this.AkmData1[i] == undefined ? '' : this.AkmData1[i].toString()}
            maxLength={Mlength}
            autoCorrect={false}
            placeholder={placeholder}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            selectionColor={'black'}
            returnKeyType={i < 4 ? 'next' : 'done'}
            ref={(ref) => current = ref}
            ref={c => this._nodes.set(i, c)}
            onSubmitEditing={() => i < 4 ? this._nodes.get(i + 1).focus() : this.setAkm2()}
          />}
          {this.selectedAKMIndex == 2 && <TextInput
            style={styles.textInput}
            keyboardType='numeric'
            onChangeText={(text) => this.onChangeAkmSettingText(i, text)}
            autoCapitalize={"none"}
            value={this.AkmData2[i] == undefined ? '' : this.AkmData2[i].toString()}
            maxLength={Mlength}
            autoCorrect={false}
            placeholder={placeholder}
            underlineColorAndroid={"transparent"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            selectionColor={'black'}
            returnKeyType={i < 4 ? 'next' : 'done'}
            ref={(ref) => current = ref}
            ref={c => this._nodes.set(i, c)}
            onSubmitEditing={() => i < 4 ? this._nodes.get(i + 1).focus() : this.setAkm2()}
          />}
        </View>
      </View>
    );
  }

  renderChildNew(title, index) {
    return (
      <View>
        <TouchableOpacity onPress={() => { this.selectedAKMIndex = index; }} style={{ marginTop: 10, elevation: 5 }}>
          <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{title}</Text>
            </View>
            <View style={{ marginRight: 10 }}>
              <Icon containerStyle={{ width: 40, margin: 5 }} name="edit" size={28} color="gray"
                onPress={() => { this.selectedAKMIndex = index; }}
              />
            </View>
          </View>
          <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

    if (result == "00000000") {
      return (
        <View style={{ backgroundColor: 'white', flex: 1 }}>
          <DeviceLogin loading={this.psd} close={() => { this.psd = false; this.retrieve = false }} back={() => { this.props.navigation.goBack(); }} />
          <View style={{ flex: 1 }} >
            {this.renderChildNew(langObj.AKM1, 1)}
            {this.renderChildNew(langObj.AKM2, 2)}
          </View>
          <Modal
            animationType={'none'}
            visible={this.selectedAKMIndex != null}
            onRequestClose={() => {
              this.selectedAKMIndex = null;
            }}
          >
            <KeyboardAwareScrollView extraHeight={150} enableOnAndroid={false} style={{
              flex: 1, backgroundColor: "white", ...Platform.select({
                ios: {
                  marginTop: 40
                }
              }),
            }}>
              <View>
                <View style={{ flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                    {langObj.akmConnAddress}
                  </Text>
                </View>
                <View style={{
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
                  borderColor: "gainsboro", borderBottomWidth: 2, borderColor: 'gray', marginBottom: 10
                }}>
                  {this.selectedAKMIndex == 1 && <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => this.onChangeAkmSettingText(0, text)}
                    value={this.AkmData1[0] == undefined ? '' : this.AkmData1[0].toString()}
                    maxLength={30}
                    placeholder={langObj.akmConnAddress}
                    underlineColorAndroid={"transparent"}
                    placeholderTextColor={"rgba(0,0,0,0.4)"}
                    selectionColor={'black'}
                    returnKeyType={'next'}
                    ref={(ref) => current = ref}
                    ref={c => this._nodes.set(0, c)}
                    onSubmitEditing={() => this._nodes.get(1).focus()}
                  />
                  }
                  {this.selectedAKMIndex == 2 && <TextInput
                    style={styles.textInput}
                    onChangeText={(text) => this.onChangeAkmSettingText(0, text)}
                    value={this.AkmData2[0] == undefined ? '' : this.AkmData2[0].toString()}
                    maxLength={30}
                    placeholder={langObj.akmConnAddress}
                    underlineColorAndroid={"transparent"}
                    placeholderTextColor={"rgba(0,0,0,0.4)"}
                    selectionColor={'black'}
                    returnKeyType={'next'}
                    ref={(ref) => current = ref}
                    ref={c => this._nodes.set(0, c)}
                    onSubmitEditing={() => this._nodes.get(1).focus()}
                  />
                  }
                </View>
              </View>
              {this.selectedAKMIndex == 1 && <View>
                {this.renderChild(langObj.akmConnPort, this.AkmData1[1], 1, langObj.akmConnPort, 5)}
                {this.renderChild(langObj.akmUserNo, this.AkmData1[2], 2, langObj.akmUserNo, 4)}
                {this.renderChild(langObj.akmPing2, this.AkmData1[3], 3, "1440", 5)}
                {this.renderChild(langObj.AKMPhone, this.AkmData1[4], 4, langObj.AKMPhone, 14)}
              </View>}
              {this.selectedAKMIndex == 2 && <View>
                {this.renderChild(langObj.akmConnPort, this.AkmData2[1], 1, langObj.akmConnPort, 5)}
                {this.renderChild(langObj.akmUserNo, this.AkmData2[2], 2, langObj.akmUserNo, 4)}
                {this.renderChild(langObj.akmPing2, this.AkmData2[3], 3, "1440", 5)}
                {this.renderChild(langObj.AKMPhone, this.AkmData2[4], 4, langObj.AKMPhone, 14)}
              </View>}
              <View style={{ marginTop: 10, flexDirection: 'row', alignSelf: 'center' }} >
                <Button
                  borderRadius={4}
                  buttonStyle={{ backgroundColor: "#cc1e18", width: 150 }}
                  title={langObj.close}
                  onPress={() => {
                    this.selectedAKMIndex = null
                  }}
                />
                <Button

                  borderRadius={4}
                  buttonStyle={{ backgroundColor: "#cc1e18", width: 150, marginBottom: 20, marginLeft: 10 }}
                  title={langObj.submit}
                  onPress={() => {
                    this.setAkm2();
                  }}
                />
              </View>
            </KeyboardAwareScrollView>
          </Modal>
        </View>
      );
    }
    else {
      return (
        <KeyboardAwareScrollView extraHeight={150} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
          <DeviceLogin loading={this.psd} close={() => {
            this.retrieve = false;
            this.psd = false;
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                ApiCall.getAkmSettings().then(x => {
                  this.loading = false;
                  if (x != false) {
                    this.AkmData = [x.akmadresi, x.akmbaglatiportu, x.akmkullanicihesapno, x.akmpingaraligi];
                  }
                  else {
                    Alert.alert(
                      langObj.connErr,
                      langObj.akmErr,
                      [
                        { text: langObj.tryAgain, onPress: () => this.getAkmData() },
                        { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
                      ],
                      { cancelable: false }
                    );
                  }
                }), y => {
                  this.loading = false;
                }
              }
              else
                Toast.show(langObj.internetConnFail, Toast.LONG);
            });
          }} back={() => { this.props.navigation.goBack(); }} />
          <View>
            <View style={{ flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                {langObj.akmConnAddress}
              </Text>
            </View>
            <View style={{
              flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
              borderColor: "gainsboro", borderBottomWidth: 2, borderColor: 'gray', marginBottom: 10
            }}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => this.onChangeAkmSettingText(0, text)}
                value={this.AkmData[0] == undefined ? '' : this.AkmData[0].toString()}
                maxLength={30}
                placeholder={langObj.akmConnAddress}
                underlineColorAndroid={"transparent"}
                placeholderTextColor={"rgba(0,0,0,0.4)"}
                selectionColor={'black'}
                returnKeyType={'next'}
                ref={(ref) => current = ref}
                ref={c => this._nodes.set(0, c)}
                onSubmitEditing={() => this._nodes.get(1).focus()}
              />
            </View>
          </View>
          {this.renderChild(langObj.akmConnPort, this.AkmData[1], 1, langObj.akmConnPort, 5)}
          {this.renderChild(langObj.akmUserNo, this.AkmData[2], 2, langObj.akmUserNo, 4)}
          {this.renderChild(langObj.akmPing, this.AkmData[3], 3, "64800", 5)}
          <View style={{ marginTop: 10 }} >
            <Button
              disabled={enable}
              borderRadius={4}
              buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginLeft: 10, marginRight: 10 }}
              title={langObj.submit}
              onPress={() => {
                click();
                this.forceUpdate();
                this.setAkm();
                setTimeout(() => {
                  click();
                  this.forceUpdate();
                }, 3000);
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  textInput: {
    marginLeft: 10,
    flex: 1,
    marginRight: 20,
    fontSize: 17,
    ...Platform.select({
      ios: {
        marginBottom: 10,
        marginTop: 10
      },
      android: {
        marginBottom: 0,
        marginTop: 0
      }
    }),
  }
});

export default AkmSettings;