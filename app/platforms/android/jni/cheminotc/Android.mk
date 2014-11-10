LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cheminotc
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../sqlite/ $(LOCAL_PATH)/../jsoncpp/
LOCAL_SRC_FILES := cheminotc.cpp
LOCAL_SHARED_LIBRARIES := jsoncpp sqlite3

include $(BUILD_STATIC_LIBRARY)
