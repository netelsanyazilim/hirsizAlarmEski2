import React, { Component } from "react";
import {
  Text, NativeModules, StyleSheet, View, TouchableOpacity, TextInput,
  BackHandler, Platform, Switch, Modal
} from "react-native";
import RadioForm, { RadioButton } from 'react-native-simple-radio-button';
import { CommonActions } from '@react-navigation/native';
import { Icon } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import NetInfo from "@react-native-community/netinfo";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import Spinner from "react-native-spinkit";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
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
class RelaySettings extends Component {

  @observable loading = false;
  @observable psd = !global.deviceLoggedin;
  @observable visibleSpinner = true;

  @observable testEnabled = [false, false];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = ({
      isEnabled: [false, false],
      switchDisabled: [false, false],
      relayName: ["", ""],
      relayMod: [0, 0],
      showNameModal: false,
      newName: "",
      showRelayModal: false,
      languages: [
        { label: langObj.whenDisarm, value: 0 },
        { label: langObj.whenArm, value: 1 },
        { label: langObj.whenCancel, value: 2 },
        { label: langObj.whenAlarm, value: 3 },
        { label: langObj.whenRemoteControl, value: 4 }
      ],
      selectedIndex: 0,
      ifNotSuccessMode: [0, 0]
    });
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

  decimalToUTF8(stringArray, index) {
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
      flagName = langObj.relay + " " + index;

    return flagName;
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.getLanguage();
    this.getRelaySettings();
  }

