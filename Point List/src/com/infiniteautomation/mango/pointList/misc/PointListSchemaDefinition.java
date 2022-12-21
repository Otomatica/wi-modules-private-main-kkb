
package com.infiniteautomation.mango.pointList.misc;

import java.util.List;

import org.jooq.Table;

import com.infiniteautomation.mango.pointList.model.DefaultSchema;
import com.serotonin.m2m2.module.DatabaseSchemaDefinition;

public class PointListSchemaDefinition extends DatabaseSchemaDefinition {
    
    public static final String TABLE_NAME = "pointList";
    
    @Override
    public String getNewInstallationCheckTableName() {
        return TABLE_NAME;
    }


    @Override
    public String getUpgradePackage() {
        return "com.infiniteautomation.mango.pointList.misc.upgrade";
    }

    @Override
    public int getDatabaseSchemaVersion() {
        return 1;
    }

	@Override
	public List<Table<?>> getTablesForConversion() {
        return DefaultSchema.DEFAULT_SCHEMA.getTables();
	}

}

