package com.infiniteautomation.mango.language.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class LanguageAngularJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/language.js";
    }
}