  @action
  getRelaySettings() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiCall.getRelaySettings().then((x) => {
          if (x) {
            let flagEnabled = [false, false];
            let flagSwitchDisabled = [false, false];
            let stringRelayName = ["", ""];
            let flagRelayMode = [0, 0];

            flagEnabled[0] = (x.roleStatus1 ? true : false);
            flagEnabled[1] = (x.roleStatus2 ? true : false);
            flagSwitchDisabled[0] = ((x.roleMod1 == 4) ? false : true);
            flagSwitchDisabled[1] = ((x.roleMod2 == 4) ? false : true);
            flagRelayMode[0] = x.roleMod1;
            flagRelayMode[1] = x.roleMod2;
            stringRelayName[0] = this.decimalToUTF8(x.roleName1, 1);
            stringRelayName[1] = this.decimalToUTF8(x.roleName2, 2);

            this.testEnabled = flagEnabled;

            this.setState({
              relayName: stringRelayName,
              relayMod: flagRelayMode,
              ifNotSuccessMode: flagRelayMode,
              isEnabled: flagEnabled,
              switchDisabled: flagSwitchDisabled
            });

            this.visibleSpinner = false;
          } else {
            this.props.navigation.dispatch(
              CommonActions.navigate({
                name: 'SettingsTab'
              })
            );
          }
        });
      } else {
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

  toggleSwitch(index) {
    // önceki hali 1: işlem tamamlanmadan switch'in yeri değişmiyor, işlem onayından sonra gerçekleşiyordu. eski haline alındı.
    // let flagIsEnabled = this.state.isEnabled;
    // let flagIsEnabledIfNotSuccess = this.state.isEnabled.slice();
    // flagIsEnabled[index] = !flagIsEnabled[index];

    // NetInfo.fetch().then(state => {
    //   if (state.isConnected) {
    //     let status = ((flagIsEnabled[index]) ? 1 : 0);
    //     ApiCall.setRelay(index, status).then((x) => {
    //       if (x) {
    //         // let flagRelayStatus = this.state.isEnabled;
    //         // flagRelayStatus[index] = this.state.isEnabled[index];
    //         // this.setState({ isEnabled: flagRelayStatus });
    //       } else {
    //         let flagRelayStatus2 = flagIsEnabledIfNotSuccess;
    //         this.setState({ isEnabled: flagRelayStatus2 });
    //       }
    //     }, y => {
    //       setTimeout(() => {
    //         let flagRelayStatus2 = this.state.ifNotSuccessMode;
    //         this.setState({ isEnabled: flagRelayStatus2 });
    //       }, 5000);
    //     });
    //   }
    //   else {
    //     let flagRelayStatus2 = this.state.ifNotSuccessMode;
    //     this.setState({ isEnabled: flagRelayStatus2 });
    //     Toast.show(langObj.internetConnFail, Toast.LONG);
    //   }
    // });

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        let status = ((!this.testEnabled[index]) ? 1 : 0);
        let oldTestEnabled = this.testEnabled;  //işlem başarısız olursa eski haline dönsün

        let flagRelayStatus = this.testEnabled;
        flagRelayStatus[index] = !this.testEnabled[index];
        this.testEnabled = flagRelayStatus;
        this.changeRelayStatus(index, status, oldTestEnabled);
      }
    });
  }

  changeRelayStatus(index, status, oldTestEnabled) {
    ApiCall.setRelay(index, status).then((x) => {
      if (x) {
        //console.log(this.state.isEnabled);
      } else {
        this.testEnabled = oldTestEnabled;
      }
    });
  }

  handleName = (text) => {
    this.setState({ newName: text })
  }

  renderChild(index) {
    let flagIsEnabled = this.state.isEnabled;
    let flagSwitchDisabled = this.state.switchDisabled;
    let flagRelayName = this.state.relayName;
    return (
      <View>
        {this.visibleSpinner &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
            <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
            <Text style={{ marginTop: 10, color: "white" }}>{langObj.loading}</Text>
          </View>}

        {!this.visibleSpinner && <TouchableOpacity disabled style={{ marginTop: 10, elevation: 5 }}>
          <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 5, color: 'black', fontSize: 12 }}>{flagRelayName[index]}</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "center", justifyContent: "space-between" }}>

              {/* önceki hali 1: işlem tamamlanmadan switch'in yeri değişmiyor, işlem onayından sonra gerçekleşiyordu. eski haline alındı.
              <View>
                {flagIsEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 12 }}>{langObj.active}</Text>}
                {!flagIsEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 12 }}>{langObj.passive}</Text>}
              </View>

              
              <View style={{ marginRight: 10, marginTop: 5, marginBottom: 5 }}>
                {!flagSwitchDisabled[index] && <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => this.toggleSwitch(index)}
                  disabled={flagSwitchDisabled[index]}
                  value={flagIsEnabled[index]}
                />}
                </View> */}

              <View>
                {this.testEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 12 }}>{langObj.active}</Text>}
                {!this.testEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 12 }}>{langObj.passive}</Text>}
              </View>

              <View style={{ marginRight: 10, marginTop: 5, marginBottom: 5 }}>
                {!flagSwitchDisabled[index] && <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => this.toggleSwitch(index)}
                  disabled={flagSwitchDisabled[index]}
                  value={this.testEnabled[index]}
                />}
              </View>

              <Icon containerStyle={{ width: 40, margin: 5 }} name="edit" size={28} color="gray"
                onPress={() => { this.setState({ showNameModal: true, newName: this.state.relayName[index], selectedIndex: index }) }}
              />
              <Icon containerStyle={{ width: 40, margin: 5 }} name="settings" size={28} color="gray"
                onPress={() => { this.setState({ showRelayModal: true, selectedIndex: index }) }}
              />
            </View>
          </View>
          <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
        </TouchableOpacity>}
      </View>
    );
  }

  render() {
    let flagRelayMod = this.state.relayMod;

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />

        {this.visibleSpinner &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
            <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
            <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
          </View>
        }

        {!this.visibleSpinner && <View>
          {this.renderChild(0)}
          {this.renderChild(1)}
        </View>}

        <Modal visible={this.state.showNameModal} animationType={"fade"} onRequestClose={() => { this.setState({ showNameModal: false }) }} transparent={true}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
            <View style={{
              margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
            }}>
              <TextInput style={styles.input}
                placeholderTextColor={"rgba(0,0,0,0.4)"}
                selectionColor={"black"}
                onChangeText={this.handleName}
                value={this.state.newName}
                maxLength={20}
                placeholder={langObj.newRelayName} />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                  onPress={() => {
                    this.setState({
                      showNameModal: false,
                      newName: ""
                    });
                  }}>
                  <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                  onPress={() => {
                    if (this.state.newName != "") {
                      NetInfo.fetch().then(state => {
                        if (state.isConnected) {
                          ApiCall.setRelayName(this.state.selectedIndex, this.state.newName).then((x) => {
                            if (x) {
                              this.getRelaySettings();
                              this.setState({ showNameModal: false, newName: "", selectedIndex: 0 });
                            }
                          }, y => {
                            setTimeout(() => {
                              //this.setState({ showNameModal: flagRelayStatus2 });
                            }, 5000);
                          });
                        }
                        else {
                          this.setState({ showNameModal: false, newName: "", selectedIndex: 0 });
                          Toast.show(langObj.internetConnFail, Toast.LONG);
                        }
                      });
                    } else Toast.show(langObj.cantBeEmpty, Toast.LONG);
                  }}>
                  <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.submit}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={this.state.showRelayModal} animationType={"fade"} onRequestClose={() => { this.setState({ showRelayModal: false }) }} transparent={true}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
            <View style={{
              margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
            }}>
              <View style={{ margin: 20 }}>
                <RadioForm>
                  {this.state.languages.map((obj, i) => {
                    return (
                      <View key={i} style={styles.radioButtonWrap}>
                        <RadioButton
                          isSelected={flagRelayMod[this.state.selectedIndex] == i}
                          obj={obj}
                          index={i}
                          buttonColor={"#cc1e18"}
                          style={[i !== this.state.languages.length - 1 && styles.radioStyle]}
                          onPress={(value, index2) => {
                            let flagRelayMod = this.state.relayMod;
                            flagRelayMod[this.state.selectedIndex] = index2;
                            this.setState({ relayMod: flagRelayMod });
                          }}
                        />
                      </View>
                    )
                  })}
                </RadioForm>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                  onPress={() => {
                    this.setState({
                      showRelayModal: false,
                      selectedIndex: 0
                    })
                  }}>
                  <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                  onPress={() => {
                    NetInfo.fetch().then(state => {
                      if (state.isConnected) {
                        ApiCall.setRelaySettings(this.state.selectedIndex, this.state.relayMod[this.state.selectedIndex]).then((x) => {
                          if (x) {
                            let flagRelayMod = this.state.relayMod;
                            flagRelayMod[this.state.selectedIndex] = this.state.relayMod[this.state.selectedIndex];
                            this.setState({ showRelayModal: false, selectedIndex: 0, relayMod: flagRelayMod });
                            this.getRelaySettings();
                          } else {
                            let flagRelayMod2 = this.state.ifNotSuccessMode;
                            this.setState({ showRelayModal: false, selectedIndex: 0, relayMod: flagRelayMod2 });
                          }
                        }, y => {
                          setTimeout(() => {
                            let flagRelayMod2 = this.state.ifNotSuccessMode;
                            this.setState({ showRelayModal: false, selectedIndex: 0, relayMod: flagRelayMod2 });
                          }, 5000);
                        });
                      }
                      else Toast.show(langObj.internetConnFail, Toast.LONG);
                    });
                  }}>
                  <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.submit}</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  radioStyle: {
    paddingRight: 10
  },
  radioButtonWrap: {
    marginRight: 5
  }
});

export default RelaySettings;