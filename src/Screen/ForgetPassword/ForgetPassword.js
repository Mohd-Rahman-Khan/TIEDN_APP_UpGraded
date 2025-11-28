import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import images from "../../Image";
import styles from "./styles";
import Header from "../../comonent/Header/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../../api/auth";
import api from "../../api/client";

export default function ForgetPassword({ route, navigation }) {
  const [loginId, setloginId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [countryFlag, setCountryFlag] = useState("IN");
  const [isNum, setIsNum] = useState(true);
  const [loginType, setloginType] = useState("");

  const sendOTP = async () => {
    if (loginId) {
      setIsLoading(true);

      let url = `${api.BASE_URL}/auth/send-otp/${loginId}`;

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/vnd.tiedn.ie.api.v1+json",
            Accept: "application/vnd.tiedn.ie.api.v1+json",
          },
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
        console.log("OTPVErify", json);
        setIsLoading(false);
        if (json.code == 200) {
          Alert.alert(
            "Success",
            "OTP sent successfully.",
            [
              {
                text: "OK",
                onPress: async () => {
                  navigation.navigate("VerifyOTP", {
                    type: route?.params?.type,
                    loginId: loginId,
                  });
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
    } else {
      Alert.alert(
        "Oops!",
        "Please enter login Id",
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
        title="Forget Password"
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
        <View style={{ marginTop: 30 }}>
          <Text style={styles.loginid}>Enter Your Id</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: isNum ? "100%" : "100%" }}>
            <TextInput
              placeholder="Enter Your Id"
              value={loginId}
              style={styles.TextInput}
              maxLength={isNum ? 10 : 200}
              onChangeText={(text) => {
                if (!isNaN(text)) {
                  setloginType("mobileNumber");
                  setIsNum(true);
                } else {
                  setloginType("email");
                  setIsNum(false);
                }
                setloginId(text);
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          disabled={isLoading}
          style={[styles.loginBtn, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={() => {
            sendOTP();
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.btnText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
