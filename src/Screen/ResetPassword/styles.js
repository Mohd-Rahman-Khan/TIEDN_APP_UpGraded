import {StyleSheet, Dimensions} from 'react-native';

export default StyleSheet.create({
  logo: {
    alignItems: 'center',
  },
  logodesign: {
    marginTop: 51,
    //left: 65,
    width: 279,
  },
  TextInput: {
    marginTop: 10,
    height: 53,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    borderColor: '#707070',
    borderWidth: 1,
    paddingLeft: 15,
    borderRadius: 5,
  },
  loginBtn: {
    backgroundColor: '#da0b0b',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 30,
    // width: '89%',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
  },
  inputFieldContainer: {
    alignItems: 'center',
    marginTop: 50,
    justifyContent: 'center',
  },
  cellStyle: {
    borderBottomColor: 'red',
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textStyle: {
    fontSize: 18,
    color: 'red',
  },
});
