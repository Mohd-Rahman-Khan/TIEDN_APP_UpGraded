import React, {useRef, useState} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {IMultiSelectRef, MultiSelect} from 'react-native-element-dropdown';
import images from '../../Image';

// const data2 = [
//   {label: 'Item 1', value: '1'},
//   {label: 'Item 2', value: '2'},
//   {label: 'Item 3', value: '3'},
//   {label: 'Item 4', value: '4'},
//   {label: 'Item 5', value: '5'},
//   {label: 'Item 6', value: '6'},
//   {label: 'Item 7', value: '7'},
//   {label: 'Item 8', value: '8'},
// ];

const MultiSelectComponent = ({
  headerTitle = '', // optional
  itemHandler, // mandatory
  selectedItem, // mandatory
  data = [], // mandatory
  labelField = 'label', // optional
  valueField = 'value', // optional
  placeholder = 'Select', // optional
  maxHeight = 300, // optional
  disable = false, // optional
  search,
  searchPlaceholder = 'Search...',
  selected,
  setSelected,
  maxSelect,
  depotSelect,
  renderSelectedItem,
}) => {
  //const [selected, setSelected] = useState([]);
  const ref = useRef(null);

  const onSelectAll = (isSelectAll = true) => {
    const selectItem = [];
    if (isSelectAll) {
      data.map(item => {
        selectItem.push(item.value);
      });
    }
    setSelected(selectItem);
  };

  const renderSelectAllIcon = () => {
    const isSelectAll = selected.length === data.length;
    if (depotSelect) {
      return null;
    } else {
      return (
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
          onPress={() => onSelectAll(!isSelectAll)}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '800',
            }}>
            {isSelectAll ? `UnSelect All` : 'Select All'}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dropdownHeading}>{headerTitle}</Text>
      <MultiSelect
        renderItem={(item, selected) => {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              {selected ? (
                <Image
                  source={images.check}
                  style={{height: 14, width: 14, tintColor: 'grey'}}
                />
              ) : (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderWidth: 0.5,
                    borderColor: 'grey',
                    //backgroundColor: selected ? 'black' : 'transparent',
                  }}></View>
              )}

              <Text
                style={{
                  fontSize: 16,
                  color: 'black',
                  fontWeight: '400',
                  marginLeft: 5,
                }}>
                {item?.name}
              </Text>
            </View>
          );
        }}
        maxHeight={300}
        maxSelect={maxSelect}
        visibleSelectedItem={true}
        //inside
        ref={ref}
        style={{
          height: 46,
          width: '100%',
          backgroundColor: 'lightgrey',
          paddingHorizontal: 16,
        }}
        placeholderStyle={{color: '#373435', fontSize: 16, fontWeight: '400'}}
        selectedTextStyle={{
          color: '#373435',
          fontSize: 16,
          fontWeight: '400',
          textTransform: 'capitalize',
        }}
        search
        data={data}
        //excludeItems={excludeItem}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={selected}
        onChange={item => {
          setSelected(item);
        }}
        itemTextStyle={{
          textTransform: 'capitalize',
        }}
        flatListProps={{ListHeaderComponent: renderSelectAllIcon}}
        renderSelectedItem={renderSelectedItem}
      />
    </View>
  );
};

export default MultiSelectComponent;

const styles = StyleSheet.create({
  container: {backgroundColor: 'white', marginTop: 16},
  dropdownHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#373435',
    paddingLeft: 4,
    paddingTop: 4,
    marginBottom: 6,
  },
});
