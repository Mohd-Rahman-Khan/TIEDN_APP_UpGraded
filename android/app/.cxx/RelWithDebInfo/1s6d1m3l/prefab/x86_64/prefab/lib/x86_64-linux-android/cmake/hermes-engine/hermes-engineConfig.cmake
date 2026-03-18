if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/mohdrahmankhan/.gradle/caches/8.12/transforms/b1d8cb43a84728e90c9d471d6151884a/transformed/hermes-android-0.78.0-release/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/mohdrahmankhan/.gradle/caches/8.12/transforms/b1d8cb43a84728e90c9d471d6151884a/transformed/hermes-android-0.78.0-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

