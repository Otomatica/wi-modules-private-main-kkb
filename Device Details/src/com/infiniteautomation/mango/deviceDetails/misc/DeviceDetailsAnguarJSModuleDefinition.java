package com.infiniteautomation.mango.deviceDetails.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class DeviceDetailsAnguarJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/deviceDetails.js";
    }
}