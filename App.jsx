import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  AppState,
  Platform,
  LogBox,
} from 'react-native';
import AppNavigator from './src/Navigation/RootNavigator';
//import NetInfo from '@react-native-community/netinfo';
import NetworkError from './src/GlobalUtils/NetworkError';
import AppStateListner from './src/GlobalUtils/AppStateListner';
import { Provider } from 'react-redux';
import store from './src/store';
import { initPushHandler } from './src/PushNotification/NotificationConfig';

function App() {
  let [netInfo, setNetInfo] = useState(true);

  useEffect(() => {
    initPushHandler();
  }, []);

  useEffect(() => {
    // const netListner = NetInfo.addEventListener(netstate =>
    //   setNetInfo(netstate.isConnected),
    // );
  }, []);

  const checkConnectivity = () => {
    // NetInfo.fetch().then(netState => {
    //   setNetInfo(netState.isConnected);
    // });
  };
  return (
    <SafeAreaView style={styles.container}>
      {!netInfo ? (
        <NetworkError
        // checkConnectivity={checkConnectivity}
        />
      ) : null}
      <AppStateListner />
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.black
  },
});
