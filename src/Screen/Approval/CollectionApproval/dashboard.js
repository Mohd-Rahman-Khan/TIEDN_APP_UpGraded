import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import images from "../../../Image";
import COLORS from "../../../GlobalConstants/COLORS";
import auth from "../../../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { Picker } from "@react-native-picker/picker";
import _ from "lodash";
import NavigationService from "../../../Navigation/RootNavigator/NavigationService";
import CustomDropdown from "../../../comonent/CustomDropdown";
import CollectionDashboard from "./CollectionDashboard";

const TODAY_DATE = moment().format("YYYY-MM-DD");

const DURATION_DATA = [
  {
    id: 1,
    name: "Weekly",
  },
  {
    id: 2,
    name: "Monthly",
  },
  {
    id: 3,
    name: "Yearly",
  },
];

// const widthAndHeight = 270;
// const sliceColor =
//   // ['#F44336',
//   ['#2196F3', '#FF9800'];

export default function CollectionApprovalDashboard({ navigation, route }) {
  const roleBasedGrid = route.params?.roleBasedGrid;
  const [recordsArr, setRecordsArr] = useState([]);
  const [startDt, setStartDt] = useState(
    moment().subtract(1, "w").format("YYYY-MM-DD")
  );
  // const [durationArr, setDurationArr] = useState(DURATION_DATA);
  const [durationItem, setDurationItem] = useState({});
  const [series, setSeries] = useState([]);
  const [regionArr, setRegionArr] = useState([
    { id: -1, description: "Please select region..." },
  ]);
  const [regionItem, setRegionItem] = useState(regionArr[0]);
  const [centerArr, setCenterArr] = useState([
    { id: -1, name: "Please select center..." },
  ]);
  const [centerItem, setCenterItem] = useState(centerArr[0]);
  const [parcelArr, setParcelArr] = useState([]);
  const [parcelItem, setParcelItem] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [isFilterEligible, setIsFilterEligible] = useState(true);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [filterLbl, setFilterLbl] = useState("Apply Filter");

  useEffect(() => {
    setDurationItem(DURATION_DATA[0]);
  }, []);

  useEffect(() => {
    getUserDetails();
    getRecordsTotal();
    // getRecords({});
  }, []);

  useEffect(() => {
    if (!_.isEmpty(durationItem)) {
      // getRecordsTotal()
      getRecordsTotal();
    }
  }, [durationItem]);

  useEffect(() => {
    if (isFilterApply) {
      setFilterLbl("Reset Filter");
      regionApi();
    } else {
      getRecordsTotal();
      setRegionArr([{ id: -1, description: "Please select region..." }]);
      setRegionItem(regionArr[0]);
      setCenterArr([{ id: -1, name: "Please select center..." }]);
      setCenterItem(centerArr[0]);
      setParcelArr([{ id: -1, name: "Please select parcel region..." }]);
      setFilterLbl("Apply Filter");
    }
  }, [isFilterApply]);

  useEffect(() => {
    if (regionItem?.id != -1) {
      centersApi();
    }
  }, [regionItem]);

  useEffect(() => {
    if (centerItem?.id != -1) {
      parcelRegionApi();
    }
  }, [centerItem]);

  useEffect(() => {
    if (
      regionItem?.id != -1 &&
      centerItem?.id != -1 &&
      !_.isEmpty(parcelItem) &&
      parcelItem?.id != -1
    ) {
      getRecords({
        userId: parcelItem?.user_id,
        isFilter: true,
        startDate: startDt,
        endDate: TODAY_DATE,
      });
    }
  }, [regionItem, centerItem, parcelItem]);

  const getUserDetails = async () => {
    const userData1 = await AsyncStorage.getItem("InExUserDetails");
    let userData = JSON.parse(userData1);
    if (
      userData.role === "Regional Manager" ||
      userData.role === "Circulation Executive" ||
      userData.role == "City Head"
    ) {
      setIsFilterEligible(true);
    }
  };

  const apiFailureAlert = (apiName) => {};

  const handleSelectReegion = (item) => {
    setCenterArr([{ id: -1, name: "Please select center..." }]);
    setParcelArr([{ id: -1, name: "Please select parcel region..." }]);
    setCenterItem({ id: -1, name: "Please select center..." });
    setParcelItem({ id: -1, name: "Please select parcel region..." });
    setRegionItem(item);
  };

  const handleSelectCenter = (item) => {
    setParcelItem({ id: -1, name: "Please select parcel region..." });
    setParcelArr([{ id: -1, name: "Please select parcel region..." }]);
    setCenterItem(item);
    setRecordsArr([]);
  };

  const handleSelectParcelReegion = (item) => {
    setParcelItem(item);
  };

  const getRecordsTotal = async () => {
    const token = await AsyncStorage.getItem("InExToken");
    const userId = await AsyncStorage.getItem("InExUserId");

    let dataObj = {
      userId: userId,
      isForMobile: true,
      startDate: startDt,
      endDate: TODAY_DATE,
      isChart: true,
    };
    console.log("getRecordsTotal", dataObj);
    const response = await auth.collectionApproval(dataObj, token);
    console.log("getRecordsTotal", response);

    if (response?.status != 200) {
      apiFailureAlert("getRecordsTotal");
      setRecordsArr([]);
    } else {
      setRecordsArr(response.data?.data);
      const myData = response.data?.data;
      const tempArr = [];
      // tempArr.push(0,0)
      tempArr.push(
        myData[0].sum_total_amount_collected >= 0
          ? myData[0].sum_total_amount_collected
          : 0,
        myData[0].sum_total_closing_balance >= 0
          ? myData[0].sum_total_closing_balance
          : 0
      );
      let mock = [
        {
          amount_collected: 0,
          closing_balance: 0,
          collection_id: 0,
          sum_total_amount_collected: 0,
          sum_total_closing_balance: 0,
          user_id: 0,
        },
      ];

      setSeries(tempArr);
    }
  };

  const apiFailureNoDataAlert = (apiName) => {
    Alert.alert(
      "Information!",
      "No records found.",
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };

  const getRecords = async (request) => {
    const token = await AsyncStorage.getItem("InExToken");
    const userId = await AsyncStorage.getItem("InExUserId");
    let dataObj = {
      userId: userId,
      isForMobile: true,
    };
    console.log("getRecordsTotal", dataObj);
    if (isFilterApply) {
      dataObj = { ...dataObj, ...request };
    }

    const response = await auth.collectionApproval(dataObj, token);
    console.log("getRecordsTotal", response);
    if (response?.status == 404) {
      setRecordsArr([]);
      apiFailureNoDataAlert("getRecords");
    } else if (response?.status != 200) {
      apiFailureAlert("getRecords");
    } else {
      setRecordsArr(response.data?.data);
    }
  };

  const regionApi = async () => {
    const token = await AsyncStorage.getItem("InExToken");
    const userId = await AsyncStorage.getItem("InExUserId");
    const response = await auth.collectionRegion(userId, token);
    if (response?.status != 200) {
      apiFailureAlert("regionApi");
    } else {
      setRegionArr((prev) => [prev[0], ...response.data?.data]);
    }
  };

  const centersApi = async () => {
    const token = await AsyncStorage.getItem("InExToken");

    const response = await auth.collectionCentersRegion(regionItem?.id, token);

    if (response?.status != 200) {
      apiFailureAlert("centersApi");
    } else {
      setCenterArr((prev) => [prev[0], ...response.data?.data]);
    }
  };

  const parcelRegionApi = async () => {
    const token = await AsyncStorage.getItem("InExToken");

    const response = await auth.collectionDepotRegion(centerItem?.id, token);

    if (response?.status != 200) {
      apiFailureAlert("parcelRegionApi");
    } else {
      setParcelArr((prev) => [prev[0], ...response.data?.data]);
    }
  };

  const unsoldReturnRenderItemView = (item) => {
    if (
      isFilterApply &&
      (regionItem?.id == -1 || centerItem?.id == -1 || _.isEmpty(parcelItem))
    ) {
      return null;
    }
    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.white,
          borderRadius: 10,
          height: 70,
          marginVertical: 10,
          paddingLeft: 12,
          paddingRight: 8,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() =>
            navigation.navigate("CollectionApproval", {
              roleBasedGrid,
              shipToCode: item.item?.ship_to_code,
              billToCode: item.item?.bill_to_code,
              billTillDate: item.item?.bill_till_date,
            })
          }
        >
          <View style={{ flex: 0.9 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: COLORS.black }}
            >
              {"BILL TO CODE : " + item.item?.bill_to_code}
            </Text>
            <Text
              style={{ color: COLORS.black, fontWeight: "500", paddingTop: 4 }}
            >
              {item.item?.bill_till_date}
            </Text>
          </View>
          <Image
            style={{ flex: 0.1, width: 15, height: 15 }}
            source={images.rightArrow}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // const graphAbbrivationRow = (color, label) => {
  //   return (
  //     <View style={{flexDirection: 'row'}}>
  //       <View style={{width: 40, height: 20, backgroundColor: color}} />
  //       <Text style={{marginLeft: 10, fontWeight: '600'}}>{label}</Text>
  //     </View>
  //   );
  // };

  // const graphView = () => {
  //   return (
  //     <View
  //       style={{
  //         backgroundColor: COLORS.white,
  //         marginBottom: 20,
  //         borderRadius: 10,
  //       }}>
  //       <View
  //         style={{
  //           flexDirection: 'row',
  //           marginTop: 10,
  //           marginLeft: 10,
  //           marginRight: 4,
  //           marginBottom: 10,
  //         }}>
  //         <View style={{flex: 1}}>
  //           {graphAbbrivationRow(
  //             '#2196F3',
  //             `Total Amount - ${series.length > 0 && series[0]}`,
  //           )}
  //           {graphAbbrivationRow(
  //             '#FF9800',
  //             `Closing Balance - ${series.length > 0 && series[1]}`,
  //           )}
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  const filterView = () => {
    return (
      <View>
        <CustomDropdown
          labelField="description"
          valueField="description"
          data={regionArr}
          selectedItem={regionItem?.description}
          itemHandler={(item) => {
            handleSelectReegion(item);
          }}
          search={true}
        />

        {regionItem?.id != -1 ? (
          <CustomDropdown
            data={centerArr}
            selectedItem={centerItem?.name}
            itemHandler={(item) => {
              handleSelectCenter(item);
            }}
            search={true}
          />
        ) : null}
        {centerItem?.id != -1 ? (
          <CustomDropdown
            data={parcelArr}
            selectedItem={parcelItem?.name}
            itemHandler={(item) => {
              handleSelectParcelReegion(item);
            }}
            search={true}
          />
        ) : null}
      </View>
    );
  };

  const applyFilterView = () => {
    return (
      <View style={{ alignItems: "flex-end", marginRight: 6 }}>
        <TouchableOpacity
          onPress={() => {
            if (isFilterApply) {
              setRecordsArr([]);
            }
            setIsFilterApply(!isFilterApply);
          }}
        >
          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
            {filterLbl}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const listHeaderView = () => {
    return (
      <View>
        {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
            marginTop: 5,
          }}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{fontSize: 20, fontWeight: '700', color: COLORS.black}}>
              {durationItem?.name
                ? durationItem?.name.replace('ly', '')
                : 'Week'}
            </Text>
            <Text
              style={{fontSize: 14, fontWeight: '700', color: COLORS.black}}>
              {' '}
              ({startDt} - {TODAY_DATE})
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'lightgrey',
              width: 130,
            }}>
            <CustomDropdown
              data={DURATION_DATA}
              selectedItem={durationItem?.name}
              itemHandler={item => {
                setIsFilterApply(false);
                setRecordsArr([]);
                setDurationItem(item);
                let m = moment().format('YYYY-MM-DD');
                if (item.id == 1) {
                  m = moment().subtract(1, 'w');
                } else if (item.id == 2) {
                  m = moment().subtract(1, 'M');
                } else if (item.id == 3) {
                  m = moment().subtract(1, 'y');
                }
                setStartDt(m.format('YYYY-MM-DD'));
              }}
              search={true}
            />
          </View>
        </View> */}
        {/* {graphView()} */}
        {isFilterEligible && applyFilterView()}
        {isFilterApply && filterView()}
      </View>
    );
  };

  const unsoldReturnView = () => {
    return (
      <View style={{ marginHorizontal: 12, marginTop: 12 }}>
        <FlatList
          data={recordsArr}
          ListHeaderComponent={listHeaderView()}
          renderItem={(item) => unsoldReturnRenderItemView(item)}
          showsVerticalScrollIndicator={false}
          // stickyHeaderIndices={[0]}
        />
      </View>
    );
  };

  return <View>{unsoldReturnView()}</View>;
}
