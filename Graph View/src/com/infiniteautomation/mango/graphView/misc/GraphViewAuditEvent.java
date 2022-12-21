
package com.infiniteautomation.mango.graphView.misc;

import com.serotonin.m2m2.module.AuditEventTypeDefinition;

public class GraphViewAuditEvent extends AuditEventTypeDefinition {
    
    public static final String TYPE_NAME = "GRAPH_VIEW";

    @Override
    public String getTypeName() {
        return TYPE_NAME;
    }

    @Override
    public String getDescriptionKey() {
        return "event.audit.graphView";
    }
}
