package com.infiniteautomation.mango.overview.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class OverviewAnguarJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/overview.js";
    }
}