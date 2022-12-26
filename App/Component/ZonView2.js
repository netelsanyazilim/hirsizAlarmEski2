import React from 'react';
import { View, Text, Dimensions } from 'react-native';

export default function ZonView(props) {
  const { color, text } = props;
  return (
    <View style={{
      backgroundColor: color,
      width: Dimensions.get('window').width * 0.2,
      flexDirection: 'row',
      height: 40,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: color,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 2,
      padding: 2,
      alignItems: 'center', margin: 4, justifyContent: 'center'
    }}>
      <Text style={{
        textAlign: 'center', width: '100%',
        marginLeft: 5, fontSize: 8, fontWeight: '800', marginRight: 5,
        color: color == '#f1c40f' || color == 'white' ? 'black' : 'white'
      }} >
        {text}
      </Text>
    </View>
  )
}