import React, { Component } from "react";
import { StyleSheet, Text, NativeModules, View, BackHandler, Platform } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { CommonActions } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import { Button } from "react-native-elements";
import Toast from 'react-native-simple-toast';
import SharedPrefs from './Utils/SharedPrefs';
import * as TR from './assets/tr.json';
import * as EN from './assets/en.json';

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

class ChooseDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      deviceIds: [],
      deviceId: "",
      deviceName: ""
    };
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

    const a = await SharedPrefs.getlogindata();
    let flagDeviceIds = [];
    let flagDeviceNames = [];
    for (let index = 0; index < a.deviceId.length; index++) {
      flagDeviceIds.push(a.deviceId[index]);
      flagDeviceNames.push(a.deviceName[index]);
    }

    this.setState({ deviceIds: flagDeviceIds, devices: flagDeviceNames });
    this.forceUpdate();
  }

  onBackPress = async () => {
    this.props.navigation.dispatch(
      CommonActions.navigate({
        name: 'LoginScreen'
      })
    );
    setTimeout(() => { }, 500);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.getLanguage();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  render() {
    return (
      <View>
        <View style={{ margin: 10, alignItems: "center" }}>
          <Text style={{ margin: 20, fontWeight: '400', fontSize: 20, textAlign: "center" }} >
            {langObj.chooseDevice}
          </Text>
          <SelectDropdown
            data={this.state.devices}
            onSelect={(selectedItem, index) => {
              this.setState({ deviceId: this.state.deviceIds[index], deviceName: selectedItem });
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
        </View>
        <View style={{ marginBottom: 10, marginTop: 20, width: "100%" }} >
          <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginLeft: 30, marginRight: 30 }} title={langObj.chooseDeviceButton}
            onPress={() => {
              if ((this.state.deviceId != "") && (this.state.deviceName != "")) {
                global.deviceId = this.state.deviceId;
                global.deviceName = this.state.deviceName;
                this.props.navigation.navigate("SettingsTab");
              } else Toast.show(langObj.selectDeviceToCont, Toast.LONG);
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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

export default ChooseDevice;