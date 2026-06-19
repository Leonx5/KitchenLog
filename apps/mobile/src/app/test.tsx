import React from 'react';
import { View, TextInput, Text } from 'react-native';

export default function TestScreen() {
  return (
    <View style={{ flex: 1, padding: 40, justifyContent: 'center' }}>
      <Text>TEXTINPUT TEST</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: 'black',
          padding: 10,
          marginTop: 20,
        }}
        placeholder="Type here"
      />
    </View>
  );
}
