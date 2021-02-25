import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProgressCircle from 'react-native-progress-circle';
import colors from '../config/colors';
import messaging from '@react-native-firebase/messaging';
import {NeuView} from 'react-native-neu-element';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {BASE_URL, getKey} from '../helpers/user';
import base64 from 'react-native-base64';

import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({route, navigation}) => {
  const [didMount, setDidMount] = useState(false);
  const [shopIDState, setShopIDState] = useState(false);
  const [ShopId, setShopId] = useState('');
  const [doorName, setDoorName] = useState('');
  const [limit, setLimit] = useState('');
  const [currentLimit, setCurrentLimit] = useState('');
  const [perVal, setPerVal] = useState(0);
  const [circleColor, setCircleColor] = useState('#32a852');

  useEffect(() => {
    setDidMount(true);
    const fetchData = async () => {
      let key = await getKey();
      if (!key) {
        navigation.navigate('Home');
      } else {
        getDetails();
        const token = await messaging().getToken();
        console.log('key :' + key);
        let headers = new Headers();
        headers.append(
          'Authorization',
          'Basic ' + base64.encode('apiuser:a22323212'),
        );
        headers.append('Content-Type', 'application/json');
        fetch(`${BASE_URL}/addOrUpdateGuardNotifications`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            deviceToken: token.toString(),
            deviceType: Platform.OS,
            guardKey: key.toString(),
            notify: true,
          }),
        })
          .then((response) => response.json())
          .then(async (json) => {
            console.log('Notification response =======', json);
            console.log('Token =============', token);
          });

        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
          console.log(remoteMessage);
          message_body = JSON.stringify(remoteMessage.notification.body);
          Alert.alert('A new FCM message arrived!', message_body);
        });

        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
          console.log('Message handled in the background!', remoteMessage);
        });

        const subscriber = firestore()
          .collection('Shops')
          .doc(route.params.ShopId.toString())
          .onSnapshot((documentSnapshot) => {
            setCurrentLimit(documentSnapshot.data().depotCurrentLimit);
            setLimit(documentSnapshot.data().depotLimit);
            console.log('Shop Details : ', documentSnapshot.data());
            calculatePercent(
              documentSnapshot.data().depotCurrentLimit,
              documentSnapshot.data().depotLimit,
            );
          });

        return () => {
          subscriber();
          unsubscribe;
          setDidMount(false);
        };

        // return unsubscribe;
      }
    };
    fetchData();
  }, []);

  const updateFirestore = (depotCurrentLimit, depotLimit, shopid) => {
    firestore().collection('Shops').doc(shopid).update({
      depotCurrentLimit: depotCurrentLimit,
      depotLimit: depotLimit,
    });
  };

  const getDetails = async () => {
    let headers = new Headers();
    headers.append(
      'Authorization',
      'Basic ' + base64.encode('apiuser:a22323212'),
    );
    if (!key) {
      navigation.navigate('Home');
    }
    let key = await getKey();

    headers.append('Content-Type', 'application/json');
    fetch(`${BASE_URL}/findDetails/${key}`, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          navigation.navigate('Home');
        }
        console.log(json.guard.notAllowReason);
        json.guard.notAllowReason != null
          ? Alert.alert(json.guard.notAllowReason)
          : null;
        setCurrentLimit(json.depotCurrentLimit);
        setLimit(json.depotLimit);
        setDoorName(json.guard.name);
        setShopId(route.params.ShopId);
        calculatePercent(json.depotCurrentLimit, json.depotLimit);
        updateFirestore(
          json.depotCurrentLimit,
          json.depotLimit,
          route.params.ShopId,
        );
      });
  };

  const addOne = async () => {
    console.log('Add one');
    let headers = new Headers();
    headers.append(
      'Authorization',
      'Basic ' + base64.encode('apiuser:a22323212'),
    );
    headers.append('Content-Type', 'application/json');
    let key = await getKey();
    console.log('MY KEY =============', key);

    fetch(`${BASE_URL}/plusOne/${key}`, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        // setMessage('Person was let in, recorded successfully');
        setCurrentLimit(json.depotCurrentLimit);
        setLimit(json.depotLimit);
        updateFirestore(json.depotCurrentLimit, json.depotLimit, ShopId);
        calculatePercent(json.depotCurrentLimit, json.depotLimit);
        // if (!json.allowPerson) {
        //   setMessage(json.notAllowReason);
        // }
      })
      .catch((error) => alert(error));
  };

  const minusOne = async () => {
    console.log('minus one');
    let headers = new Headers();
    headers.append(
      'Authorization',
      'Basic ' + base64.encode('apiuser:a22323212'),
    );
    headers.append('Content-Type', 'application/json');
    let key = await getKey();
    fetch(`${BASE_URL}/minusOne/${key}`, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        // setMessage('Person was let out, recorded successfully');
        setCurrentLimit(json.depotCurrentLimit);
        setLimit(json.depotLimit);
        updateFirestore(json.depotCurrentLimit, json.depotLimit, ShopId);
        calculatePercent(json.depotCurrentLimit, json.depotLimit);
      })
      .catch((error) => alert(error));
  };

  const calculatePercent = (currentLimit, limit) => {
    percentage_val = (currentLimit * 100) / limit;
    setPerVal(percentage_val);
    if (percentage_val >= 33 && percentage_val < 66) {
      setCircleColor('#d6d306');
    } else if (percentage_val >= 66 && percentage_val <= 100) {
      setCircleColor('#d61706');
    } else {
      setCircleColor('#32a852');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <Text
          style={[
            styles.welcomeText,
            {color: currentLimit < 29 ? 'green' : '#D61500'},
          ]}>
          {currentLimit < 29 ? 'Welcome' : 'Please wait'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={styles.messageText}>
            {currentLimit < 29
              ? 'Please come in, we are open for business'
              : 'Hang on!  Shop is currently full.'}
          </Text>
        </View>
        {/* ProgressBar */}
        <View style={styles.progressBarContainer}>
          <NeuView
            color="#eef2f9"
            height={450}
            width={450}
            borderRadius={50 / 2}>
            <ProgressCircle
              percent={perVal}
              radius={200}
              borderWidth={8}
              color="#0B3684"
              shadowColor="#e6e1f0"
              bgColor={circleColor}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>
                  {currentLimit}/{limit}
                </Text>
              </View>
            </ProgressCircle>
          </NeuView>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Developed by : www.Acesoft.ca</Text>
          <Text style={styles.detailsText}>
            Would like you automate your shop? Call 519-808-1000
          </Text>
        </View>
        <View style={styles.settingsButtonContainer}>
          <NeuView color="#eef2f9" height={75} width={75} borderRadius={50}>
            <MaterialIcons
              name="settings"
              size={50}
              color="rgba(0,0,0,0.5)"
              onPress={() => navigation.navigate('Settings', {ShopId: ShopId})}
            />
          </NeuView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#EEF2F9',
  },

  progressBarContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  progressTextContainer: {
    backgroundColor: '#274099',
    height: 250,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 250 / 2,
  },
  progressText: {
    fontSize: 55,
    color: colors.primary,
  },

  settingsButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  welcomeText: {
    alignSelf: 'center',
    marginTop: -80,
    fontSize: 70,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 35,
    marginTop: 50,
    letterSpacing: 0.5,
    color: 'rgba(0,0,0,0.75)',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 20,
    marginVertical: 2,
  },
});

export default HomeScreen;
