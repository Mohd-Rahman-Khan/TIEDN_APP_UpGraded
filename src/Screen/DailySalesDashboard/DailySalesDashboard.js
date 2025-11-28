import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import styles from "./styles";
import CalenderComp from "../../comonent/CalenderComp";
import moment from "moment";
import images from "../../Image/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../../api/auth";
import Header from "../../comonent/Header/Header";
import AppIndicator from "../../Helper/AppIndicator";
import { difference } from "lodash";
import COLORS from "../../GlobalConstants/COLORS";
import CustomDropdown from "../../comonent/CustomDropdown";
const TODAY_DATE = moment().format("YYYY-MM-DD");

export default function DailySalesDashboard({ route, navigation }) {
  const roleBasedGrid = route?.params?.roleBasedGrid;
  const [showCalender, setshowCalender] = useState(false);
  const [selectFromDate, setselectFromDate] = useState(false);
  const [userData, setUserData] = useState();
  const [publicationArr, setPublicationArr] = useState([]);
  const [publicationItem, setPublicationItem] = useState({});
  const [dashboardData, setdashboardData] = useState([]);

  const data = [
    // {
    //   PO: 1,
    // },
    // {
    //   'Trade Supply': 1,
    // },
    // {
    //   Subscriptions: 1,
    // },
    // {
    //   'Complimentary Copy': 1,
    // },
    // {
    //   'Fresh Unsold': 1,
    // },
    // {
    //   Return: 1,
    // },
    // {
    //   'Total Fresh Unsold + Return': 1,
    // },
    // {
    //   'NetPaid Sales': 1,
    // },
    // {
    //   'Total Unsold %': 1,
    // },
    {
      "DIV 1": [
        {
          PO: 0,
        },
        {
          "Trade Supply": 0,
        },
        {
          "Complimentary Copy": 10,
        },
        {
          "Fresh Unsold": 0,
        },
        {
          Return: 0,
        },
        {
          "Total Fresh Unsold + Return": 0,
        },
        {
          "NetPaid Sales": 0,
        },
        {
          "Total Unsold %": 0,
        },
      ],
    },
    {
      "DIV 2": [
        {
          PO: 0,
        },
        {
          "Trade Supply": 0,
        },
        {
          "Complimentary Copy": 10,
        },
        {
          "Fresh Unsold": 0,
        },
        {
          Return: 0,
        },
        {
          "Total Fresh Unsold + Return": 0,
        },
        {
          "NetPaid Sales": 0,
        },
        {
          "Total Unsold %": 0,
        },
      ],
    },
  ];

  const [isLoading, setisLoading] = useState(false);
  const [selectedFromDate, setselectedFromDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [selectedFromDateToShow, setselectedFromDateToShow] = useState(
    moment(new Date()).format("DD-MM-YYYY, dddd")
  );
  const [selectedToDateToShow, setselectedToDateToShow] = useState(
    moment(new Date()).format("DD-MM-YYYY, dddd")
  );
  const [selectedToDate, setselectedToDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );

  useEffect(() => {
    getUserDetails();
    publicationApi();
  }, []);

  const publicationApi = async () => {
    const token = await AsyncStorage.getItem("InExToken");
    const response = await auth.publications(token);
    if (response?.status != 200) {
      Alert.alert(
        "Oops",
        response?.data?.message ? response?.data?.message : response?.problem,
        [{ text: "OK", onPress: async () => {} }],
        { cancelable: false }
      );
    } else {
      setPublicationArr(response.data?.data);
      setPublicationItem(response.data?.data[0]);
      getDashboardDetail(null, response.data?.data[0]?.id);
    }
  };

  const getDashboardDetail = async (getDate, id) => {
    let passDate = getDate ? getDate : moment(new Date()).format("YYYY-MM-DD");

    setisLoading(true);
    const userData1 = await AsyncStorage.getItem("InExUserDetails");
    const parseUserData = JSON.parse(userData1);
    const userId = await AsyncStorage.getItem("InExUserId");
    const token = await AsyncStorage.getItem("InExToken");

    let url;
    if (
      parseUserData?.role == "Depot Salesman" ||
      parseUserData?.role == "Parcel Vendor" ||
      parseUserData?.role == "Circulation Executive"
    ) {
      url = `/transaction/unsold-data-daily-basis?userId=${userId}&startDate=${passDate}&endDate=${passDate}&publicationId=${id}`;
    } else if (
      parseUserData?.role == "City Head" ||
      parseUserData?.role == "Regional Manager"
    ) {
      url = `/transaction/unsold-data-dashboard?userId=${userId}&startDate=${passDate}&endDate=${passDate}&publicationId=${id}`;
    } else {
      url = null;
    }

    const response = await auth.getDashboardOfDailySales(url, token);
    setisLoading(false);

    if (response?.data?.code == 200 || response?.data?.code == 201) {
      setdashboardData(response?.data?.data);
    } else {
      setdashboardData([]);
      Alert.alert(
        "Oops",
        response?.data?.message
          ? response?.data?.message == "Resource not found. "
            ? "List is empty"
            : response?.data?.message
          : response?.problem,
        [{ text: "OK", onPress: async () => {} }],
        { cancelable: false }
      );
    }
  };

  const getUserDetails = async () => {
    const userData1 = await AsyncStorage.getItem("InExUserDetails");
    const userData = JSON.parse(userData1);

    setUserData(userData);
  };
  return (
    <View style={{ flex: 1 }}>
      <Header
        title={"Daily Sales Report Dashboard"}
        onPress={() => {
          navigation.navigate("Home");
        }}
      />
      <AppIndicator visible={isLoading} />
      {showCalender ? (
        <CalenderComp
          selectFromDate={selectFromDate}
          fromDate={selectedFromDate}
          closeModal={() => {
            setshowCalender(!showCalender);
            setselectFromDate(false);
          }}
          maxDate={moment(new Date()).format("YYYY-MM-DD")}
          setselectedDate={(date) => {
            //setSelectedDate(moment(date).format("DD-MM-YYYY"));
            setshowCalender(!showCalender);

            if (selectFromDate) {
              setselectedFromDate(date);
              setselectFromDate(false);
              setselectedFromDateToShow(
                moment(date).format("DD-MM-YYYY, dddd")
              );
              setTimeout(() => {
                getDashboardDetail(date, publicationItem?.id);
              }, 1000);
            } else {
              // setselectedToDate(date);
              // setselectFromDate(false);

              if (date < selectedFromDate) {
                Alert.alert(
                  "Oops",
                  "To date should be greater than from date.",
                  [{ text: "OK", onPress: async () => {} }],
                  { cancelable: false }
                );
              } else {
                setselectedToDate(date);
                setselectFromDate(false);
                setselectedToDateToShow(
                  moment(date).format("DD-MM-YYYY, dddd")
                );
              }
            }
          }}
        />
      ) : null}

      <View style={{ paddingHorizontal: 10, flex: 1 }}>
        <CustomDropdown
          headerTitle="Select Publication"
          data={publicationArr}
          selectedItem={publicationItem?.name}
          itemHandler={(item) => {
            setPublicationItem(item);
            getDashboardDetail(selectedFromDate, item?.id);
          }}
          search={true}
        />
        <View style={styles.filterContainer}>
          <View style={{ width: "100%", backgroundColor: "white" }}>
            <Text
              style={[
                styles.filterDateText,
                {
                  fontSize: 16,
                  fontWeight: "bold",
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                },
              ]}
            >
              Select Date{" "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setshowCalender(true);
                setselectFromDate(true);
              }}
              style={styles.fromAndTODateCotaier}
            >
              <Text style={styles.filterDateText}>
                {selectedFromDateToShow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {dashboardData?.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginBottom: 10, marginTop: 10 }}
          >
            {/* <Dashboard
              role={userData?.role}
              data={
                userData?.role == 'Regional Manager' ||
                userData?.role == 'City Head'
                  ? data
                  : dashboardData
              }
            /> */}
            <Dashboard role={userData?.role} data={dashboardData} />
          </ScrollView>
        ) : (
          <View
            style={{
              borderColor: COLORS.black,
              borderWidth: 0.4,
              borderColor: "black",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                paddingVertical: 15,
                color: COLORS.black,
                fontWeight: "bold",
              }}
            >
              Dashboard Data is empty.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomView}>
        <TouchableOpacity
          onPress={() => {
            if (roleBasedGrid == 1) {
              navigation.navigate("UnsoldReturnList");
            } else if (roleBasedGrid == 3) {
              // navigation.navigate('ApprovalDashboard2', {
              //   titleName: route?.params?.titleName,
              // });
              navigation.navigate("UnsoldReturnApprovalDashboard", {
                roleBasedGrid: 1,
              });
            } else if (roleBasedGrid == 4) {
              navigation.navigate("UnsoldReturnApprovalDashboard", {
                roleBasedGrid: 1,
              });
            }
          }}
          style={styles.addIconContainer}
        >
          <Image style={styles.plusIcon} source={images.file} />
        </TouchableOpacity>

        {roleBasedGrid == 1 || roleBasedGrid == 3 || roleBasedGrid == 4 ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("UnsoldRetun");
            }}
            style={styles.addIconContainer}
          >
            <Image style={styles.plusIcon} source={images.plusIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
