package com.infiniteautomation.mango.wiseifUI.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class WiseifUIAngularJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/wiseifUI.js";
    }
}