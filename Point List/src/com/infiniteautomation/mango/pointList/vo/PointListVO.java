package com.infiniteautomation.mango.pointList.vo;

import com.fasterxml.jackson.databind.JsonNode;
import com.infiniteautomation.mango.permission.MangoPermission;
import com.serotonin.json.spi.JsonProperty;
import com.serotonin.m2m2.vo.AbstractVO;

public class PointListVO extends AbstractVO {

    private static final long serialVersionUID = 1L;
    public static final String XID_PREFIX = "PL_";
    
    @JsonProperty(readAliases = {"editPermissions"})
    private MangoPermission editPermission = new MangoPermission();
    @JsonProperty(readAliases = {"readPermissions"})
    private MangoPermission readPermission = new MangoPermission();
    
    @JsonProperty
    private JsonNode context;

    @Override
    public String getTypeKey() {
        return "event.audit.pointList";
    }

    public MangoPermission getEditPermission() {
        return editPermission;
    }

    public void setEditPermission(MangoPermission editPermission) {
        this.editPermission = editPermission;
    }

    public MangoPermission getReadPermission() {
        return readPermission;
    }

    public void setReadPermission(MangoPermission readPermission) {
        this.readPermission = readPermission;
    }
    
    public JsonNode getContext() {
        return context;
    }
    
    public void setContext(JsonNode context) {
        this.context = context;
    }
}
