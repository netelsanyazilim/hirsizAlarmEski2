import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements';
import FontAwesome from "react-native-vector-icons/MaterialCommunityIcons";
import Fontisto from "react-native-vector-icons/Fontisto";


export default function OptItem(props) {

    const { title, iconname, subtitle, onPress, disabled } = props;
    const color = 'rgba(0,0,0,0.4)';
    return (
        <View style={{
            alignItems: 'center', height: 80
        }}>
            <TouchableOpacity disabled={disabled} onPress={onPress} style={{ flexDirection: 'row', }} >
                <View style={{ flex: 0.2, alignItems: 'center' }}  >
                    {iconname == "magnet" && <Fontisto
                        containerStyle={{ marginTop: 10, width: 40 }}
                        name={iconname}
                        size={40}
                        color="#cc1e18"
                    />}

                    {iconname != "magnet" && <FontAwesome
                        containerStyle={{ marginTop: 10, width: 40 }}
                        name={iconname}
                        size={40}
                        color="#cc1e18"
                    />}

                </View>
                <View style={{ flex: 0.8 }} >
                    <Text style={{ marginTop: 5, fontSize: 19 }}>{title}</Text>
                    <Text style={{ marginTop: 5, color: color, fontSize: 15 }}>{subtitle}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}