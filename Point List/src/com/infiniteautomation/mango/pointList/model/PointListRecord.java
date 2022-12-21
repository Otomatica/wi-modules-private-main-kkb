/*
 * This file is generated by jOOQ.
 */
package com.infiniteautomation.mango.pointList.model;


import org.jooq.Field;
import org.jooq.Record6;
import org.jooq.Row6;
import org.jooq.impl.TableRecordImpl;



/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class PointListRecord extends TableRecordImpl<PointListRecord> implements Record6<Integer, String, String, String, Integer, Integer> {

    private static final long serialVersionUID = 1L;

    /**
     * Setter for <code>pointList.id</code>.
     */
    public PointListRecord setId(Integer value) {
        set(0, value);
        return this;
    }

    /**
     * Getter for <code>pointList.id</code>.
     */
    public Integer getId() {
        return (Integer) get(0);
    }

    /**
     * Setter for <code>pointList.xid</code>.
     */
    public PointListRecord setXid(String value) {
        set(1, value);
        return this;
    }

    /**
     * Getter for <code>pointList.xid</code>.
     */
    public String getXid() {
        return (String) get(1);
    }

    /**
     * Setter for <code>pointList.name</code>.
     */
    public PointListRecord setName(String value) {
        set(2, value);
        return this;
    }

    /**
     * Getter for <code>pointList.name</code>.
     */
    public String getName() {
        return (String) get(2);
    }

    /**
     * Setter for <code>pointList.context</code>.
     */
    public PointListRecord setContext(String value) {
        set(3, value);
        return this;
    }

    /**
     * Getter for <code>pointList.context</code>.
     */
    public String getContext() {
        return (String) get(3);
    }

    /**
     * Setter for <code>pointList.readPermissionId</code>.
     */
    public PointListRecord setReadPermissionId(Integer value) {
        set(4, value);
        return this;
    }

    /**
     * Getter for <code>pointList.readPermissionId</code>.
     */
    public Integer getReadPermissionId() {
        return (Integer) get(4);
    }

    /**
     * Setter for <code>pointList.editPermissionId</code>.
     */
    public PointListRecord setEditPermissionId(Integer value) {
        set(5, value);
        return this;
    }

    /**
     * Getter for <code>pointList.editPermissionId</code>.
     */
    public Integer getEditPermissionId() {
        return (Integer) get(5);
    }

    // -------------------------------------------------------------------------
    // Record6 type implementation
    // -------------------------------------------------------------------------

    @Override
    public Row6<Integer, String, String, String, Integer, Integer> fieldsRow() {
        return (Row6) super.fieldsRow();
    }

    @Override
    public Row6<Integer, String, String, String, Integer, Integer> valuesRow() {
        return (Row6) super.valuesRow();
    }

    @Override
    public Field<Integer> field1() {
        return PointList.POINT_LIST.id;
    }

    @Override
    public Field<String> field2() {
        return PointList.POINT_LIST.xid;
    }

    @Override
    public Field<String> field3() {
        return PointList.POINT_LIST.name;
    }

    @Override
    public Field<String> field4() {
        return PointList.POINT_LIST.context;
    }

    @Override
    public Field<Integer> field5() {
        return PointList.POINT_LIST.readPermissionId;
    }

    @Override
    public Field<Integer> field6() {
        return PointList.POINT_LIST.editPermissionId;
    }

    @Override
    public Integer component1() {
        return getId();
    }

    @Override
    public String component2() {
        return getXid();
    }

    @Override
    public String component3() {
        return getName();
    }

    @Override
    public String component4() {
        return getContext();
    }

    @Override
    public Integer component5() {
        return getReadPermissionId();
    }

    @Override
    public Integer component6() {
        return getEditPermissionId();
    }

    @Override
    public Integer value1() {
        return getId();
    }

    @Override
    public String value2() {
        return getXid();
    }

    @Override
    public String value3() {
        return getName();
    }

    @Override
    public String value4() {
        return getContext();
    }

    @Override
    public Integer value5() {
        return getReadPermissionId();
    }

    @Override
    public Integer value6() {
        return getEditPermissionId();
    }

    @Override
    public PointListRecord value1(Integer value) {
        setId(value);
        return this;
    }

    @Override
    public PointListRecord value2(String value) {
        setXid(value);
        return this;
    }

    @Override
    public PointListRecord value3(String value) {
        setName(value);
        return this;
    }

    @Override
    public PointListRecord value4(String value) {
        setContext(value);
        return this;
    }

    @Override
    public PointListRecord value5(Integer value) {
        setReadPermissionId(value);
        return this;
    }

    @Override
    public PointListRecord value6(Integer value) {
        setEditPermissionId(value);
        return this;
    }

    @Override
    public PointListRecord values(Integer value1, String value2, String value3, String value4, Integer value5, Integer value6) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached PointListRecord
     */
    public PointListRecord() {
        super(PointList.POINT_LIST);
    }

    /**
     * Create a detached, initialised PointListRecord
     */
    public PointListRecord(Integer id, String xid, String name, String context, Integer readpermissionid, Integer editpermissionid) {
        super(PointList.POINT_LIST);

        setId(id);
        setXid(xid);
        setName(name);
        setContext(context);
        setReadPermissionId(readpermissionid);
        setEditPermissionId(editpermissionid);
    }
}