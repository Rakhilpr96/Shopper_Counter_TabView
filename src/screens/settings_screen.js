import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, SafeAreaView} from 'react-native';
import colors from '../config/colors';
import LinearGradient from 'react-native-linear-gradient';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {BASE_URL, getKey, logOut} from '../helpers/user';
import base64 from 'react-native-base64';

const SettingsScreen = ({route, navigation}) => {
  const [ShopId, setShopId] = useState('');
  const [doorName, setDoorName] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    getDetails();
  }, []);

  async function getDetails() {
    let headers = new Headers();
    headers.append(
      'Authorization',
      'Basic ' + base64.encode('apiuser:a22323212'),
    );
    let key = await getKey();
    console.log('MY KEY =====', key);
    headers.append('Content-Type', 'application/json');
    fetch(`${BASE_URL}/findDetails/${key}`, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        // setCurrentLimit(json.depotCurrentLimit);
        setLimit(json.depotLimit);
        setDoorName(json.guard.name);
        setShopId(route.params.ShopId);
      });
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <LinearGradient
        colors={['#A5FECB', '#20BDFF', '#5433FF']}
        style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            style={{
              height: '100%',
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}
            android_ripple={{color: 'rgba(0,0,0,0.05)'}}
            onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="arrow-back"
              size={30}
              color={colors.secondary}
            />
          </Pressable>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardText}>Door Name : {doorName}</Text>
          <Text style={styles.cardText}>Shop ID : {ShopId}</Text>
          <Text style={styles.cardText}>Allowed Limit : {limit}</Text>
        </View>

        <View style={styles.logoutButtonContainer}>
          <Pressable
            style={styles.logoutButton}
            android_ripple={{color: 'rgba(0,0,0,0.1)'}}
            onPress={() => {
              logOut();
              navigation.navigate('Login');
            }}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    // justifyContent: 'center',
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    height: 55,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 80,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 40,
    letterSpacing: 1,
  },
  logoutButtonContainer: {
    marginTop: 100,
  },
  logoutButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: colors.primary,
  },
});

export default SettingsScreen;
