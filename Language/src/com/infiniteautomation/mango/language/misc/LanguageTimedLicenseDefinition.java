package com.infiniteautomation.mango.language.misc;

import java.util.List;

import com.infiniteautomation.mango.wiseifUI.misc.WiseIfLicenseChecker;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.license.ITimedLicenseDefinition;

public class LanguageTimedLicenseDefinition implements ITimedLicenseDefinition {
    private boolean licensed;

    public LanguageTimedLicenseDefinition() {
        this.licensed = false;
    }

    public void addLicenseErrors(final List<TranslatableMessage> errors) {
        if (!this.licensed) {
            errors.add(new TranslatableMessage("language.event.freeModeSimple"));
        }
    }

    public void addLicenseWarnings(final List<TranslatableMessage> warnings) {

    }

    public long licenseCheck() {
        this.licensed = WiseIfLicenseChecker.checkLicense("pointList");
        return this.licensed ? -1L : Common.getMillis(3, 2);
    }

    public String getShutdownDescriptionKey() {
        return "language.event.freeMode";
    }
}
