
package com.infiniteautomation.mango.graphView.misc;

import java.util.List;

import org.jooq.Table;

import com.infiniteautomation.mango.graphView.model.DefaultSchema;
import com.serotonin.m2m2.module.DatabaseSchemaDefinition;

public class GraphViewSchemaDefinition extends DatabaseSchemaDefinition {
    
    public static final String TABLE_NAME = "graphView";
    
    @Override
    public String getNewInstallationCheckTableName() {
        return TABLE_NAME;
    }

    @Override
    public String getUpgradePackage() {
        return "com.infiniteautomation.mango.graphView.misc.upgrade";
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