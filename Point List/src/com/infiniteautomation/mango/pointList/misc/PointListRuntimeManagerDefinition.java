package com.infiniteautomation.mango.pointList.misc;

import com.serotonin.m2m2.module.RuntimeManagerDefinition;
import com.serotonin.m2m2.module.license.ITimedLicenseDefinition;
import com.serotonin.m2m2.module.license.ITimedLicenseRegistrar;
import com.serotonin.provider.Providers;

public class PointListRuntimeManagerDefinition extends RuntimeManagerDefinition
{
    public int getInitializationPriority() {
        return 12;
    }
    
    public void preInitialize() {
        ((ITimedLicenseRegistrar)Providers.get((Class)ITimedLicenseRegistrar.class)).registerTimedLicense((ITimedLicenseDefinition)new PointListTimedLicenseDefinition());
    }

    @Override
    public void initialize(final boolean safe) {
    }

    @Override
    public void terminate() {
        // TODO Auto-generated method stub
        
    }
}
