import React, {useEffect, useState, useRef} from 'react';
import {AppState, Platform, NativeModules} from 'react-native';

export default AppStateListener = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  return null;
};
