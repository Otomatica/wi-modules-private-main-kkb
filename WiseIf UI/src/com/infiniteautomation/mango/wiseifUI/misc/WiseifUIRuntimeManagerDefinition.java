package com.infiniteautomation.mango.wiseifUI.misc;

import com.serotonin.m2m2.module.license.ITimedLicenseDefinition;
import com.serotonin.m2m2.module.license.ITimedLicenseRegistrar;
import com.serotonin.provider.Providers;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.module.RuntimeManagerDefinition;

public class WiseifUIRuntimeManagerDefinition extends RuntimeManagerDefinition
{
    public int getInitializationPriority() {
        return 12;
    }
    
    public void preInitialize() {
        ((ITimedLicenseRegistrar)Providers.get((Class)ITimedLicenseRegistrar.class)).registerTimedLicense((ITimedLicenseDefinition)new WiseifUITimedLicenseDefinition());
    }

    @Override
    public void initialize(final boolean safe) {
        String sourcePath = Common.MA_HOME_PATH + "/web/modules/wiseifUI/web/icons";
        String destinationPath = Common.MA_HOME_PATH + "/web/modules/mangoUI/web/img";
        String legacyDestinationPath = Common.MA_HOME_PATH + "/web/images";
        
        //"icon.svg", "logo-light.svg", "logo-light-text.svg", "logo-text.svg", "safari-pinned-tab.svg"
        String[] files = {"logo-light.svg", "logo.svg", "apple-touch-icon.png", "favicon.ico", "icon16.png", "icon32.png", "icon192.png", "icon512.png", "logo.png"};   
        
        try {
            File source = new File(sourcePath + "/" + "favicon.ico");
            File dest = new File(legacyDestinationPath + "/" + "favicon.ico");
            FileUtils.copyFile(source, dest);
            
            for (String file: files) {        
                source = new File(sourcePath + "/" + file);
                dest = new File(destinationPath + "/" + file);
                FileUtils.copyFile(source, dest);
            }
        } catch (IOException e) {}
        
        
        String amchartSourcePath = Common.MA_HOME_PATH + "/web/modules/wiseifUI/web/vendor/amcharts/plugins/export/shapes";
        String amchartDestinationPath = Common.MA_HOME_PATH + "/web/modules/mangoUI/web/vendor/amcharts/plugins/export/shapes";
        
        try {
            File dir = new File(amchartDestinationPath);
            if (!dir.exists()) dir.mkdirs();
            
            for (int i = 1;  i <= 31; i++) {        
                File source = new File(amchartSourcePath + "/" + i + ".svg");
                File dest = new File(amchartDestinationPath + "/" + i + ".svg");
                FileUtils.copyFile(source, dest);
            }
        } catch (IOException e) {}
    }

    @Override
    public void terminate() {
        // TODO Auto-generated method stub
        
    }
}
