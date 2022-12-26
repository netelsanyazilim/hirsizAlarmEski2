import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements';

export default function OptItem(props) {
  const { title, iconname, subtitle, onPress, disabled } = props;
  const color = 'rgba(0,0,0,0.4)';
  return (
    <View style={{
      alignItems: 'center', height: 80
    }}>
      <TouchableOpacity disabled={disabled} onPress={onPress} style={{ flexDirection: 'row', }} >
        <View style={{ flex: 0.2, alignItems: 'center' }} >
          <Icon
            containerStyle={{ marginTop: 10, width: 40 }}
            name={iconname}
            size={40}
            color="#cc1e18"
          />
        </View>
        <View style={{ flex: 0.8 }} >
          <Text style={{ marginTop: 5, fontSize: 19 }}>{title}</Text>
          <Text style={{ marginTop: 5, color: color, fontSize: 15 }}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}