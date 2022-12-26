import AsyncStorage from '@react-native-async-storage/async-storage';
let publictab = "dsdsd";
class SharedPrefs {

  async saveloginData(mail, token, pass, name, deviceId, deviceName, notifSettings) {
    let login = {
      token: token,
      mail: mail,
      name: name,
      pass: pass,
      deviceId: deviceId,
      deviceName: deviceName,
      notifSettings: notifSettings,
    };
    await AsyncStorage.setItem('@login', JSON.stringify(login));
  }


  async settingsTab(tab) {
    publictab = tab;
  }

  async getsettingsTab() {
    return "publictab";
  }

  async saveNotifSettings(notifSettings) {
    const values = await AsyncStorage.getItem('@login');
    let value = JSON.parse(values);
    let login = {
      token: value.token,
      mail: value.mail,
      name: value.name,
      deviceId: value.deviceId,
      deviceName: value.deviceName,
      notifSettings: notifSettings,
    };
    await AsyncStorage.setItem('@login', JSON.stringify(login));
  }

  async saveDeviceId(dID, deviceName) {
    const values = await AsyncStorage.getItem('@login');
    let value = JSON.parse(values);
    let flagDeviceIds = [];
    let flagDeviceNames = [];

    if (value.deviceId != undefined && value.deviceId != null && value.deviceId.length > 0) {
      flagDeviceIds = value.deviceId;
    }
    flagDeviceIds.push(dID);

    if (value.deviceName != undefined && value.deviceName != null && value.deviceName.length > 0) {
      flagDeviceNames = value.deviceName;
    }
    flagDeviceNames.push(deviceName);

    let login = {
      token: value.token,
      pass: value.pass,
      mail: value.mail,
      name: value.name,
      deviceId: flagDeviceIds,
      deviceName: flagDeviceNames,
      notifSettings: value.notifSettings,
    };

    await AsyncStorage.setItem('@login', JSON.stringify(login));
  }

  async removeDeviceId(deviceId) {
    const values = await AsyncStorage.getItem('@login');
    let value = JSON.parse(values);
    let flagDevices = [];
    let flagDeviceNames = [];

    if (value.deviceId.length > 1) {
      const indexDevice = value.deviceId.indexOf(deviceId);
      if (indexDevice > -1) {
        value.deviceId.splice(indexDevice, 1);
        value.deviceName.splice(indexDevice, 1);
        flagDevices = value.deviceId;
        flagDeviceNames = value.deviceName;
      }
    }
    else {
      flagDevices = [];
      flagDeviceNames = [];
    }

    let login = {
      token: value.token,
      pass: value.pass,
      mail: value.mail,
      name: value.name,
      deviceId: flagDevices,
      deviceName: flagDeviceNames,
      notifSettings: value.notifSettings,
    };

    global.deviceLoggedin = false;
    global.statusData = undefined;
    //await AsyncStorage.removeItem('@devicePass');
    await AsyncStorage.setItem('@login', JSON.stringify(login));
    return login;
  }

  async saveLang(langCode) {
    await AsyncStorage.setItem('@langCode', langCode);
  }

  async getLang() {
    const langCode = await AsyncStorage.getItem('@langCode');
    return langCode;
  }

  async getlogindata() {
    const value = await AsyncStorage.getItem('@login');
    if (value !== null) {
      return JSON.parse(value);
    }
  }

  /**
   * @param {string} zon zon id. {Zon1,Zon2,Zon3,Zon4,Zon5,Zon6,Zon7,Zon8,Zon9}
   * @param {string} zon new name
   */
  async saveZon(zon, value) {
    await AsyncStorage.setItem('@' + zon, value);
  }

  async getAllZon() {
    let promises = [];
    for (let i = 1; i < 10; i++) {
      let getter = await AsyncStorage.getItem('@Zon' + i);
      promises.push(getter);
    }
    return Promise.all(promises).then(
      (v) => {
        return v;
      },
      (reason) => {
        console.log(reason);
      },
    );
  }

  async saveDevicePass(pass) {
    await AsyncStorage.setItem('@devicePass', pass);
  }

  async removeDevicePass() {
    await AsyncStorage.removeItem('@devicePass');
  }

  async getDevicePass() {
    const dPass = await AsyncStorage.getItem('@devicePass');
    return dPass;
  }

  async saveDeviceName(deviceName) {
    const values = await AsyncStorage.getItem('@deviceName1');
    let value = JSON.parse(values);
    let flagDeviceNames = [];

    if (value != undefined && value != null && value.length > 0) {
      flagDeviceNames = value;
    }

    flagDeviceNames.push(deviceName);

    await AsyncStorage.setItem('@deviceName1', JSON.stringify(flagDeviceNames));
  }

  // async changeDeviceName(oldDeviceName, deviceName) {
  //   const values = await AsyncStorage.getItem('@deviceName1');
  //   let value = JSON.parse(values);
  //   let flagDeviceNames = [];

  //   if (value != undefined && value != null && value.length > 0) {
  //     flagDeviceNames = value;
  //     const indexDevice = value.indexOf(oldDeviceName);
  //     if (indexDevice > -1) {
  //       flagDeviceNames[indexDevice] = deviceName;
  //     }
  //   }

  //   global.deviceName = deviceName;
  //   await AsyncStorage.setItem('@deviceName1', JSON.stringify(flagDeviceNames));
  // }

  // async removeDeviceName(deviceName) {
  //   const values = await AsyncStorage.getItem('@deviceName1');
  //   let value = JSON.parse(values);
  //   let flagDeviceNames = [];

  //   if (value.length > 1) {
  //     const indexDevice = value.indexOf(deviceName);
  //     console.log(indexDevice);
  //     if (indexDevice > -1) {
  //       flagDeviceNames = value.splice(index, 1);
  //       console.log(flagDeviceNames);
  //     }
  //   }
  //   else
  //     flagDeviceNames = [];

  //   await AsyncStorage.setItem('@deviceName1', JSON.stringify(flagDeviceNames));
  // }

  // async getDeviceName() {
  //   const value = await AsyncStorage.getItem('@deviceName1');
  //   if (value !== null) {
  //     return JSON.parse(value);
  //   }
  // }
}

export default new SharedPrefs();
