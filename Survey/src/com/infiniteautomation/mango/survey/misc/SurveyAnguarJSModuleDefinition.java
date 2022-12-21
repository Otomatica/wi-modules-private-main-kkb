package com.infiniteautomation.mango.survey.misc;

import com.serotonin.m2m2.module.AngularJSModuleDefinition;

public class SurveyAnguarJSModuleDefinition extends AngularJSModuleDefinition {
    @Override
    public String getJavaScriptFilename() {
        return "/angular/survey.js";
    }
}