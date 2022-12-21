
package com.infiniteautomation.mango.pointList.misc;

import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.PermissionDefinition;


public class PointListCreatePermission extends PermissionDefinition {

    public static final String PERMISSION = "pointList.create";

    @Override
    public String getPermissionTypeName() {
        return PERMISSION;
    }

    @Override
    public TranslatableMessage getDescription() {
        return new TranslatableMessage("pointList.permission.create");
    }

}
