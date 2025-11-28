import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  LayoutAnimation,
  Platform,
} from 'react-native';
import styles from './styles';
import SelectBox from 'react-native-multi-selectbox';
import { set, xorBy } from 'lodash';
import DateTimePicker from '@react-native-community/datetimepicker';
import images from '../../Image';
import moment from 'moment';
import auth from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import commonApiResponseHandler from '../../api/commonMethod';
import COLORS from '../../GlobalConstants/COLORS';
import _ from 'lodash';
import NavigationService from '../../Navigation/RootNavigator/NavigationService';
import useTimeBlockedCallback from '../../Helper/DoubleTapHelper';
import CustomDropdown from '../../comonent/CustomDropdown';
import CalenderComp from '../../comonent/CalenderComp';
import MultiSelectComponent from '../../comonent/CustomDropdown/MultiSelectComponent';
import CheckBox from 'react-native-check-box';

// import Calendar from 'react-calendar';

const TODAY_DATE = moment().format('YYYY-MM-DD');

const UnsoldRetun = ({ navigation }) => {
  const [reqFormatDate, setReqFormatDate] = useState(TODAY_DATE);
  const [reqFormatDateToShow, setreqFormatDateToShow] = useState(
    moment().format('DD-MM-YYYY, dddd'),
  );

  const [publicationArr, setPublicationArr] = useState([]);
  const [publicationItem, setPublicationItem] = useState({});
  const [depotArr, setDepotArr] = useState([]);
  const [depotItem, setDepotItem] = useState({});
  const [supplyVal, setSupplyVal] = useState(0);
  const [unsoldVal, setUnsoldVal] = useState(0);
  const [returnVal, setReturnVal] = useState(0);
  const [npsVal, setNPSVal] = useState(0);
  const [unsoldReturnId, setUnsoldReturnId] = useState(0);
  const [submitEnable, setSubmitEnable] = useState(false);
  const [isPvDsm, setIsPvDsm] = useState(false);
  const [recallApi, setRecallApi] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [supplyData, setSupplyData] = useState();
  const [showCalender, setshowCalender] = useState(false);
  const [loginUserDetail, setloginUserDetail] = useState(false);
  const [multiSelectedVal, setmultiSelectedVal] = useState([]);
  const [depotSelect, setdepotSelect] = useState(true);
  const [parcelSelect, setparcelSelect] = useState(false);
  const [regionWiseParcelList, setregionWiseParcelList] = useState([]);
  const [regionWiseDepotList, setregionWiseDepotList] = useState([]);
  const [showSubmitButton, setshowSubmitButton] = useState(true);
  const [circulationExecList, setCirculationExecList] = useState([]);
  const [selectedCirculationExec, setselectedCirculationExec] = useState('');

  useEffect(() => {
    depotApi();
    //publicationApi();
    getUserDetails();
  }, []);

  useEffect(() => {
    depotApi();
    publicationApi();
  }, [recallApi, selectedCirculationExec]);

  const getCirculationExecListForRM = async () => {
    const userData1 = await AsyncStorage.getItem('InExUserDetails');
    const userData = JSON.parse(userData1);
    const token = await AsyncStorage.getItem('InExToken');
    const response = await auth.getCirculationExecListForRM(
      userData?.loginId,
      token,
    );

    // console.log("response", response);
    // console.log("response", userData?.loginId);

    if (response?.status == 200) {
      if (response?.data?.length > 0) {
        setCirculationExecList(response?.data);
        setselectedCirculationExec(response?.data[0]);
      } else {
        setCirculationExecList([]);
      }
    } else {
      setCirculationExecList([]);
    }
  };

  const getUserDetails = async () => {
    const userData1 = await AsyncStorage.getItem('InExUserDetails');
    const userData = JSON.parse(userData1);
    setloginUserDetail(userData);
    if (
      userData?.role == 'Parcel Vendor' ||
      userData?.role == 'Depot Salesman'
    ) {
      setIsPvDsm(true);
    }

    if (userData?.role == 'Regional Manager') {
      getCirculationExecListForRM();
    }
  };

  useEffect(() => {
    if (!_.isEmpty(depotItem) && reqFormatDate && !_.isEmpty(publicationItem)) {
      supplyApi(false);
    }
  }, [reqFormatDate, publicationItem, depotItem]);

  useEffect(() => {
    if (supplyVal > 0) {
      let NPS = supplyVal - unsoldVal - returnVal;
      setNPSVal(NPS);
    } else {
      setNPSVal(0);
    }
  }, [supplyVal, unsoldVal, returnVal]);

  const getRigion = async publicationId => {
    //console.log("userIdData", selectedCirculationExec);
    const token = await AsyncStorage.getItem('InExToken');
    const userId = selectedCirculationExec
      ? selectedCirculationExec?.id
      : await AsyncStorage.getItem('InExUserId');
    // const response = selectedCirculationExec
    //   ? selectedCirculationExec?.id
    //   : await auth.getRigionList(userId, token);

    const response = await auth.getRigionList(userId, token);

    console.log('response___', response);

    if (response?.status != 200) {
      //alert(response?.problem);
    } else {
      if (response?.data?.data?.length > 0) {
        let findRegionId = response?.data?.data?.map(item => {
          return item?.id;
        });

        getRigionsDepotList(findRegionId, response?.data?.data, publicationId);
        getRigionsParcelList(findRegionId, response?.data?.data, publicationId);
      } else {
        Alert.alert(
          'Oops!',
          'Region list not found.',
          [{ text: 'OK', onPress: async () => {} }],
          { cancelable: false },
        );
      }
    }
  };

  const getRigionsDepotList = async (region, responseData, publicationId) => {
    let sendingData = {
      regions: region,
      type: 'depot',
      table: responseData[0]?.table,
      publication: publicationId,
    };
    console.log('getRigionListCo', sendingData);

    const token = await AsyncStorage.getItem('InExToken');
    //const userId = await AsyncStorage.getItem('InExUserId');
    const response = await auth.regionWiseParcelAndDepotUnsold(
      sendingData,
      token,
    );

    if (response?.status != 200) {
      Alert.alert(
        'Oops!',
        response?.problem,
        [{ text: 'OK', onPress: async () => {} }],
        { cancelable: false },
      );
    } else {
      console.log('response?.data', response?.data);

      let addLabelAndValField = response.data?.map(itemData => {
        return {
          ...itemData,
          label: itemData.name,
          value: itemData.ship_to_code,
        };
      });
      //setregionWiseDepotList(response?.data);
      setregionWiseDepotList(addLabelAndValField);
    }
  };
  const getRigionsParcelList = async (region, responseData, publicationId) => {
    let sendingData = {
      regions: region,
      //regions: [1],
      type: 'parcel',
      table: responseData[0]?.table,
      publication: publicationId,
    };

    const token = await AsyncStorage.getItem('InExToken');
    //const userId = await AsyncStorage.getItem('InExUserId');
    const response = await auth.regionWiseParcelAndDepotUnsold(
      sendingData,
      token,
    );
    console.log('getRigionListCo', response);

    if (response?.status != 200) {
      Alert.alert(
        'Oops!',
        response?.problem,
        [{ text: 'OK', onPress: async () => {} }],
        { cancelable: false },
      );
    } else {
      //setregionWiseParcelList(response?.data);

      let addLabelAndValField = response.data?.map(itemData => {
        return {
          ...itemData,
          label: itemData.name,
          value: itemData.ship_to_code,
        };
      });
      //setregionWiseDepotList(response?.data);
      setregionWiseParcelList(addLabelAndValField);
    }
  };

  const apiFailureAlert = apiName => {
    Alert.alert(
      'oops!',
      'something went wrong, please try later!',
      [
        {
          text: 'OK',
          onPress: async () => {
            // await AsyncStorage.removeItem('InExToken');
            // await AsyncStorage.removeItem('InExUserId');
            // await AsyncStorage.removeItem('InExUserDetails');
            // NavigationService.reset(navigation, 'Login');
          },
        },
      ],
      { cancelable: false },
    );
  };
  const apiFailureAlertMessage = apiName => {
    Alert.alert(
      '',
      'Something went wrong, Please contact adminstrator.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSupplyVal(0);
            setUnsoldVal(0);
            setReturnVal(0);
            setNPSVal(0);
            // setSubmitEnable(false);
            setDisableButton(true);
          },
        },
      ],
      { cancelable: false },
    );
  };

  const supplyApiFailureAlert = apiName => {
    Alert.alert(
      'Information!',
      'Supply not found.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSupplyVal(0);
            setUnsoldVal(0);
            setReturnVal(0);
            setNPSVal(0);
            // setSubmitEnable(false);
          },
        },
      ],
      { cancelable: false },
    );
  };

  const publicationApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const response = await auth.publications(token);
    //console.log('response.data?.data[0]', response.data?.data[0]);
    if (response?.status != 200) {
      apiFailureAlert('publicationApi');
    } else {
      setPublicationArr(response.data?.data);
      setPublicationItem(response.data?.data[0]);
      getRigion(response.data?.data[0]?.id);
    }
  };

  const depotApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');

    const userData1 = await AsyncStorage.getItem('InExUserDetails');
    const userData = JSON.parse(userData1);

    if (
      userData?.role == 'Circulation Executive' ||
      userData?.role == 'Regional Manager'
    ) {
    } else {
      const response = await auth.depots(userId, token);
      if (response?.status != 200 && response?.status != 404) {
        apiFailureAlert('depotApi');
      } else if (response?.status == 404) {
        apiFailureAlertMessage('depotApi');
      } else {
        // if (userData?.role == 'Circulation Executive') {
        //   let addLabelAndValField = response.data?.data.map(itemData => {
        //     return {
        //       ...itemData,
        //       label: itemData.name,
        //       value: itemData.ship_to_code,
        //     };
        //   });

        //   setDepotArr(addLabelAndValField);
        //   //setDepotItem(addLabelAndValField[0]);
        // } else {
        //   setDepotArr(response.data?.data);
        //   setDepotItem(response.data?.data[0]);
        // }

        setDepotArr(response.data?.data);
        setDepotItem(response.data?.data[0]);
      }
    }
  };

  const supplyApi = async flag => {
    const token = await AsyncStorage.getItem('InExToken');
    // const response = await auth.supply(
    //   depotItem?.ship_to_code,
    //   reqFormatDate,
    //   //'2024-08-06',
    //   publicationItem?.id,
    //   token,
    // );

    const response = await auth.supplyUnsoldReturn(
      depotItem?.ship_to_code,
      reqFormatDate,
      //'2024-08-06',
      publicationItem?.id,
      token,
    );

    if (response?.status != 200) {
      supplyApiFailureAlert('supplyApi');
      setSubmitEnable(true);
    } else {
      setSubmitEnable(false);
      setSupplyData(response.data?.data);
      setSupplyVal(response.data?.data?.total_supply);
      setUnsoldReturnId(response.data?.data?.unsold_return_id);

      setUnsoldVal(response.data?.data?.unsold);
      setReturnVal(response.data?.data?.supply_return);
      if (response.data?.data?.unsold_return_id > 0) {
      }
    }
  };

  const submitAction = useTimeBlockedCallback(async (actionId, status) => {
    if (unsoldVal > supplyVal) {
      alert(
        'Please provide valid UNSOLD value i.e not greater than SUPPLY value.',
      );
    } else {
      const token = await AsyncStorage.getItem('InExToken');
      const userId = await AsyncStorage.getItem('InExUserId');
      let dataObj = {
        user_id: userId,
        ship_to_code: depotItem?.ship_to_code,
        publication_date: reqFormatDate,
        publication_id: publicationItem?.id,
        total_supply: supplyVal,
        unsold: unsoldVal,
        supply_return: returnVal,
        id: supplyData?.id,
        users: null,
        // "updated_by_last_user_id": 7 // optional
      };
      if (supplyData?.approval_status == 2) {
        Object.assign(dataObj, { approval_status: '_0' });
      }
      if (unsoldReturnId > 0) {
        dataObj.unsold_return_id = unsoldReturnId;
      }

      const response = await auth.unsoldReturnSubmit(dataObj, token);
      if (response?.status != 200) {
        apiFailureAlert('unsoldReturnSubmitApi');
      } else {
        if (actionId == 1) {
          Alert.alert(
            `Record ${status}!`,
            `Request ${status} successfully.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setUnsoldVal(0);
                  setReturnVal(0);
                  navigation.navigate('Home');
                },
              },
            ],
            { cancelable: false },
          );
        }
      }
    }
  });

  const onChangeTextValue = (text, type) => {
    if (type == 2) {
      if (text == '' || text == 0) {
        setUnsoldVal(text);
      } else {
        let currentVal = parseInt(text) + parseInt(returnVal);

        if (currentVal <= supplyVal) {
          setUnsoldVal(text);
        } else {
          alert('Invalid Value');
        }
      }
    }
    if (type == 3) {
      // setReturnVal(text);
      if (text == '' || text == 0) {
        setReturnVal(text);
      } else {
        let currentVal = parseInt(text) + parseInt(unsoldVal);

        if (currentVal <= supplyVal) {
          setReturnVal(text);
        } else {
          alert('Invalid Value');
        }
      }
    }
  };

  const rowItemView = (lbl, value = 0, enableFlag, type) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 14,
          height: 26,
          marginHorizontal: 10,
        }}
      >
        <Text style={{ width: '50%' }}>{lbl}</Text>
        {enableFlag ? (
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: 'lightgrey',
              height: 26,
              width: '50%',
              color: 'black',
              paddingVertical: 1,
            }}
            value={type == 2 ? unsoldVal.toString() : returnVal.toString()}
            keyboardType={'numeric' || 'number-pad'}
            onChangeText={text => onChangeTextValue(text, type)}
          />
        ) : (
          <Text
            style={{
              borderWidth: 1,
              borderColor: 'lightgrey',
              height: 26,
              paddingLeft: 3,
              paddingTop: 3,
              backgroundColor: 'lightgrey',
              width: '50%',
              color: 'black',
            }}
          >
            {value}
          </Text>
        )}
      </View>
    );
  };

  const getSupplyData = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const sendingData = {
      ship_to_code: multiSelectedVal,
      publication_start_date: reqFormatDate,
      publication_id: publicationItem?.id,
      // ship_to_code: [
      //   '6006166',
      //   '6006170',
      //   '6006342',
      //   '6006345',
      //   '6006454',
      //   '6006478',
      // ],
      // publication_start_date: '2024-10-23',
      // publication_id: 2,
    };

    const response = await auth.getCirculationExeSupplyUnsoldReturn(
      sendingData,
      token,
    );

    console.log('getCirculationExeSupplyUnsoldReturn', response);

    if (response?.status != 200) {
      supplyApiFailureAlert('supplyApi');
      setSubmitEnable(true);
    } else {
      setSubmitEnable(false);
      setSupplyData(response.data?.data);
      setSupplyVal(response.data?.data?.total_supply);
      setUnsoldReturnId(response.data?.data?.unsold_return_id);

      setUnsoldVal(response.data?.data?.unsold);
      setReturnVal(response.data?.data?.supply_return);
      if (response.data?.data?.unsold_return_id > 0) {
      }
    }
  };

  const submitUnsoldReturn = async (actionId = 1) => {
    if (unsoldVal > supplyVal) {
      alert(
        'Please provide valid UNSOLD value i.e not greater than SUPPLY value.',
      );
    } else {
      const token = await AsyncStorage.getItem('InExToken');
      const userId = selectedCirculationExec
        ? selectedCirculationExec?.id
        : await AsyncStorage.getItem('InExUserId');
      const userData1 = await AsyncStorage.getItem('InExUserDetails');
      const userData = JSON.parse(userData1);
      let dataObj = {
        user_id: userId,
        ship_to_code: selectedCirculationExec
          ? selectedCirculationExec?.login_id
          : userData?.loginId,
        publication_date: reqFormatDate,
        publication_id: publicationItem?.id,
        total_supply: supplyVal,
        unsold: unsoldVal,
        supply_return: returnVal,
        id: supplyData?.id ? supplyData?.id : null,
        complementary: supplyData?.complementary,
        subscriptions: supplyData?.subscriptions,
        users: multiSelectedVal.join(','),
      };

      console.log('dataObj', dataObj);

      const response = await auth.unsoldReturnSubmit(dataObj, token);
      if (response?.status != 200) {
        apiFailureAlert('unsoldReturnSubmitApi');
      } else {
        if (actionId == 1) {
          Alert.alert(
            'Record saved!',
            'Request submit successfully.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setUnsoldVal(0);
                  setReturnVal(0);
                  navigation.navigate('Home');
                },
              },
            ],
            { cancelable: false },
          );
        }
        if (actionId == 2) {
          Alert.alert('Record saved!', 'Request Added successfully.', [
            {
              text: 'OK',
              onPress: () => {},
            },
          ]);
        }
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {showCalender ? (
          <CalenderComp
            // selectFromDate={selectFromDate}
            // fromDate={selectedFromDate}
            closeModal={() => {
              setshowCalender(!showCalender);
            }}
            initialDate={moment(new Date()).format('YYYY-MM-DD')}
            maxDate={moment(new Date()).format('YYYY-MM-DD')}
            //minDate={moment(new Date()).format('YYYY-MM-DD')}
            minDate={moment().subtract(14, 'days').format('YYYY-MM-DD')}
            setselectedDate={date => {
              //setSelectedDate(moment(date).format("DD-MM-YYYY"));
              let selectedDate = moment(date).format('DD-MM-YYYY, dddd');
              setshowCalender(!showCalender);
              setReqFormatDate(date);
              setreqFormatDateToShow(selectedDate);

              if (date == moment(new Date()).format('YYYY-MM-DD')) {
                setshowSubmitButton(true);
              } else {
                setshowSubmitButton(false);
              }
            }}
          />
        ) : null}
        {loginUserDetail?.role == 'Circulation Executive' ||
        loginUserDetail?.role == 'Regional Manager' ? (
          <>
            <View style={styles.mainview}>
              <View>
                <Text style={styles.dropdownHeading}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setshowCalender(true);
                  }}
                >
                  <View style={styles.textInput}>
                    <Text>{reqFormatDateToShow}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              {loginUserDetail?.role == 'Regional Manager' ? (
                <CustomDropdown
                  headerTitle="Select Circulation Executive"
                  data={circulationExecList}
                  selectedItem={selectedCirculationExec?.name}
                  itemHandler={item => {
                    // setPublicationItem(item);
                    // getRigion(item?.id);
                    setselectedCirculationExec(item);
                  }}
                  search={true}
                />
              ) : null}

              <CustomDropdown
                headerTitle="Select Publication"
                data={publicationArr}
                selectedItem={publicationItem?.name}
                itemHandler={item => {
                  setPublicationItem(item);
                  getRigion(item?.id);
                }}
                search={true}
              />
              <View
                style={{
                  flexDirection: 'row',
                  height: 30,
                  //backgroundColor: 'red',
                  width: '100%',
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <CheckBox
                  style={{ flex: 1, padding: 10 }}
                  onClick={() => {
                    setdepotSelect(!depotSelect);
                    setparcelSelect(false);
                    setmultiSelectedVal([]);
                  }}
                  isChecked={depotSelect}
                  rightText={'Depot'}
                  rightTextStyle={{ color: COLORS.black }}
                />
                <CheckBox
                  style={{ flex: 1, padding: 10 }}
                  onClick={() => {
                    setparcelSelect(!parcelSelect);
                    setdepotSelect(false);
                    setmultiSelectedVal([]);
                  }}
                  isChecked={parcelSelect}
                  rightText={'Parcel'}
                  rightTextStyle={{ color: COLORS.black }}
                />
              </View>

              {depotSelect ? (
                <>
                  {/* <MultiSelectComponent
                    depotSelect={depotSelect}
                    headerTitle="Select Depot"
                    maxSelect={1}
                    data={regionWiseDepotList}
                    selectedItem={depotItem?.name}
                    itemHandler={item => {
                      setDepotItem(item);
                    }}
                    search={true}
                    selected={multiSelectedVal}
                    setSelected={val => {
                      setmultiSelectedVal(val);
                    }}
                  /> */}
                  <CustomDropdown
                    multiSelecte={true}
                    headerTitle="Select Depot"
                    data={regionWiseDepotList}
                    selectedItem={depotItem?.name}
                    itemHandler={item => {
                      setDepotItem(item);
                      setmultiSelectedVal([item?.ship_to_code]);
                    }}
                    search={true}
                  />
                </>
              ) : (
                <MultiSelectComponent
                  renderSelectedItem={(item, unSelect) => (
                    <TouchableOpacity
                      onPress={() => unSelect && unSelect(item)}
                    >
                      <View
                        style={{
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderWidth: 0.4,
                          marginHorizontal: 3,
                          marginVertical: 3,
                        }}
                      >
                        <Text style={{ color: 'black', fontSize: 14 }}>
                          {item.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  //maxSelect={1}
                  depotSelect={depotSelect}
                  headerTitle="Select Parcel"
                  data={regionWiseParcelList}
                  selectedItem={depotItem?.name}
                  itemHandler={item => {
                    setDepotItem(item);
                  }}
                  search={true}
                  selected={multiSelectedVal}
                  setSelected={val => {
                    setmultiSelectedVal(val);
                  }}
                />
              )}
            </View>
            {parcelSelect ? (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    getSupplyData();
                  }}
                >
                  <View
                    style={[
                      styles.canclebtn,
                      {
                        opacity: 1,
                        borderColor: '#DA0B0B',
                        backgroundColor: 'white',
                        marginTop: 40,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.canclebtntext,
                        {
                          color: '#DA0B0B',
                        },
                      ]}
                    >
                      Get Supply Data
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {supplyData?.total_supply > 0 ? (
              <>
                <View
                  style={{
                    backgroundColor: 'white',
                    marginLeft: '6%',
                    marginRight: '4%',
                    marginTop: '5%',
                    borderWidth: 1,
                    borderTopColor: 'white',
                    borderLeftColor: 'white',
                    borderBottomColor: 'lightgrey',
                    borderRightColor: 'lightgrey',
                  }}
                >
                  {rowItemView('Supply:', supplyVal, false, 1)}
                  {rowItemView(
                    'Subscriptions:',
                    supplyData?.subscriptions ? supplyData?.subscriptions : 0,
                    false,
                    1,
                  )}
                  {rowItemView(
                    'Complementary:',
                    supplyData?.complementary ? supplyData?.complementary : 0,
                    false,
                    1,
                  )}
                  {rowItemView(
                    'Fresh Unsold:',
                    supplyData?.unsold ? supplyData?.unsold : 0,
                    supplyData?.approval_status == 1 ? false : true,
                    2,
                  )}
                  {rowItemView(
                    'Return:',
                    supplyData?.supply_return ? supplyData?.supply_return : 0,
                    supplyData?.approval_status == 1 ? false : true,
                    3,
                  )}
                  {/* {isPvDsm && rowItemView('NPS:', npsVal, false, 4)} */}
                  {rowItemView('NPS:', npsVal, false, 4)}
                  {/* ???? */}
                </View>

                {showSubmitButton ? (
                  <View
                    style={[styles.buttongroup, { justifyContent: 'center' }]}
                  >
                    <View>
                      <TouchableOpacity
                        // disabled={
                        //   submitEnable ||
                        //   disableButton ||
                        //   supplyData?.approval_status == 1
                        // }
                        onPress={() => {
                          submitUnsoldReturn();
                        }}
                      >
                        <View
                          style={[
                            styles.canclebtn,
                            {
                              opacity: !submitEnable ? 1 : 0.3,
                              borderColor:
                                supplyData?.approval_status == 1
                                  ? 'lightgrey'
                                  : '#DA0B0B',
                              backgroundColor:
                                supplyData?.approval_status == 1
                                  ? 'lightgrey'
                                  : 'white',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.canclebtntext,
                              {
                                color:
                                  supplyData?.approval_status == 1
                                    ? 'white'
                                    : '#DA0B0B',
                              },
                            ]}
                          >
                            SUBMIT
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 20,
                }}
              >
                Supply not found.
              </Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.mainview}>
              <View>
                <Text style={styles.dropdownHeading}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setshowCalender(true);
                  }}
                >
                  <View style={styles.textInput}>
                    <Text>{reqFormatDateToShow}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <CustomDropdown
                headerTitle="Select Publication"
                data={publicationArr}
                selectedItem={publicationItem?.name}
                itemHandler={item => {
                  setPublicationItem(item);
                }}
                search={true}
              />

              <CustomDropdown
                multiSelecte={true}
                headerTitle="Select Depot"
                data={depotArr}
                selectedItem={depotItem?.name}
                itemHandler={item => {
                  setDepotItem(item);
                }}
                search={true}
              />
            </View>

            {supplyData?.total_supply > 0 ? (
              <View
                style={{
                  backgroundColor: 'white',
                  marginLeft: '6%',
                  marginRight: '4%',
                  marginTop: '5%',
                  borderWidth: 1,
                  borderTopColor: 'white',
                  borderLeftColor: 'white',
                  borderBottomColor: 'lightgrey',
                  borderRightColor: 'lightgrey',
                }}
              >
                {rowItemView('Supply:', supplyVal, false, 1)}
                {rowItemView(
                  'Subscriptions:',
                  supplyData?.subscriptions ? supplyData?.subscriptions : 0,
                  false,
                  1,
                )}
                {rowItemView(
                  'Complementary:',
                  supplyData?.complementary ? supplyData?.complementary : 0,
                  false,
                  1,
                )}
                {rowItemView(
                  'Fresh Unsold:',
                  supplyData?.unsold ? supplyData?.unsold : 0,
                  supplyData?.approval_status == 1 ? false : true,
                  2,
                )}
                {rowItemView(
                  'Return:',
                  supplyData?.supply_return ? supplyData?.supply_return : 0,
                  supplyData?.approval_status == 1 ? false : true,
                  3,
                )}
                {isPvDsm && rowItemView('NPS:', npsVal, false, 4)}
                {/* ???? */}
              </View>
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                Supply not found.
              </Text>
            )}

            <View style={styles.buttongroup}>
              {showSubmitButton ? (
                <View>
                  <TouchableOpacity
                    disabled={
                      submitEnable ||
                      disableButton ||
                      supplyData?.approval_status == 1
                    }
                    onPress={() => {
                      if (supplyData?.total_supply > 0) {
                        let statusOfReq = 'Submit';

                        if (
                          supplyData?.approval_status == 1 ||
                          supplyData?.approval_status == 2 ||
                          unsoldReturnId === 0
                        ) {
                          statusOfReq = 'Submit';
                        } else {
                          statusOfReq = 'Edit';
                        }

                        submitAction(1, statusOfReq);
                      } else {
                        alert('Supply not found.');
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.canclebtn,
                        {
                          opacity: !submitEnable ? 1 : 0.3,
                          borderColor:
                            supplyData?.approval_status == 1
                              ? 'lightgrey'
                              : '#DA0B0B',
                          backgroundColor:
                            supplyData?.approval_status == 1
                              ? 'lightgrey'
                              : 'white',
                        },
                      ]}
                    >
                      {/* <Text
                      style={[
                        styles.canclebtntext,
                        {
                          color:
                            supplyData?.approval_status == 1
                              ? 'white'
                              : '#DA0B0B',
                        },
                      ]}>
                      SUBMIT
                    </Text> */}

                      {supplyData?.approval_status == 1 ||
                      supplyData?.approval_status == 2 ||
                      unsoldReturnId === 0 ? (
                        <Text
                          style={[
                            styles.canclebtntext,
                            {
                              color:
                                supplyData?.approval_status == 1
                                  ? 'white'
                                  : '#DA0B0B',
                            },
                          ]}
                        >
                          SUBMIT
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.canclebtntext,
                            {
                              color:
                                supplyData?.approval_status == 1
                                  ? 'white'
                                  : '#DA0B0B',
                            },
                          ]}
                        >
                          Edit
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* <TouchableOpacity
                disabled={
                  submitEnable ||
                  disableButton ||
                  supplyData?.approval_status == 1 ||
                  supplyData?.approval_status == 2 ||
                  unsoldReturnId === 0
                }
                onPress={() => {
                  if (supplyData?.total_supply > 0) {
                    submitAction(2);
                  } else {
                    alert('Supply not found.');
                  }
                }}>
                <View
                  style={[
                    styles.logoutBtn1,
                    {
                      opacity: !submitEnable ? 1 : 0.3,
                      backgroundColor:
                        supplyData?.approval_status == 1 ||
                        supplyData?.approval_status == 2 ||
                        unsoldReturnId === 0
                          ? 'lightgrey'
                          : '#DA0B0B',
                    },
                  ]}>
                  <Text style={styles.btnText}>ADD NEW</Text>
                </View>
              </TouchableOpacity> */}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default UnsoldRetun;
