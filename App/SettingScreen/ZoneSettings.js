import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  NativeModules,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {action, observable, makeObservable} from 'mobx';
import NetInfo from '@react-native-community/netinfo';
import {observer} from 'mobx-react';
import LeftIconButton from '../Component/LeftIconButton';
import {Icon, Button} from 'react-native-elements';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import RadioForm from 'react-native-simple-radio-button';
import ApiService from '../Utils/ApiService';
import DeviceLogin from '../Component/DeviceLogin';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();

var langObj;
var locale;
var newData;
if (Platform.OS === 'android') {
  locale = NativeModules.I18nManager.localeIdentifier;
} else {
  locale =
    NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0];
}

if (locale.includes('en')) {
  langObj = EN;
} else {
  langObj = TR;
}

//(1=Normalde Kapalı, 2=Normalde Açık)
var radio_props = [
  {label: langObj.disarmed, value: 0},
  {label: langObj.warning, value: 1},
  {label: langObj.hour24, value: 2},
  {label: langObj.instant, value: 3},
  {label: langObj.normal, value: 4},
  {label: langObj.homeType, value: 5},
  {label: langObj.silent, value: 6},
];

var yanginprops = [
  {label: langObj.closed, value: 0},
  {label: langObj.open, value: 1},
];

var radio_props1 = [
  {label: langObj.normallyClosed, value: 0},
  {label: langObj.normallyOpen, value: 1},
];

@observer
class ZoneSettings extends Component {
  @observable psd = !global.deviceLoggedin;
  @observable ZonName = [];
  @observable clickedZon = null;
  @observable pass = null;
  @observable loading = false;
  @observable visibleSpinner = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    newData = global.statusData;
    this.state = {
      value: 0,
      valueConn: 0,
      newClickedZone: null,
      selectedZoneName: '',
      selectedZoneType: null,
      selectedZoneConnType: null,
      selectedZoneEntryTimer: null,
      flagZoneSettings: null,
      flagZoneNames: null,
    };
    this.getZones();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = async () => {
    this.props.navigation.dispatch(
      CommonActions.navigate({
        name: 'SettingsTab',
      }),
    );
    setTimeout(() => {}, 500);
  };

