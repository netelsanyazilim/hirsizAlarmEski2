import React, { Component } from 'react';
import { Platform, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import PropTypes from 'prop-types';
import { View } from 'react-native-animatable';
import ApiService from '../Utils/ApiService';
//import SharedPrefs from '../Utils/SharedPrefs';
import { Icon } from "react-native-elements";
import Toast from 'react-native-simple-toast';

var ApiCall = new ApiService();
const IS_ANDROID = Platform.OS === 'android'

export default class LoginDeviceButton extends Component {

    static propTypes = { isEnabled: PropTypes.bool }
    state = { isLoggedin: false, pending: false }

    loginDevice() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                if (!this.state.pending) {
                    this.setState({ pending: true });
                    ApiCall.loginDevice(this.state.pass).then((x) => {
                        if (x) {
                            global.deviceLoggedin = true;
                            //SharedPrefs.saveDevicePass(this.state.pass);
                            this.setState({ isLoggedin: true, pending: false })
                            this.props.onResult(true);
                        }
                        else {
                            global.deviceLoggedin = false;
                            //SharedPrefs.saveDevicePass(null);
                            this.setState({ isLoggedin: false, pending: false })
                            this.props.onResult(false);
                        }
                    });
                }
            }
            else
                Toast.show(langObj.internetConnFail, Toast.LONG);
        });
    }

    render() {
        const { isEnabled, onResult, ...otherProps } = this.props;
        return (
            <View style={styles.container} keyboardShouldPersistTaps="handled">
                <TextInput
                    style={{ margin: 5, width: 100, fontSize: 20, fontWeight: '600' }}
                    textAlign={'center'}
                    autoCapitalize={"none"}
                    autoCorrect={false}
                    value={this.state.pass}
                    onChangeText={(text) => this.setState({ pass: text })}
                    maxLength={4}
                    keyboardType={'numeric'}
                    underlineColorAndroid={"transparent"}
                    placeholder="* * * *"
                    placeholderTextColor={"rgba(0,0,0,0.4)"}
                    selectionColor={"black"}
                    onSubmitEditing={() => this.loginDevice()}
                    returnKeyType={'done'}
                />
                {!this.state.pending && <Icon name={'forward'} color={'black'} size={40}
                    containerStyle={{ width: 40 }}
                    onPress={() => { this.loginDevice(); }} />}
                <View style={styles.loading}>
                    <ActivityIndicator animating={this.state.pending} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 2,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: "center",
        justifyContent: "flex-start",
        borderWidth: 2,
        borderColor: 'gray'
    },
    textInputWrapper: {
        height: 42,
        marginBottom: 2
    },
    textInput: {
        flex: 1,
        color: 'white',
        margin: IS_ANDROID ? -1 : 0,
        height: 42,
        padding: 7
    },
    loading: {
        justifyContent: "center"
    }
});