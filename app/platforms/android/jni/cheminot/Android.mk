LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := cheminot
LOCAL_C_INCLUDES := $(LOCAL_PATH)/../sqlite/ $(LOCAL_PATH)/../cheminotc/
LOCAL_SHARED_LIBRARIES := sqlite3 cheminotc
LOCAL_SRC_FILES := cheminot.cpp
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)
