import React, { Component } from "react";
import {
  StyleSheet, Text, NativeModules, View, Platform,
  TextInput, BackHandler, Alert, SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable, toJS } from "mobx";
import { observer } from "mobx-react";
import { Icon, Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import Spinner from "react-native-spinkit";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';
import { ScrollView } from "react-native-gesture-handler";

var ApiCall = new ApiService();

const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
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
class Phone extends Component {

  @observable Phone = new Array(9);
  @observable newPhone = new Array(40);
  @observable sectionNumbers = new Array(40);
  @observable loading = false;
  @observable psd = !global.deviceLoggedin;
  @observable visibleSpinner = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this._nodes = new Map();
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
  getAllPhone() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.loading = true;
        ApiCall.getPhones().then((x) => {
          let flagDeviceId = global.deviceId;
          let result = flagDeviceId.substring(10).substring(0, 8);
          if (result == "00000000") {
            if (x) {
              let flgPhoneObject = toJS(ApiCall.phoneData);
              let flgPhones = [];
              let flgSectionNumbers = [];
              for (let index = 0; index < flgPhoneObject.length; index++) {
                flgPhones.push(flgPhoneObject[index].phone);
                flgSectionNumbers.push(flgPhoneObject[index].partition);
              }
              this.newPhone = flgPhones;
              this.sectionNumbers = flgSectionNumbers;
              this.loading = false;
              this.visibleSpinner = false;
            }
            else {
              this.loading = false;
              this.visibleSpinner = false;
              Alert.alert(
                langObj.connErr,
                langObj.phoneLoadErr,
                [{ text: langObj.tryAgain, onPress: () => this.getAllPhone() },
                { text: langObj.cancel }],
                { cancelable: false }
              )
            }
          } else {
            if (x) {
              this.Phone = toJS(ApiCall.phoneData);
              this.loading = false;
              this.visibleSpinner = false;
            }
            else {
              this.loading = false;
              this.visibleSpinner = false;
              Alert.alert(
                langObj.connErr,
                langObj.phoneLoadErr,
                [{ text: langObj.tryAgain, onPress: () => this.getAllPhone() },
                { text: langObj.cancel }],
                { cancelable: false }
              )
            }
          }
        });
      }
      else {
        this.visibleSpinner = false;
        Toast.show(langObj.internetConnFail, Toast.LONG);
        this.props.navigation.dispatch(
          CommonActions.navigate({
            name: 'SettingsTab'
          })
        );
      }
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

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.getLanguage();
    this.getAllPhone();
  }

  @action
  setPhone() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);
    if (result == "00000000") {
      let p = [];
      p.push(...this.newPhone);
      for (let i = 0; i < 40; i++) {
        if (p[i].length == 0)
          p[i] = 'FFFFFFFFFFFFFF';
        else if (p[i].length < 14) {
          p[i] = p[i] + new Array((15 - this.newPhone[i].length)).join('f');
        }
      }

      NetInfo.fetch().then(state => {
        if (state.isConnected)
          ApiCall.setPhonesNew(p, this.sectionNumbers);
        else
          Toast.show(langObj.internetConnFail, Toast.LONG);
      });
    } else {
      let p = [];
      p.push(...this.Phone);
      for (let i = 0; i < 9; i++) {
        if (p[i].length == 0)
          p[i] = 'FFFFFFFFFFFF';
        else if (p[i].length < 12) {
          p[i] = p[i] + new Array((13 - this.Phone[i].length)).join('f')
        }
      }

      NetInfo.fetch().then(state => {
        if (state.isConnected)
          ApiCall.setPhones(p);
        else
          Toast.show(langObj.internetConnFail, Toast.LONG);
      });
    }
  }

  renderChild(title, v, i) {
    return (
      <View >
        <View style={{
          flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%",
          justifyContent: "space-between"
        }}
        >
          <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>{title}</Text>
        </View>
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
          borderColor: "gainsboro", borderBottomWidth: 1
        }}>
          <Icon containerStyle={{ width: 40, margin: 10 }} name="phone" type="font-awesome" color="#cc1e18" size={30} />
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.Phone[i] = text}
            autoCapitalize={"none"}
            value={this.Phone[i] == undefined ? this.Phone[i] : this.Phone[i].replace(/[#f]/g, '')}
            maxLength={12}
            autoCorrect={false}
            placeholder={langObj.phPhone}
            underlineColorAndroid={"black"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            keyboardType={'numeric'}
            selectionColor={"black"}
            returnKeyType={'done'}
            //ref={(ref) => current = ref}
            // ref={c => this._nodes.set(i, c)}
            //onSubmitEditing={() => i < 8 ? this._nodes.get(i + 1).focus() : this.setPhone()}
            onSubmitEditing={() => this.setPhone()}
          />
        </View>
      </View>
    );
  }

  renderChildNew(i) {
    return (
      <View >
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
          borderColor: "gainsboro", borderBottomWidth: 1
        }}>
          <Icon containerStyle={{ width: 40, margin: 5 }} name="phone" type="font-awesome" color="#cc1e18" size={30} />
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.newPhone[i] = text}
            autoCapitalize={"none"}
            value={this.newPhone[i] == undefined ? this.newPhone[i] : this.newPhone[i].replace(/[#f]/g, '')}
            maxLength={14}
            autoCorrect={false}
            placeholder={langObj.phPhone + " " + (i + 1)}
            underlineColorAndroid={"black"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            keyboardType={'numeric'}
            selectionColor={"black"}
            returnKeyType={'done'}
            onSubmitEditing={() => this.setPhone()}
          />
        </View>
      </View>
    );
  }

  render() {
    let flagDeviceId = global.deviceId;
    let result = flagDeviceId.substring(10).substring(0, 8);
    if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

    if (result == "00000000") {
      return (
        <View style={{ flex: 1 }}>
          <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
          {this.visibleSpinner &&
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
              <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
              <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
            </View>
          }

          {/* {!this.visibleSpinner && <View>
            <KeyboardAwareScrollView enableOnAndroid={true} style={{ marginTop: 5, backgroundColor: "white" }}>
              {this.renderChildNew(0)}
              {this.renderChildNew(1)}
              {this.renderChildNew(2)}
              {this.renderChildNew(3)}
              {this.renderChildNew(4)}
              {this.renderChildNew(5)}
              {this.renderChildNew(6)}
              {this.renderChildNew(7)}
              {this.renderChildNew(8)}
              {this.renderChildNew(9)}
              {this.renderChildNew(10)}
              {this.renderChildNew(11)}
              {this.renderChildNew(12)}
              {this.renderChildNew(13)}
              {this.renderChildNew(14)}
              {this.renderChildNew(15)}
              {this.renderChildNew(16)}
              {this.renderChildNew(17)}
              {this.renderChildNew(18)}
              {this.renderChildNew(19)}
              {this.renderChildNew(20)}
              {this.renderChildNew(21)}
              {this.renderChildNew(22)}
              {this.renderChildNew(23)}
              {this.renderChildNew(24)}
              {this.renderChildNew(25)}
              {this.renderChildNew(26)}
              {this.renderChildNew(27)}
              {this.renderChildNew(28)}
              {this.renderChildNew(29)}
              {this.renderChildNew(30)}
              {this.renderChildNew(31)}
              {this.renderChildNew(32)}
              {this.renderChildNew(33)}
              {this.renderChildNew(34)}
              {this.renderChildNew(35)}
              {this.renderChildNew(36)}
              {this.renderChildNew(37)}
              {this.renderChildNew(38)}
              {this.renderChildNew(39)}
              <View style={{ height: 80 }} ></View>
            </KeyboardAwareScrollView>
            <View style={{
              position: "absolute", display: "flex", bottom: 0, right: 0,
              left: 0, height: 80, borderColor: "red", borderTopWidth: 2, backgroundColor: "white"
            }}>
              <Button
                disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                title={langObj.submit} onPress={() => {
                  click();
                  this.forceUpdate();
                  this.setPhone();
                  setTimeout(() => {
                    click();
                    this.forceUpdate();
                  }, 3000);
                }}
              />
            </View>
          </View>} */}

          {!this.visibleSpinner && <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={"padding"}
              
              style={{ flex: 1 }}>
              <SafeAreaView>
                <ScrollView>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{marginTop: 35}} >
                      <DeviceLogin loading={this.psd} close={() => { this.psd = false; ApiCall.getPhones().then((x) => { this.Phone = ApiCall.phoneData }); }} back={() => { this.props.navigation.goBack(); }} />
                      {this.renderChildNew(0)}
                      {this.renderChildNew(1)}
                      {this.renderChildNew(2)}
                      {this.renderChildNew(3)}
                      {this.renderChildNew(4)}
                      {this.renderChildNew(5)}
                      {this.renderChildNew(6)}
                      {this.renderChildNew(7)}
                      {this.renderChildNew(8)}
                      {this.renderChildNew(9)}
                      {this.renderChildNew(10)}
                      {this.renderChildNew(11)}
                      {this.renderChildNew(12)}
                      {this.renderChildNew(13)}
                      {this.renderChildNew(14)}
                      {this.renderChildNew(15)}
                      {this.renderChildNew(16)}
                      {this.renderChildNew(17)}
                      {this.renderChildNew(18)}
                      {this.renderChildNew(19)}
                      {this.renderChildNew(20)}
                      {this.renderChildNew(21)}
                      {this.renderChildNew(22)}
                      {this.renderChildNew(23)}
                      {this.renderChildNew(24)}
                      {this.renderChildNew(25)}
                      {this.renderChildNew(26)}
                      {this.renderChildNew(27)}
                      {this.renderChildNew(28)}
                      {this.renderChildNew(29)}
                      {this.renderChildNew(30)}
                      {this.renderChildNew(31)}
                      {this.renderChildNew(32)}
                      {this.renderChildNew(33)}
                      {this.renderChildNew(34)}
                      {this.renderChildNew(35)}
                      {this.renderChildNew(36)}
                      {this.renderChildNew(37)}
                      {this.renderChildNew(38)}
                      {this.renderChildNew(39)}


                      <Button
                        disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                        title={langObj.submit} onPress={() => {
                          click();
                          this.forceUpdate();
                          this.setPhone();
                          setTimeout(() => {
                            click();
                            this.forceUpdate();
                          }, 3000);
                        }}
                      />
                      <View style={{ marginTop: 75 }}>

                      </View>


                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </View>}



        </View>
      );
    }
    //langObj.fetchingData
    else {
      return (
        <View style={{ flex: 1 }}>
          {this.visibleSpinner &&
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
              <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
              <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
            </View>}

          {!this.visibleSpinner &&
            // <View style={{ flex: 1 }}>
            //   <SafeAreaView style={{ flex: 1 }} >
            //     <KeyboardAwareScrollView extraHeight={80} enableOnAndroid={false} style={{ backgroundColor: "white" }}>
            //       <DeviceLogin loading={this.psd} close={() => { this.psd = false; ApiCall.getPhones().then((x) => { this.Phone = ApiCall.phoneData }); }} back={() => { this.props.navigation.goBack(); }} />
            //       {this.renderChild(langObj.phone1, ApiCall.phoneData[0], 0)}
            //       {this.renderChild(langObj.phone2, ApiCall.phoneData[1], 1)}
            //       {this.renderChild(langObj.phone3, ApiCall.phoneData[2], 2)}
            //       {this.renderChild(langObj.phone4, ApiCall.phoneData[3], 3)}
            //       {this.renderChild(langObj.phone5, ApiCall.phoneData[4], 4)}
            //       {this.renderChild(langObj.phone6, ApiCall.phoneData[5], 5)}
            //       {this.renderChild(langObj.phone7, ApiCall.phoneData[6], 6)}
            //       {this.renderChild(langObj.phone8, ApiCall.phoneData[7], 7)}
            //       {this.renderChild(langObj.phone9, ApiCall.phoneData[8], 8)}
            //       <View style={{ height: 10 }} />

            //     </KeyboardAwareScrollView>
            //   </SafeAreaView>


            //   <View style={{ height: 80 }} ></View>
            //   <View style={{
            //     position: "absolute", display: "flex", bottom: 0, right: 0,
            //     left: 0, height: 80, borderColor: "red", borderTopWidth: 2, backgroundColor: "white"
            //   }} >

            //     <Button
            //       disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
            //       title={langObj.submit} onPress={() => {
            //         click();
            //         this.forceUpdate();
            //         this.setPhone();
            //         setTimeout(() => {
            //           click();
            //           this.forceUpdate();
            //         }, 3000);
            //       }}
            //     />

            //   </View>



            // </View>
            <View style={{ flex: 1 }}>
              <KeyboardAvoidingView
                behavior={"padding"}
                keyboardVerticalOffset={keyboardVerticalOffset}
                style={{ flex: 1 }}>
                <SafeAreaView>
                  <ScrollView>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View >
                        <DeviceLogin loading={this.psd} close={() => { this.psd = false; ApiCall.getPhones().then((x) => { this.Phone = ApiCall.phoneData }); }} back={() => { this.props.navigation.goBack(); }} />
                        {this.renderChild(langObj.phone1, ApiCall.phoneData[0], 0)}
                        {this.renderChild(langObj.phone2, ApiCall.phoneData[1], 1)}
                        {this.renderChild(langObj.phone3, ApiCall.phoneData[2], 2)}
                        {this.renderChild(langObj.phone4, ApiCall.phoneData[3], 3)}
                        {this.renderChild(langObj.phone5, ApiCall.phoneData[4], 4)}
                        {this.renderChild(langObj.phone6, ApiCall.phoneData[5], 5)}
                        {this.renderChild(langObj.phone7, ApiCall.phoneData[6], 6)}
                        {this.renderChild(langObj.phone8, ApiCall.phoneData[7], 7)}
                        {this.renderChild(langObj.phone9, ApiCall.phoneData[8], 8)}


                        <Button
                          disabled={enable} borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                          title={langObj.submit} onPress={() => {
                            click();
                            this.forceUpdate();
                            this.setPhone();
                            setTimeout(() => {
                              click();
                              this.forceUpdate();
                            }, 3000);
                          }}
                        />
                        <View style={{ marginTop: 75 }}>

                        </View>


                      </View>
                    </TouchableWithoutFeedback>
                  </ScrollView>
                </SafeAreaView>
              </KeyboardAvoidingView>
            </View>


          }
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around"
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white"
  },
  innerContainer: {
    alignItems: "center"
  },
  textContainer: {
    borderBottomWidth: 2,
    borderColor: 'gray',
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  textInput: {
    marginLeft: 10,
    margin: 5,
    flex: 1,
    marginRight: 20,
    fontSize: 17,
    ...Platform.select({
      ios: {
        borderBottomWidth: 2,
        borderBottomColor: "gray",
        marginBottom: 20,
        marginTop: 20
      }
    }),
  }
});

export default Phone;