
package com.infiniteautomation.mango.pointList.misc;

import com.serotonin.m2m2.module.AuditEventTypeDefinition;

public class PointListAuditEvent extends AuditEventTypeDefinition {
    public static final String TYPE_NAME = "POINT_LIST";

    @Override
    public String getTypeName() {
        return TYPE_NAME;
    }

    @Override
    public String getDescriptionKey() {
        return "event.audit.pointList";
    }
}
