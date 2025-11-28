import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import React, { useEffect } from "react";
import Header from "../../comonent/Header/Header";
import images from "../../Image";
import styles from "./styles";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../../api/auth";
import api from "../../api/client";

export default function VerifyOTP({ route, navigation }) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [count, setcount] = useState(20);
  const [timerStart, settimerStart] = useState(true);
  const [showbutton, setshowbutton] = useState(true);
  let interval;

  // useEffect(() => {
  //   if (count > 0) {
  //     setshowbutton(true);
  //     interval = setInterval(() => {
  //       console.log("timerStart", "ok");
  //       setcount((prev) => prev - 1);
  //     }, 1000);
  //   } else {
  //     setshowbutton(false);
  //     settimerStart(false);
  //     clearInterval(interval);
  //   }

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [count, timerStart]);

  const verifyOTP = async () => {
    setIsLoading(true);

    let url = `${api.BASE_URL}/auth/otp-validate/${code}/${route?.params?.loginId}`;

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
      }

      const json = await response.json();
      setIsLoading(false);
      console.log("OTPVErify", json);
      if (json.code == 200) {
        if (json.data == "true" || json.data == true) {
          Alert.alert(
            "Success",
            "OTP Verify successfully.",
            [
              {
                text: "OK",
                onPress: async () => {
                  //navigation.navigate('ResetPassword');
                  navigation.navigate("ResetPassword", {
                    type: route?.params?.type,
                    loginId: route?.params?.loginId,
                  });
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "Oops",
            "Invalid OTP",
            [
              {
                text: "OK",
              },
            ],
            { cancelable: false }
          );
        }
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

  const resendOTP = async () => {
    let url = `${api.BASE_URL}/auth/send-otp/${route?.params?.loginId}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/vnd.tiedn.ie.api.v1+json",
          Accept: "application/vnd.tiedn.ie.api.v1+json",
        },
      });
      if (!response.ok) {
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

      if (json.code == 200) {
        settimerStart(true);
        setcount(20);
        Alert.alert(
          "Success",
          "OTP sent successfully.",
          [
            {
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      } else {
        settimerStart(true);
        setcount(20);
        Alert.alert(
          "Oops",
          json.message,
          [
            {
              text: "OK",
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
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
        title="Verify OTP"
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
          <Text style={styles.loginid}>Enter OTP</Text>
        </View>

        <TextInput
          placeholder="Enter OTP"
          value={code}
          style={styles.TextInput}
          onChangeText={(text) => {
            setCode(text);
          }}
        />
        {/* <View
          style={{
            justifyContent: "flex-end",
            alignItems: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold", marginRight: 20 }}>
            {count}
          </Text>
          <TouchableOpacity
            disabled={showbutton}
            onPress={resendOTP}
            style={{}}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: timerStart ? "grey" : "black",
              }}
            >
              Reset OTP
            </Text>
          </TouchableOpacity>
        </View> */}
        <TouchableOpacity
          disabled={isLoading}
          style={[styles.loginBtn, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={() => {
            if (code == "") {
              Alert.alert(
                "Oops",
                "Please enter OTP",
                [
                  {
                    text: "OK",
                    onPress: async () => {},
                  },
                ],
                { cancelable: false }
              );
            } else {
              verifyOTP();
            }
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.btnText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
