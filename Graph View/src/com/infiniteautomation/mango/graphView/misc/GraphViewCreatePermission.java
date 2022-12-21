
package com.infiniteautomation.mango.graphView.misc;

import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.PermissionDefinition;


public class GraphViewCreatePermission  extends PermissionDefinition {

    public static final String PERMISSION = "graphView.create";

    @Override
    public String getPermissionTypeName() {
        return PERMISSION;
    }

    @Override
    public TranslatableMessage getDescription() {
        return new TranslatableMessage("graphView.permission.create");
    }

}
