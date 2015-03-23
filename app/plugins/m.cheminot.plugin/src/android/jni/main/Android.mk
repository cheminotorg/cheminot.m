LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := main
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../cheminotc/ $(LOCAL_PATH)/../sqlite/ $(LOCAL_PATH)/../jsoncpp/ $(LOCAL_PATH)/../protobuf/
LOCAL_SHARED_LIBRARIES := cheminotc
LOCAL_SRC_FILES := main.cpp
LOCAL_LDFLAGS += -fopenmp
LOCAL_LDLIBS := -llog -landroid

include $(BUILD_EXECUTABLE)
