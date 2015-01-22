LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cheminotc
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../sqlite/ $(LOCAL_PATH)/../jsoncpp/ $(LOCAL_PATH)/../protobuf/
LOCAL_SRC_FILES := cheminotc.cpp protobuf/cheminotBuf.pb.cc
LOCAL_CPP_EXTENSION := .cpp .cc
LOCAL_SHARED_LIBRARIES := jsoncpp sqlite3 protobuf

include $(BUILD_STATIC_LIBRARY)
