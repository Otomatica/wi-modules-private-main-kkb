package com.infiniteautomation.mango.graphView.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class GraphViewAngularJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/graphView.js";
    }
}