import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import Header from "../../comonent/Header/Header";
import images from "../../Image";
import styles from "./styles";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/client";

export default function ResetPassword({ route, navigation }) {
  const [newPassword, setnewPassword] = useState("");
  const [verifyPassword, setverifyPassword] = useState("");
  const [oldPassword, setoldPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("InExToken");

    let sendingData;
    let url;

    if (route?.params?.type == "profile") {
      sendingData = {
        login_id: route?.params?.loginId,
        password: newPassword,
        old_login_id: oldPassword,
      };
      url = `${api.BASE_URL}/auth/reset-password`;
    } else {
      sendingData = {
        login_id: route?.params?.loginId,
        password: newPassword,
      };
      url = `${api.BASE_URL}/auth/forget-password`;
    }

    console.log("sendingData", sendingData);
    console.log("sendingData", url);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/vnd.tiedn.ie.api.v1+json",
          Accept: "application/vnd.tiedn.ie.api.v1+json",
          Authorization: token ? "Bearer " + token : null,
          // Authorization:
          //   'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIwNjY3NjYiLCJleHAiOjc3MzI2ODIyODM5ODksImlhdCI6MTc0MTE1NDc4OX0.F5dWVSyI5BXvig4BMC94W6acsqhtttwN7LWCjaGaOR1xUzKJjOyS2uuQ6y_16QtIcb46MKydl-hbf6EtRLcSdQ',
        },
        body: JSON.stringify(sendingData),
        method: "POST",
      });
      if (!response.ok) {
        setIsLoading(false);
        Alert.alert(
          "Oops",
          "Server error",
          [
            {
              text: "OK",
              onPress: async () => {},
            },
          ],
          { cancelable: false }
        );
        return;
      }

      const json = await response.json();
      setIsLoading(false);
      console.log("OTPVErify", json);
      if (json.code == 200) {
        Alert.alert(
          "Success",
          "Password reset successfully.",
          [
            {
              text: "OK",
              onPress: async () => {
                if (route?.params?.type == "profile") {
                  navigation.navigate("Profile");
                } else {
                  navigation.navigate("Login");
                }
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Oops",
          json.message,
          [
            {
              text: "OK",
              onPress: async () => {},
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Oops",
        "Server error",
        [
          {
            text: "OK",
            onPress: async () => {},
          },
        ],
        { cancelable: false }
      );
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Reset Password"
        onPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView
        style={{ marginHorizontal: 25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Image source={images.logo} style={styles.logodesign} />
        </View>
        {route?.params?.type == "profile" ? (
          <>
            <View style={{ marginTop: 30 }}>
              <Text style={styles.loginid}>Old Password</Text>
            </View>
            <View>
              <TextInput
                placeholder="Enter Old Password"
                value={oldPassword}
                style={styles.TextInput}
                onChangeText={(text) => {
                  setoldPassword(text);
                }}
              />
            </View>
          </>
        ) : null}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.loginid}>New Password</Text>
        </View>
        <View>
          <TextInput
            placeholder="Enter New Password"
            value={newPassword}
            style={styles.TextInput}
            onChangeText={(text) => {
              setnewPassword(text);
            }}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.loginid}>Verify Password</Text>
        </View>
        <View>
          <TextInput
            placeholder="Verify Password"
            value={verifyPassword}
            style={styles.TextInput}
            onChangeText={(text) => {
              setverifyPassword(text);
            }}
          />
        </View>
        <TouchableOpacity
          disabled={isLoading}
          style={[styles.loginBtn, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={() => {
            if (newPassword == "" || verifyPassword == "") {
              Alert.alert(
                "Oops",
                "Please enter Password",
                [
                  {
                    text: "OK",
                    onPress: async () => {},
                  },
                ],
                { cancelable: false }
              );
            } else {
              if (newPassword == verifyPassword) {
                resetPassword();
              } else {
                Alert.alert(
                  "Oops",
                  "New password and verify password are not same.",
                  [
                    {
                      text: "OK",
                      onPress: async () => {},
                    },
                  ],
                  { cancelable: false }
                );
              }
            }
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.btnText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
