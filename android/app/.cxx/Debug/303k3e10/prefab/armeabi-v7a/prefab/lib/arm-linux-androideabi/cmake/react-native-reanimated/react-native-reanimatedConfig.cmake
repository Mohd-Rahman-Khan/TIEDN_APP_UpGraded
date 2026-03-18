if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/mohdrahmankhan/Documents/React_Native/TIEDN/TIEDN_IndianExpress_App/node_modules/react-native-reanimated/android/build/intermediates/cxx/Debug/k3w6w3q4/obj/armeabi-v7a/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/mohdrahmankhan/Documents/React_Native/TIEDN/TIEDN_IndianExpress_App/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

