package com.infiniteautomation.mango.graphView.misc;

import java.util.List;

import com.infiniteautomation.mango.wiseifUI.misc.WiseIfLicenseChecker;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.license.ITimedLicenseDefinition;

public class GraphViewTimedLicenseDefinition implements ITimedLicenseDefinition {
    private boolean licensed;

    public GraphViewTimedLicenseDefinition() {
        this.licensed = false;
    }

    public void addLicenseErrors(final List<TranslatableMessage> errors) {
        if (!this.licensed) {
            errors.add(new TranslatableMessage("graphView.event.freeModeSimple"));
        }
    }

    public void addLicenseWarnings(final List<TranslatableMessage> warnings) {

    }

    public long licenseCheck() {
        this.licensed = WiseIfLicenseChecker.checkLicense("graphView");
        return this.licensed ? -1L : Common.getMillis(3, 2);
    }

    public String getShutdownDescriptionKey() {
        return "graphView.event.freeMode";
    }
}
