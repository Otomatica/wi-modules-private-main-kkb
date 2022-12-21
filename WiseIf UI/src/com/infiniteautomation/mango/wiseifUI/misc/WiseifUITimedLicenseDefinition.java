package com.infiniteautomation.mango.wiseifUI.misc;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import java.util.List;
import com.serotonin.m2m2.module.license.ITimedLicenseDefinition;

public class WiseifUITimedLicenseDefinition implements ITimedLicenseDefinition {
    private boolean licensed;

    public WiseifUITimedLicenseDefinition() {
        this.licensed = false;
    }

    public void addLicenseErrors(final List<TranslatableMessage> errors) {
        if (!this.licensed) {
            errors.add(new TranslatableMessage("wiseifUI.event.freeModeSimple"));
        }
    }

    public void addLicenseWarnings(final List<TranslatableMessage> warnings) {

    }

    public long licenseCheck() {
        this.licensed = WiseIfLicenseChecker.checkLicense("wiseifUI");
        return this.licensed ? -1L : Common.getMillis(3, 2);
    }

    public String getShutdownDescriptionKey() {
        return "wiseifUI.event.freeMode";
    }
}
