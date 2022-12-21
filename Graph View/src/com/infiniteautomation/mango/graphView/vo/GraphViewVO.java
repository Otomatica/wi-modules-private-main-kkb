package com.infiniteautomation.mango.graphView.vo;

import com.fasterxml.jackson.databind.JsonNode;
import com.serotonin.json.spi.JsonProperty;
import com.serotonin.m2m2.vo.AbstractVO;

public class GraphViewVO extends AbstractVO {

    private static final long serialVersionUID = 1L;
    public static final String XID_PREFIX = "GV_";

    @JsonProperty
    private JsonNode context;

    @Override
    public String getTypeKey() {
        return "event.audit.graphView";
    }
    
    public JsonNode getContext() {
        return context;
    }
    
    public void setContext(JsonNode context) {
        this.context = context;
    }
}