  @action
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.getLanguage();
    this.psd = !global.deviceLoggedin;
    radio_props = [
      {label: langObj.disarmed, value: 0},
      {label: langObj.warning, value: 1},
      {label: langObj.hour24, value: 2},
      {label: langObj.instant, value: 3},
      {label: langObj.normal, value: 4},
      {label: langObj.homeType, value: 5},
      {label: langObj.silent, value: 6},
    ];
    yanginprops = [
      {label: langObj.closed, value: 0},
      {label: langObj.open, value: 1},
    ];
    radio_props1 = [
      {label: langObj.normallyClosed, value: 0},
      {label: langObj.normallyOpen, value: 1},
    ];
    this.getZoneSettings();
  }

  @action
  getZoneSettings() {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        let flagDeviceId = global.deviceId;
        let result = flagDeviceId.substring(10).substring(0, 8);
        if (result == '00000000') {
          ApiCall.getZoneSettings().then((x) => {
            if (x) {
              let flagZoneNames = [];
              if (x != undefined && x != null) {
                for (let index = 0; index < x.zon.length; index++) {
                  flagZoneNames.push(
                    this.decimalToUTF8ForModal(x.zon[index].zonAdi),
                  );
                }
              }
              this.setState({
                flagZoneSettings: x,
                flagZoneNames: flagZoneNames,
              });
              this.visibleSpinner = false;
            } else {
              this.props.navigation.dispatch(
                CommonActions.navigate({
                  name: 'SettingsTab',
                }),
              );
            }
          });
        }
      } else {
        Toast.show(langObj.internetConnFail, Toast.LONG);
        this.props.navigation.dispatch(
          CommonActions.navigate({
            name: 'SettingsTab',
          }),
        );
      }
    });
  }

  async getLanguage() {
    try {
      var locale = null;
      if (Platform.OS === 'android') {
        locale = NativeModules.I18nManager.localeIdentifier;
      } else {
        locale =
          NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0];
      }

      const a = await SharedPrefs.getLang();

      if (a != undefined && a != null) {
        if (a == 1) {
          langObj = EN;
        } else {
          langObj = TR;
        }
      } else {
        if (locale.includes('en')) {
          langObj = EN;
        } else {
          langObj = TR;
        }
      }
    } catch (error) {
      if (locale.includes('en')) {
        langObj = EN;
      } else {
        langObj = TR;
      }
    }

    this.forceUpdate();
  }

  @action
  async getZones() {
    this.ZonName = await SharedPrefs.getAllZon();
  }

  @action
  async save() {
    if (this.pass != null) {
      let zonC = Number(this.clickedZon) + Number(1);
      await SharedPrefs.saveZon('Zon' + zonC, this.pass);
      this.ZonName = await SharedPrefs.getAllZon();
    }
    this.setState({typeModal: false});
  }

  decimalToUTF8(stringArray, index) {
    let flagZoneName = '';
    let stringDecimalArray = stringArray.split(',');
    if (stringDecimalArray[0] != '0') {
      for (let index = 0; index < stringDecimalArray.length; index++) {
        if (parseInt(stringDecimalArray[index]) != 0) {
          flagZoneName += String.fromCharCode(
            parseInt(stringDecimalArray[index]),
          );
        } else {
          break;
        }
      }
    } else {
      flagZoneName = langObj.zon + ' ' + (index + 1);
    }

    return flagZoneName;
  }

  decimalToUTF8ForModal(stringArray) {
    let flagZoneName = '';
    let stringDecimalArray = stringArray.split(',');
    if (stringDecimalArray[0] != '0') {
      for (let index = 0; index < stringDecimalArray.length; index++) {
        if (parseInt(stringDecimalArray[index]) != 0) {
          flagZoneName += String.fromCharCode(
            parseInt(stringDecimalArray[index]),
          );
        } else {
          break;
        }
      }
    }

    return flagZoneName;
  }

  renderChild(title, index) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (index < 8) {
            this.setState({
              value: newData.data.zonbilgisi.zon[index].zontipi,
              valueConn: newData.data.zonbilgisi.zon[index].baglantitipi - 1,
            });
          } else if (index == 8) {
            this.setState({value: newData.data.yanginzontipi});
          }
          this.clickedZon = index;
        }}
        style={{marginTop: 10, elevation: 5}}>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <View style={{marginLeft: 20}}>
            <Text
              style={{
                fontWeight: 'bold',
                alignSelf: 'center',
                margin: 10,
                color: 'black',
                fontSize: 18,
              }}>
              {title}
            </Text>
            <Text style={{color: 'gainsboro', marginLeft: 10}}>
              {langObj.zoneSetting}
            </Text>
          </View>
          <View style={{marginRight: 10}}>
            <Icon
              containerStyle={{width: 40, margin: 5}}
              name="edit"
              size={28}
              color="gray"
              onPress={() => {
                if (index < 8) {
                  this.setState({
                    value: newData.data.zonbilgisi.zon[index].zontipi,
                  });
                } else if (index == 8) {
                  this.setState({value: newData.data.yanginzontipi});
                }
                this.clickedZon = index;
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: 2,
            width: '100%',
            backgroundColor: 'gainsboro',
            marginTop: 5,
          }}
        />
      </TouchableOpacity>
    );
  }

  renderChild2(title, flagIndex) {
    let zoneName = title;
    let zoneName2 = '';
    let subZoneType = '';
    let subZoneConnectionType = '';
    let index = flagIndex - 1;
    var zoneConnectionTypes = [
      langObj.normallyClosed,
      langObj.normallyOpen,
      langObj.rfWireless,
      langObj.netbus,
    ];
    if (
      this.state.flagZoneSettings != undefined &&
      this.state.flagZoneSettings != null &&
      this.state.flagZoneSettings.zon[index] != undefined &&
      this.state.flagZoneSettings.zon[index] != null
    ) {
      zoneName = this.decimalToUTF8(
        this.state.flagZoneSettings.zon[index].zonAdi,
        index,
      );
      zoneName2 = this.decimalToUTF8ForModal(
        this.state.flagZoneSettings.zon[index].zonAdi,
      );
      var zoneTypes = [
        langObj.disarmed,
        langObj.warning,
        langObj.hour24,
        langObj.instant,
        langObj.normal,
        langObj.homeType,
        langObj.silent,
        langObj.special,
      ];
      subZoneType = zoneTypes[this.state.flagZoneSettings.zon[index].zonTipi];
      subZoneConnectionType =
        zoneConnectionTypes[
          this.state.flagZoneSettings.zon[index].baglantiTipi - 1
        ];
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selectedZoneName: zoneName2,
            selectedZoneType: this.state.flagZoneSettings.zon[index].zonTipi,
            selectedZoneConnType:
              this.state.flagZoneSettings.zon[index].baglantiTipi - 1,
            selectedZoneEntryTimer:
              this.state.flagZoneSettings.zon[index].giris - 1,
            newClickedZone: index,
          });
        }}
        style={{marginTop: 10, elevation: 5}}>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text
              style={{
                fontWeight: 'bold',
                margin: 10,
                marginLeft: 20,
                color: 'black',
                fontSize: 18,
              }}>
              {zoneName}
            </Text>
            <Text style={{color: 'black', marginLeft: 20}}>
              {subZoneType} - {subZoneConnectionType}
            </Text>
          </View>
          <View style={{marginRight: 10}}>
            <Icon
              containerStyle={{width: 40, margin: 5}}
              name="edit"
              size={28}
              color="gray"
              onPress={() => {
                this.setState({
                  selectedZoneName: zoneName2,
                  selectedZoneType: this.state.flagZoneSettings.zon[index]
                    .zonTipi,
                  selectedZoneConnType:
                    this.state.flagZoneSettings.zon[index].baglantiTipi - 1,
                  selectedZoneEntryTimer:
                    this.state.flagZoneSettings.zon[index].giris - 1,
                  newClickedZone: index,
                });
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: 2,
            width: '100%',
            backgroundColor: 'gainsboro',
            marginTop: 5,
          }}
        />
      </TouchableOpacity>
    );
  }

  render() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    var zoneTypes = [
      langObj.disarmed,
      langObj.warning,
      langObj.hour24,
      langObj.instant,
      langObj.normal,
      langObj.homeType,
      langObj.silent,
      langObj.special,
    ];
    var zoneConnectionTypes = [
      langObj.normallyClosed,
      langObj.normallyOpen,
      langObj.rfWireless,
      langObj.netbus,
    ];
    var zoneEntryTimers = [
      langObj.entryDelayTimerTitle1,
      langObj.entryDelayTimerTitle2,
      langObj.entryDelayTimerTitle3,
      langObj.entryDelayTimerTitle4,
    ];
    if (result == '00000000') {
      flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
    }

    if (result == '00000000') {
      return (
        <View style={{flex: 1}}>
          <DeviceLogin
            loading={this.psd}
            close={() => {
              this.psd = false;
            }}
            back={() => {
              this.props.navigation.goBack();
            }}
          />

          {this.visibleSpinner && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ffa000',
              }}>
              <Spinner size={100} type={'Wave'} color={'#FFFFFF'} />
              <Text style={{marginTop: 10, color: 'white'}}>
                {langObj.fetchingData}
              </Text>
            </View>
          )}

          {!this.visibleSpinner && (
            <ScrollView style={{backgroundColor: 'white', flex: 1}}>
              <View style={{flex: 1, marginTop: 5}}>
                {this.renderChild2(langObj.zoneName1, 1)}
                {this.renderChild2(langObj.zoneName2, 2)}
                {this.renderChild2(langObj.zoneName3, 3)}
                {this.renderChild2(langObj.zoneName4, 4)}
                {this.renderChild2(langObj.zoneName5, 5)}
                {this.renderChild2(langObj.zoneName6, 6)}
                {this.renderChild2(langObj.zoneName7, 7)}
                {this.renderChild2(langObj.zoneName8, 8)}
                {this.renderChild2(langObj.zoneName9, 9)}
                {this.renderChild2(langObj.zoneName10, 10)}
                {this.renderChild2(langObj.zoneName11, 11)}
                {this.renderChild2(langObj.zoneName12, 12)}
                {this.renderChild2(langObj.zoneName13, 13)}
                {this.renderChild2(langObj.zoneName14, 14)}
                {this.renderChild2(langObj.zoneName15, 15)}
                {this.renderChild2(langObj.zoneName16, 16)}
                {this.renderChild2(langObj.zoneName17, 17)}
                {this.renderChild2(langObj.zoneName18, 18)}
                {this.renderChild2(langObj.zoneName19, 19)}
                {this.renderChild2(langObj.zoneName20, 20)}
                {this.renderChild2(langObj.zoneName21, 21)}
                {this.renderChild2(langObj.zoneName22, 22)}
                {this.renderChild2(langObj.zoneName23, 23)}
                {this.renderChild2(langObj.zoneName24, 24)}
                {this.renderChild2(langObj.zoneName25, 25)}
                {this.renderChild2(langObj.zoneName26, 26)}
                {this.renderChild2(langObj.zoneName27, 27)}
                {this.renderChild2(langObj.zoneName28, 28)}
                {this.renderChild2(langObj.zoneName29, 29)}
                {this.renderChild2(langObj.zoneName30, 30)}
                {this.renderChild2(langObj.zoneName31, 31)}
                {this.renderChild2(langObj.zoneName32, 32)}
              </View>
              <Modal
                visible={this.state.newClickedZone != null}
                animationType={'slide'}
                transparent={false}
                onRequestClose={() => {
                  this.setState({newClickedZone: null});
                }}>
                <KeyboardAvoidingView
                  style={styles.modalContainer}
                  keyboardShouldPersistTaps={'handled'}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      marginTop: 10,
                      fontSize: 18,
                      color: 'gray',
                    }}>
                    {langObj.zoneNameText}
                  </Text>
                  <KeyboardAvoidingView style={styles.innerContainer}>
                    <View style={{alignItems: 'center'}}>
                      <LeftIconButton
                        textColor={'black'}
                        iconname={''}
                        placeholder={
                          this.state.selectedZoneName != ''
                            ? this.state.selectedZoneName
                            : langObj.phZoneName
                        }
                        type={'ip'}
                        value={
                          this.state.selectedZoneName != ''
                            ? this.state.selectedZoneName
                            : ''
                        }
                        placeholderTextColor={'rgba(0,0,0,0.4)'}
                        onTextChange={(t) => {
                          this.setState({selectedZoneName: t});
                        }}
                        underlineColor={'red'}
                        maxLength={20}
                      />
                    </View>
                  </KeyboardAvoidingView>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      marginTop: 20,
                      fontSize: 18,
                      color: 'gray',
                    }}>
                    {langObj.selectZoneType}
                  </Text>
                  <View
                    style={{
                      alignItems: 'center',
                      width: '100%',
                      marginLeft: 10,
                      marginTop: 10,
                    }}>
                    <SelectDropdown
                      data={zoneTypes}
                      defaultValueByIndex={this.state.selectedZoneType}
                      onSelect={(selectedItem, index) => {
                        this.setState({selectedZoneType: index});
                      }}
                      defaultButtonText={langObj.zoneType}
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
                          <FontAwesome
                            name="chevron-down"
                            color={'#FFF'}
                            size={18}
                          />
                        );
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdownDropdownStyle}
                      rowStyle={styles.dropdownRowStyle}
                      rowTextStyle={styles.dropdownRowTxtStyle}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      marginTop: 20,
                      fontSize: 18,
                      color: 'gray',
                    }}>
                    {langObj.selectZoneConnectType}
                  </Text>
                  <View
                    style={{
                      alignItems: 'center',
                      width: '100%',
                      marginLeft: 10,
                      marginTop: 10,
                    }}>
                    <SelectDropdown
                      data={zoneConnectionTypes}
                      defaultValueByIndex={this.state.selectedZoneConnType}
                      onSelect={(selectedItem, index) => {
                        this.setState({selectedZoneConnType: index});
                      }}
                      defaultButtonText={langObj.zoneConnectionType}
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
                          <FontAwesome
                            name="chevron-down"
                            color={'#FFF'}
                            size={18}
                          />
                        );
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdownDropdownStyle}
                      rowStyle={styles.dropdownRowStyle}
                      rowTextStyle={styles.dropdownRowTxtStyle}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      marginTop: 20,
                      fontSize: 18,
                      color: 'gray',
                    }}>
                    {langObj.chooseZoneEntryTimer}
                  </Text>
                  <View
                    style={{
                      alignItems: 'center',
                      width: '100%',
                      marginLeft: 10,
                      marginTop: 10,
                    }}>
                    <SelectDropdown
                      data={zoneEntryTimers}
                      defaultValueByIndex={this.state.selectedZoneEntryTimer}
                      onSelect={(selectedItem, index) => {
                        this.setState({selectedZoneEntryTimer: index});
                      }}
                      defaultButtonText={langObj.zoneEntryTimer}
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
                          <FontAwesome
                            name="chevron-down"
                            color={'#FFF'}
                            size={18}
                          />
                        );
                      }}
                      dropdownIconPosition={'right'}
                      dropdownStyle={styles.dropdownDropdownStyle}
                      rowStyle={styles.dropdownRowStyle}
                      rowTextStyle={styles.dropdownRowTxtStyle}
                    />
                  </View>
                  {!this.loading && (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        marginBottom: 5,
                        alignSelf: 'center',
                      }}>
                      <Button
                        title={langObj.cancel}
                        buttonStyle={{
                          backgroundColor: '#cc1e18',
                          width: 150,
                          marginRight: 5,
                        }}
                        onPress={() =>
                          this.setState({
                            selectedZoneName: '',
                            selectedZoneType: null,
                            selectedZoneConnType: null,
                            selectedZoneEntryTimer: null,
                            newClickedZone: null,
                          })
                        }
                      />
                      <Button
                        onPress={() => {
                          NetInfo.fetch().then((state) => {
                            if (state.isConnected) {
                              let flagZone = {};
                              let stringTopla = '';
                              var A;

                              for (
                                let index = 0;
                                index < this.state.selectedZoneName.length;
                                index++
                              ) {
                                A = this.state.selectedZoneName.charCodeAt(
                                  index,
                                );
                                if (A >= 97 && A < 123) {
                                  A = A - 32;
                                }

                                if (
                                  String.fromCharCode(A) == 'Ş' ||
                                  String.fromCharCode(A) == 'ş'
                                ) {
                                  stringTopla = stringTopla + 'S';
                                } else if (
                                  String.fromCharCode(A) == 'Ğ' ||
                                  String.fromCharCode(A) == 'ğ'
                                ) {
                                  stringTopla = stringTopla + 'G';
                                } else if (String.fromCharCode(A) == 'ı') {
                                  stringTopla = stringTopla + 'I';
                                } else if (
                                  String.fromCharCode(A) == 'ö' ||
                                  String.fromCharCode(A) == 'Ö'
                                ) {
                                  stringTopla = stringTopla + 'O';
                                } else if (
                                  String.fromCharCode(A) == 'ç' ||
                                  String.fromCharCode(A) == 'Ç'
                                ) {
                                  stringTopla = stringTopla + 'C';
                                } else if (
                                  String.fromCharCode(A) == 'ü' ||
                                  String.fromCharCode(A) == 'Ü'
                                ) {
                                  stringTopla = stringTopla + 'U';
                                } else {
                                  stringTopla =
                                    stringTopla + String.fromCharCode(A);
                                }

                                // hsn hsn

                                //  flagZoneName += String.fromCharCode(parseInt(stringDecimalArray[index]));
                                // arrayZon[index] = this.state.selectedZoneName.substring(index, 1);
                                // flagZone.zonAdi = this.state.selectedZoneName;
                              }
                              flagZone.zonAdi = stringTopla;
                              // flagZone.zonAdi = this.state.selectedZoneName;
                              //   Toast.show('decimal çevrim ' + stringTopla, Toast.LONG);
                              flagZone.zonTipi = this.state.selectedZoneType;
                              flagZone.baglantiTipi =
                                this.state.selectedZoneConnType + 1;
                              flagZone.giris =
                                this.state.selectedZoneEntryTimer + 1;

                              ApiCall.setZoneSettingsNew(
                                this.state.newClickedZone,
                                flagZone,
                              ).then((x) => {
                                if (x) {
                                  this.setState({
                                    selectedZoneName: '',
                                    selectedZoneType: null,
                                    selectedZoneConnType: null,
                                    selectedZoneEntryTimer: null,
                                    newClickedZone: null,
                                  });
                                }
                                this.getZoneSettings();
                              });
                            } else {
                              Toast.show(langObj.internetConnFail, Toast.LONG);
                            }
                          });
                        }}
                        title={langObj.submit}
                        buttonStyle={{
                          backgroundColor: '#cc1e18',
                          width: 150,
                          marginLeft: 5,
                        }}
                      />
                    </View>
                  )}
                  {this.loading && (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        marginBottom: 5,
                        alignSelf: 'center',
                      }}>
                      <ActivityIndicator animating={true} />
                    </View>
                  )}
                </KeyboardAvoidingView>
              </Modal>
            </ScrollView>
          )}
        </View>
      );
    } else {
      return (
        <ScrollView style={{backgroundColor: 'white', flex: 1}}>
          <DeviceLogin
            loading={this.psd}
            close={() => {
              this.psd = false;
            }}
            back={() => {
              this.props.navigation.goBack();
            }}
          />
          <View style={{flex: 1, marginTop: 5}}>
            {this.renderChild(
              this.ZonName[0] != null ? this.ZonName[0] : langObj.zoneType1,
              0,
            )}
            {this.renderChild(
              this.ZonName[1] != null ? this.ZonName[1] : langObj.zoneType2,
              1,
            )}
            {this.renderChild(
              this.ZonName[2] != null ? this.ZonName[2] : langObj.zoneType3,
              2,
            )}
            {this.renderChild(
              this.ZonName[3] != null ? this.ZonName[3] : langObj.zoneType4,
              3,
            )}
            {this.renderChild(
              this.ZonName[4] != null ? this.ZonName[4] : langObj.zoneType5,
              4,
            )}
            {this.renderChild(
              this.ZonName[5] != null ? this.ZonName[5] : langObj.zoneType6,
              5,
            )}
            {this.renderChild(
              this.ZonName[6] != null ? this.ZonName[6] : langObj.zoneType7,
              6,
            )}
            {this.renderChild(
              this.ZonName[7] != null ? this.ZonName[7] : langObj.zoneType8,
              7,
            )}
            {this.renderChild(langObj.fireZone, 8)}
          </View>
          <Modal
            visible={this.clickedZon != null}
            animationType={'slide'}
            onRequestClose={() => {
              console.log('do nothing!');
            }}
            onShow={() => {
              if (this.clickedZon != 8) {
                this.setState({
                  valueConn:
                    newData.data.zonbilgisi.zon[this.clickedZon].baglantitipi -
                    1,
                });
              }
            }}
            transparent={false}>
            <KeyboardAvoidingView
              style={styles.modalContainer}
              keyboardShouldPersistTaps={'handled'}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 18,
                  color: 'gray',
                }}>
                {this.clickedZon == 8 ? langObj.fireZone : langObj.zoneNameText}
              </Text>
              {this.clickedZon != 8 && (
                <KeyboardAvoidingView style={styles.innerContainer}>
                  <LeftIconButton
                    textColor={'black'}
                    iconname={''}
                    placeholder={
                      this.ZonName[this.clickedZon] != null
                        ? this.ZonName[this.clickedZon]
                        : langObj.phZoneName
                    }
                    type={'ip'}
                    value={
                      this.ZonName[this.clickedZon] != null
                        ? this.ZonName[this.clickedZon]
                        : null
                    }
                    placeholderTextColor={'rgba(0,0,0,0.4)'}
                    onTextChange={(t) => {
                      this.ZonName[this.clickedZon] = t;
                      this.pass = t;
                    }}
                    underlineColor={'black'}
                    maxLength={15}
                  />
                </KeyboardAvoidingView>
              )}
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginTop: 10,
                  fontSize: 18,
                  color: 'gray',
                }}>
                {langObj.selectZoneType}
              </Text>
              <KeyboardAvoidingView style={styles.innerContainer}>
                <View
                  style={{
                    alignItems: 'flex-start',
                    width: '100%',
                    marginLeft: 20,
                    marginTop: 5,
                  }}>
                  {this.clickedZon != 8 && (
                    <RadioForm
                      radio_props={radio_props}
                      initial={
                        this.clickedZon != null
                          ? newData.data.zonbilgisi.zon[this.clickedZon].zontipi
                          : 0
                      }
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        alignItems: 'flex-start',
                      }}
                      wrapStyle={{width: 70, alignSelf: 'flex-start'}}
                      buttonColor={'#cc1e18'}
                      selectedButtonColor={'#cc1e18'}
                      onPress={(value) => {
                        this.setState({value: value});
                      }}
                    />
                  )}
                  {this.clickedZon == 8 && (
                    <RadioForm
                      radio_props={yanginprops}
                      initial={
                        this.clickedZon != null ? newData.data.yanginzontipi : 0
                      }
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        alignItems: 'flex-start',
                      }}
                      wrapStyle={{width: 70, alignSelf: 'flex-start'}}
                      buttonColor={'#cc1e18'}
                      selectedButtonColor={'#cc1e18'}
                      onPress={(value) => {
                        this.setState({value: value});
                      }}
                    />
                  )}
                </View>
              </KeyboardAvoidingView>
            </KeyboardAvoidingView>
            {this.clickedZon != 8 && (
              <View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginTop: 10,
                  }}>
                  {langObj.selectZoneConnectType}
                </Text>
                <View style={styles.innerContainer}>
                  <View
                    style={{
                      alignItems: 'flex-start',
                      width: '100%',
                      marginLeft: 20,
                    }}>
                    <RadioForm
                      radio_props={radio_props1}
                      initial={
                        this.clickedZon != null
                          ? newData.data.zonbilgisi.zon[this.clickedZon]
                              .baglantitipi - 1
                          : 0
                      }
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        alignItems: 'flex-start',
                      }}
                      wrapStyle={{width: 70, alignSelf: 'flex-start'}}
                      buttonColor={'#cc1e18'}
                      selectedButtonColor={'#cc1e18'}
                      onPress={(value) => {
                        this.setState({valueConn: value});
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {!this.loading && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                }}>
                <KeyboardAvoidingView>
                  <Button
                    onPress={() => {
                      NetInfo.fetch().then((state) => {
                        if (state.isConnected) {
                          this.loading = true;
                          if (this.clickedZon < 8) {
                            newData.data.zonbilgisi.zon[
                              this.clickedZon
                            ].zontipi = this.state.value;
                            newData.data.zonbilgisi.zon[
                              this.clickedZon
                            ].baglantitipi = this.state.valueConn + 1;
                            newData.data.yanginzontipi =
                              newData.data.yanginzontipi;
                          } else {
                            newData.data.yanginzontipi = this.state.value;
                          }

                          ApiCall.setZoneSettings(newData.data).then(
                            (x) => {
                              if (x) {
                                global.statusData = newData;
                                ApiCall.getStatus(global.deviceId);
                                this.save();
                                this.loading = false;
                                setTimeout(() => {
                                  this.clickedZon = null;
                                }, 100);
                              } else {
                                this.loading = false;
                              }
                            },
                            (y) => {
                              setTimeout(() => {
                                this.loading = false;
                              }, 5000);
                            },
                          );
                        } else {
                          Toast.show(langObj.internetConnFail, Toast.LONG);
                        }
                      });
                    }}
                    title={langObj.submit}
                    buttonStyle={{
                      backgroundColor: '#cc1e18',
                      width: 100,
                      marginLeft: 10,
                      marginBottom: 10,
                    }}
                  />
                  <Button
                    onPress={() => (this.clickedZon = null)}
                    title={langObj.cancel}
                    buttonStyle={{
                      backgroundColor: '#cc1e18',
                      width: 100,
                      marginLeft: 10,
                    }}
                  />
                </KeyboardAvoidingView>
              </View>
            )}
            {this.loading && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  marginBottom: 5,
                  alignSelf: 'center',
                }}>
                <ActivityIndicator animating={true} />
              </View>
            )}
          </Modal>
        </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    marginTop: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        marginTop: 40,
      },
    }),
  },
  innerContainer: {
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
    backgroundColor: 'whitesmoke',
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
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
      },
    }),
  },
  dropdownBtnStyle: {
    width: '90%',
    height: 32,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  dropdownBtnTxtStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dropdownDropdownStyle: {backgroundColor: '#444'},
  dropdownRowStyle: {
    backgroundColor: '#444',
    borderBottomColor: '#C5C5C5',
    height: 32,
  },
  dropdownRowTxtStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ZoneSettings;
