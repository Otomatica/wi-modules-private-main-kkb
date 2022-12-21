package com.infiniteautomation.mango.pointList.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class PointListAngularJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/pointList.js";
    }
}