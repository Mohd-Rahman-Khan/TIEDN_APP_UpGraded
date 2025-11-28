import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import images from '../../../Image';
import COLORS from '../../../GlobalConstants/COLORS';
import auth from '../../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import _, {subtract} from 'lodash';
import NavigationService from '../../../Navigation/RootNavigator/NavigationService';
import CustomDropdown from '../../../comonent/CustomDropdown';
import {useIsFocused} from '@react-navigation/native';
import AppLoader from '../../../Helper/AppIndicator';

const TODAY_DATE = moment().format('YYYY-MM-DD');

const DURATION_DATA = [
  {
    id: 1,
    name: 'Daily',
  },
  {
    id: 2,
    name: 'Weekly',
  },
  {
    id: 3,
    name: 'Monthly',
  },
  {
    id: 4,
    name: 'Yearly',
  },
];

const widthAndHeight = 270;
const sliceColor =
  // ['#F44336',
  ['#2196F3', '#FFEB3B', '#4CAF50', '#FF9800'];

export default function UnsoldReturnApprovalDashboard({navigation, route}) {
  const roleBasedGrid = route.params?.roleBasedGrid;
  const [recordsArr, setRecordsArr] = useState([]);
  const [startDt, setStartDt] = useState(moment().format('YYYY-MM-DD'));
  // const [durationArr, setDurationArr] = useState(DURATION_DATA);
  const [durationItem, setDurationItem] = useState({});
  const [series, setSeries] = useState([]);
  const [isCirEX, setIsCirEX] = useState(false);
  const [regionArr, setRegionArr] = useState([
    {id: -1, description: 'Please select region...'},
  ]);
  const [regionItem, setRegionItem] = useState(regionArr[0]);
  const [centerArr, setCenterArr] = useState([
    {id: -1, name: 'Please select center...'},
  ]);
  const [centerItem, setCenterItem] = useState(centerArr[0]);
  const [parcelArr, setParcelArr] = useState([]);
  const [parcelItem, setParcelItem] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [isFilterEligible, setIsFilterEligible] = useState(false);
  const [isFilterApply, setIsFilterApply] = useState(false);
  const [filterLbl, setFilterLbl] = useState('Apply Filter');

  const [publicationArr, setPublicationArr] = useState([]);
  const [publicationItem, setPublicationItem] = useState({});
  const [averageFactor, setAverageFactor] = useState(1);
  const isFocused = useIsFocused();
  const [parcelView, showParcelView] = useState(true);
  const [vendorView, showVendorView] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      //setIsFilterApply(!isFilterApply);
      setRecordsArr([]);
    }
  }, [isFocused]);
  useEffect(() => {
    if (isFocused) {
      publicationApi();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      setDurationItem(DURATION_DATA[0]);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      getRecordsTotal();
      //  getRecords({});
      getUserDetails();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (!_.isEmpty(durationItem)) {
        // getRecordsTotal()
        getRecordsTotal();
      }
    }
  }, [durationItem, publicationItem?.id, isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (isFilterApply) {
        setFilterLbl('Reset Filter');
        if (isCirEX) {
          centersApi();
        } else {
          regionApi();
        }
      } else {
        setRegionArr([{id: -1, description: 'Please select region...'}]);
        setRegionItem(regionArr[0]);
        setCenterArr([{id: -1, name: 'Please select center...'}]);
        setCenterItem(centerArr[0]);
        setParcelArr([{id: -1, name: 'Please select parcel region...'}]);
        setFilterLbl('Apply Filter');
      }
    }
  }, [isFilterApply, isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (regionItem?.id != -1) {
        centersApi();
      }
    }
  }, [regionItem, isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (centerItem?.id != -1) {
        parcelRegionApi();
      }
    }
  }, [centerItem, isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (
        (regionItem?.id != -1 || isCirEX) &&
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
    }
  }, [regionItem, centerItem, parcelItem, isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (moment(TODAY_DATE).diff(moment(startDt), 'days') == 0) {
        setAverageFactor(1);
      } else {
        setAverageFactor(moment(TODAY_DATE).diff(moment(startDt), 'days') + 1);
      }
    }
  }, [startDt, isFocused]);

  const publicationApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const response = await auth.publications(token);
    if (response?.status != 200) {
      apiFailureAlert('publicationApi');
    } else {
      setPublicationArr(response.data?.data);
      setPublicationItem(response.data?.data[0]);
    }
  };

  const handleSelectReegion = item => {
    setCenterArr([{id: -1, name: 'Please select center...'}]);
    setParcelArr([{id: -1, name: 'Please select parcel region...'}]);
    setCenterItem({id: -1, name: 'Please select center...'});
    setParcelItem({id: -1, name: 'Please select parcel region...'});
    setRegionItem(item);
  };

  const handleSelectCenter = item => {
    setParcelItem({id: -1, name: 'Please select parcel region...'});
    setParcelArr([{id: -1, name: 'Please select parcel region...'}]);
    setCenterItem(item);
    setRecordsArr([]);
  };

  const handleSelectParcelReegion = item => {
    setParcelItem(item);
  };

  const getUserDetails = async () => {
    const userData1 = await AsyncStorage.getItem('InExUserDetails');
    const userData = JSON.parse(userData1);
    setUserDetails(userData);
    if (
      userData.role === 'Regional Manager' ||
      userData.role === 'Circulation Executive' ||
      userData?.role == 'City Head'
    ) {
      setIsFilterEligible(true);
    }
    if (userData?.role == 'Circulation Executive') {
      setIsCirEX(true);
      centersApi();
    }
  };

  const apiFailureAlert = apiName => {};

  const apiFailureNoDataAlert = apiName => {
    Alert.alert(
      'Information!',
      'No records found.',
      [
        {
          text: 'OK',
          onPress: () => {},
        },
      ],
      {cancelable: false},
    );
  };

  const getUnsildReturnList = async () => {
    setRecordsArr([]);
    setloading(true);
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');

    let dataObj = {
      userId: userId,
      isForMobile: true,
      publicationId: publicationItem?.id,
      startDate: startDt,
      endDate: TODAY_DATE,
      isChart: true,
    };

    const response = await auth.unsoldReturnApprovalList(dataObj, token);
    console.log('getRecords', response);
    setloading(false);

    if (response?.status != 200) {
      apiFailureAlert('getRecords');
    } else {
      setRecordsArr(response.data?.data);
    }
  };

  const getRecordsTotal = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');

    if (publicationItem?.id) {
      getUnsildReturnList();
      let dataObj = {
        userId: userId,
        isForMobile: true,
        publicationId: publicationItem?.id,
        startDate: startDt,
        endDate: TODAY_DATE,
        isChart: true,
      };

      const response = await auth.unsoldReturnApproval(dataObj, token);
      console.log('getRecords', response);

      if (response?.status != 200) {
        apiFailureAlert('getRecords');
      } else {
        const myData = response.data?.data;

        const tempArr = [];
        const NPS =
          myData[0].sum_total_supply -
          myData[0].sum_total_unsold -
          myData[0].sum_total_supply_return;
        // tempArr.push(50, 100, 200)
        tempArr.push(
          myData[0].sum_total_supply >= 0 ? myData[0].sum_total_supply : 0,
          myData[0].sum_total_supply_return >= 0
            ? myData[0].sum_total_supply_return
            : 0,
          myData[0].sum_total_unsold >= 0 ? myData[0].sum_total_unsold : 0,
          NPS >= 0 ? NPS : 0,
        );
        setSeries(tempArr);
      }
      // await unsoldReturnApproval()
    }
  };

  const getRecords = async request => {
    setRecordsArr([]);
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');
    let dataObj = {
      userId: userId,
      isForMobile: true,
    };
    if (isFilterApply) {
      dataObj = {...dataObj, ...request};
    }
    const response = await auth.unsoldReturnApproval(dataObj, token);
    console.log('getRecords', response);

    if (response?.status == 404) {
      setRecordsArr([]);
      apiFailureNoDataAlert('getRecords');
    } else if (response?.status != 200) {
      apiFailureAlert('getRecords');
    } else {
      setRecordsArr(response.data?.data);
    }
  };

  const regionApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');
    const response = await auth.collectionRegion(userId, token);
    if (response?.status != 200) {
      apiFailureAlert('regionApi');
    } else {
      setRegionArr(prev => [prev[0], ...response.data?.data]);
    }
  };

  const centersApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');
    const userId = await AsyncStorage.getItem('InExUserId');

    let response = null;
    if (isCirEX) {
      response = await auth.collectionCentersRegionUserId(userId, token);
    } else {
      response = await auth.collectionCentersRegion(regionItem?.id, token);
    }

    if (response?.status != 200) {
      apiFailureAlert('centersApi');
    } else {
      setCenterArr(prev => [prev[0], ...response.data?.data]);
    }
  };

  const parcelRegionApi = async () => {
    const token = await AsyncStorage.getItem('InExToken');

    const response = await auth.collectionDepotRegion(centerItem?.id, token);

    if (response?.status != 200) {
      apiFailureAlert('parcelRegionApi');
    } else {
      // setParcelArr(response.data?.data);
      setParcelArr(prev => [prev[0], ...response.data?.data]);
    }
  };

  const unsoldReturnRenderItemView = item => {
    if (
      !isCirEX &&
      isFilterApply &&
      (regionItem?.id == -1 || centerItem?.id == -1 || _.isEmpty(parcelItem))
    ) {
      return null;
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: COLORS.white,
          borderRadius: 10,
          //height: 85,
          marginVertical: 10,
          paddingLeft: 12,
          paddingRight: 8,
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
          }}
          onPress={() => {
            console.log('userDetails', item.item.data_for);

            if (userDetails?.role == 'Regional Manager') {
              navigation.navigate('UnsoldReturnApproval', {
                roleBasedGrid,
                shipToCode: item.item?.ship_to_code,
                publicationDate: item.item?.publication_date,
                approvalStatus: item?.item?.approval_status,
                parcelItemUserId: parcelItem?.user_id,
                onGoBack: () => {
                  getRecords({userId: parcelItem?.user_id, isFilter: true});
                },
                navigation: navigation,
                userType: item.item?.data_for,
              });
            } else {
              navigation.navigate('UnsoldReturnApproval', {
                roleBasedGrid,
                shipToCode: item.item?.ship_to_code,
                publicationDate: item.item?.publication_date,
                approvalStatus: item?.item?.approval_status,
                parcelItemUserId: parcelItem?.user_id,
                onGoBack: () => {
                  getRecords({userId: parcelItem?.user_id, isFilter: true});
                },
                navigation: navigation,
                userType: null,
              });
            }
          }}>
          <View style={{flex: 0.9}}>
            {parcelView ? (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: COLORS.black,
                }}>
                {item.item?.user_name}
              </Text>
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: COLORS.black,
                  paddingBottom: 4,
                }}>
                {item.item?.user_name}
              </Text>
            )}

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              {parcelView ? (
                <View />
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: COLORS.black,
                  }}>
                  {'SHIP TO CODE : ' + item.item?.ship_to_code}
                </Text>
              )}

              <View style={{width: 70}}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: COLORS.black,
                    textAlign: 'center',
                  }}>
                  {item.item?.approval_status == '0,1,2' ||
                  item.item?.approval_status == '1,2' ||
                  item.item?.approval_status == '0,1'
                    ? 'Partially Approved'
                    : item.item?.approval_status == '1'
                      ? 'Approved'
                      : item.item?.approval_status == '2'
                        ? 'Rejected'
                        : 'Pending'}
                </Text>
              </View>
            </View>
            <Text
              style={{color: COLORS.black, fontWeight: '500', paddingTop: 4}}>
              {item.item?.publication_date}
            </Text>
          </View>
          <Image
            style={{flex: 0.1, width: 15, height: 15}}
            source={images.rightArrow}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const graphAbbrivationRow = (color, label) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{width: 40, height: 20, backgroundColor: color}} />
        <Text style={{marginLeft: 10, fontWeight: '600'}}>{label}</Text>
      </View>
    );
  };

  const weeklyAverageRowData = (label, value) => {
    return (
      <View style={{flexDirection: 'row', borderWidth: 1}}>
        <Text style={{paddingLeft: 10, width: '48%', fontWeight: '600'}}>
          {label}
        </Text>
        <View
          style={{
            width: '52%',
            borderWidth: 1,
            borderRightColor: 'white',
            borderTopColor: 'white',
            borderBottomColor: 'white',
          }}>
          <Text style={{paddingLeft: 10, fontWeight: '600'}}>
            {(value / averageFactor)?.toFixed(0)}
          </Text>
        </View>
      </View>
    );
  };

  const weeklyAverageview = () => {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {weeklyAverageRowData('Supply', `${series.length > 0 ? series[0] : 0}`)}
        {weeklyAverageRowData('Return', `${series.length > 0 ? series[1] : 0}`)}
        {weeklyAverageRowData(
          'Fresh Unsold',
          `${series.length > 0 ? series[2] : 0}`,
        )}
        {weeklyAverageRowData('NPS', `${series.length > 0 ? series[3] : 0}`)}
      </View>
    );
  };

  const graphView = () => {
    if (userDetails?.role == 'City Head') {
      return null;
    } else {
      return (
        <View
          style={{
            backgroundColor: COLORS.white,
            marginBottom: 20,
            borderRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              marginLeft: 10,
              marginRight: 4,
            }}>
            <View style={{flex: 1}}>
              {graphAbbrivationRow(
                '#2196F3',
                `Supply - ${series.length > 0 && (series[0] / averageFactor)?.toFixed(0)}`,
              )}
              {graphAbbrivationRow(
                '#FFEB3B',
                `Return- ${series.length > 0 && (series[1] / averageFactor)?.toFixed(0)}`,
              )}
              {graphAbbrivationRow(
                '#4CAF50',
                `Fresh Unsold- ${series.length > 0 && (series[2] / averageFactor)?.toFixed(0)}`,
              )}
              {graphAbbrivationRow(
                '#FF9800',
                `NPS- ${series.length > 0 && (series[3] / averageFactor)?.toFixed(0)}`,
              )}
            </View>
          </View>
        </View>
      );
    }
  };

  const filterView = () => {
    return (
      <View>
        <View style={{flex: 1}}>
          <CustomDropdown
            headerTitle="Select Publication"
            data={publicationArr}
            selectedItem={publicationItem?.name}
            itemHandler={item => {
              setPublicationItem(item);
            }}
            search={true}
          />
        </View>
        {!isCirEX && (
          <CustomDropdown
            labelField="description"
            valueField="description"
            data={regionArr}
            selectedItem={regionItem?.description}
            itemHandler={item => {
              handleSelectReegion(item);
            }}
            search={true}
          />
        )}
        {regionItem?.id != -1 || isCirEX ? (
          <CustomDropdown
            data={centerArr}
            selectedItem={centerItem?.name}
            itemHandler={item => {
              handleSelectCenter(item);
            }}
            search={true}
          />
        ) : null}
        {centerItem?.id != -1 ? (
          <CustomDropdown
            data={parcelArr}
            selectedItem={parcelItem?.name}
            itemHandler={item => {
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
      // <View style={{alignItems: 'flex-end', marginRight: 6}}>
      //   <TouchableOpacity
      //     onPress={() => {
      //       if (isFilterApply) {
      //         getUnsildReturnList();
      //         setRecordsArr([]);
      //       }
      //       setIsFilterApply(!isFilterApply);
      //     }}>
      //     <Text style={{color: 'blue', textDecorationLine: 'underline'}}>
      //       {filterLbl}
      //     </Text>
      //   </TouchableOpacity>
      // </View>
      null
    );
  };

  const listHeaderView = () => {
    return (
      <View>
        {isFilterEligible && applyFilterView()}
        {isFilterApply && filterView()}
        {/* {filterView()} */}
      </View>
    );
  };

  const unsoldReturnView = () => {
    return (
      <View style={{marginHorizontal: 12, marginTop: 12}}>
        {userDetails?.role == 'Circulation Executive' ? (
          parcelView ? (
            <>
              <FlatList
                data={recordsArr}
                //ListHeaderComponent={listHeaderView()}
                renderItem={item => unsoldReturnRenderItemView(item)}
                showsVerticalScrollIndicator={false}
              />
              {recordsArr?.length > 0 ? null : (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                    List is empty.
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <FlatList
                data={recordsArr}
                ListHeaderComponent={listHeaderView()}
                renderItem={item => unsoldReturnRenderItemView(item)}
                showsVerticalScrollIndicator={false}
              />
              {recordsArr?.length > 0 ? null : (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                    List is empty.
                  </Text>
                </View>
              )}
            </>
          )
        ) : (
          <>
            <FlatList
              data={recordsArr}
              ListHeaderComponent={listHeaderView()}
              renderItem={item => unsoldReturnRenderItemView(item)}
              showsVerticalScrollIndicator={false}
            />
            {recordsArr?.length > 0 ? null : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  List is empty.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View>
      <AppLoader visible={loading} />
      {userDetails?.role == 'Circulation Executive' ? (
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={() => {
              showParcelView(true);
              showVendorView(false);
              getUnsildReturnList();
              setIsFilterApply(!isFilterApply);
            }}
            style={{
              width: '50%',
              borderBottomColor: parcelView ? 'red' : COLORS.lightGreyBorder,
              borderBottomWidth: 2,
              paddingVertical: 10,
              paddingHorizontal: 10,
              //backgroundColor: 'white',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: parcelView ? 'black' : COLORS.modalColor,
              }}>
              Approval Parcel Req.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showParcelView(false);
              showVendorView(true);
              setRecordsArr([]);
              setIsFilterApply(!isFilterApply);
            }}
            style={{
              width: '50%',
              borderBottomColor: vendorView ? 'red' : COLORS.lightGreyBorder,
              borderBottomWidth: 2,
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: parcelView ? 'black' : COLORS.modalColor,
              }}>
              Approval Depo Req.
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {unsoldReturnView()}
    </View>
  );
}

// ??? weekly dropdown
// ??? login functionality enable on minimise -- least priority
