import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.shoppercounter.com/clutch/api/guard';
// export const getKey = () => {
//   _storeData();
//   console.log(AsyncStorage.getItem('key'));
//   return AsyncStorage.getItem('key');
// };

export const getKey = async () => {
  return await AsyncStorage.getItem('key');
};

export const logOut = async () => {
  return await AsyncStorage.removeItem('key');
};
