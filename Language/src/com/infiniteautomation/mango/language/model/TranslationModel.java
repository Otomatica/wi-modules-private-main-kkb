package com.infiniteautomation.mango.language.model;

import java.util.Map;

public class TranslationModel {
    
    private Map<String,String> translations;
    private String fileName;
    
    public Map<String,String> getTranslations() {
        return translations;
    }
    
    public void setTranslations(Map<String,String> translations) {
        this.translations = translations;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
