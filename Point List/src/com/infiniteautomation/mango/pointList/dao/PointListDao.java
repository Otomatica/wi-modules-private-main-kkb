package com.infiniteautomation.mango.pointList.dao;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import org.checkerframework.checker.nullness.qual.NonNull;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infiniteautomation.mango.db.query.ConditionSortLimit;
import com.infiniteautomation.mango.db.tables.MintermsRoles;
import com.infiniteautomation.mango.db.tables.PermissionsMinterms;
import com.infiniteautomation.mango.db.tables.RoleInheritance;
import com.infiniteautomation.mango.permission.MangoPermission;
import com.infiniteautomation.mango.pointList.misc.PointListAuditEvent;
import com.infiniteautomation.mango.pointList.model.PointList;
import com.infiniteautomation.mango.pointList.model.PointListRecord;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
import com.infiniteautomation.mango.spring.DaoDependencies;
import com.infiniteautomation.mango.spring.MangoRuntimeContextConfiguration;
import com.infiniteautomation.mango.spring.service.PermissionService;
import com.infiniteautomation.mango.util.LazyInitSupplier;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.db.dao.AbstractVoDao;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

@Repository
public class PointListDao extends AbstractVoDao<PointListVO, PointListRecord, PointList> {

    private static final Field<Integer> READ_PERMISSION_ALIAS = DSL.field( DSL.name("pl").append("readPermissionId"), SQLDataType.INTEGER.nullable(false));
    private static final Field<Integer> EDIT_PERMISSION_ALIAS = DSL.field( DSL.name("pl").append("editPermissionId"), SQLDataType.INTEGER.nullable(false));
    
    private static final LazyInitSupplier<PointListDao> springInstance = new LazyInitSupplier<>(() -> {
        return Common.getRuntimeContext().getBean(PointListDao.class);
    });
    
    private final PermissionService permissionService;
  
    
    @Autowired
    private PointListDao(DaoDependencies dependencies) {
        
        super(dependencies, PointListAuditEvent.TYPE_NAME, PointList.POINT_LIST, new TranslatableMessage("internal.monitor.POINT_LIST_COUNT"));
        this.permissionService = dependencies.getPermissionService();
    }
    
    public static PointListDao getInstance() {
        return springInstance.get();
    }
    
    @Override
    public void savePreRelationalData(PointListVO existing, PointListVO vo) {
        MangoPermission readPermission = permissionService.findOrCreate(vo.getReadPermission());
        vo.setReadPermission(readPermission);

        MangoPermission editPermission = permissionService.findOrCreate(vo.getEditPermission());
        vo.setEditPermission(editPermission);
    }
    
    @Override
    public void saveRelationalData(PointListVO existing, PointListVO pl) {
        if(existing != null) {
            if(!existing.getReadPermission().equals(pl.getReadPermission())) {
                permissionService.deletePermissions(existing.getReadPermission());
            }
            if(!existing.getEditPermission().equals(pl.getEditPermission())) {
                permissionService.deletePermissions(existing.getEditPermission());
            }
        }
    }
    
    @Override
    public void loadRelationalData(PointListVO pl) {
        pl.setReadPermission(permissionService.get(pl.getReadPermission().getId()));
        pl.setEditPermission(permissionService.get(pl.getEditPermission().getId()));
    }
    
    @Override
    public void deletePostRelationalData(PointListVO vo) {
        permissionService.deletePermissions(vo.getReadPermission(),vo.getEditPermission());
    }
    
    @Override
    public <R extends Record> SelectJoinStep<R> joinPermissions(SelectJoinStep<R> select, PermissionHolder user) {

    	 if(!permissionService.hasAdminRole(user)) {
             List<Integer> roleIds = permissionService.getAllInheritedRoles(user).stream().map(r -> r.getId()).collect(Collectors.toList());

             Condition roleIdsIn = MintermsRoles.MINTERMS_ROLES.roleId.in(roleIds);

             Table<?> mintermsGranted = this.create.select(MintermsRoles.MINTERMS_ROLES.mintermId)
                     .from(MintermsRoles.MINTERMS_ROLES)
                     .groupBy(MintermsRoles.MINTERMS_ROLES.mintermId)
                     .having(DSL.count().eq(DSL.count(
                             DSL.case_().when(roleIdsIn, DSL.inline(1))
                             .else_(DSL.inline((Integer)null))))).asTable("mintermsGranted");

             Table<?> permissionsGranted = this.create.selectDistinct(PermissionsMinterms.PERMISSIONS_MINTERMS.permissionId)
                     .from(PermissionsMinterms.PERMISSIONS_MINTERMS)
                     .join(mintermsGranted).on(mintermsGranted.field(MintermsRoles.MINTERMS_ROLES.mintermId).eq(PermissionsMinterms.PERMISSIONS_MINTERMS.mintermId))
                     .asTable("permissionsGranted");

             select = select.join(permissionsGranted).on(
                     permissionsGranted.field(PermissionsMinterms.PERMISSIONS_MINTERMS.permissionId).in(
                             table.readPermissionId));

         }
         return select;
    }
    
    /**
     * Query points that the user has edit permission for
     * @param conditions
     * @param user
     * @param callback
     */
    public void customizedEditQuery(ConditionSortLimit conditions, PermissionHolder user, Consumer<PointListVO> callback) {
        SelectJoinStep<Record> select = getSelectQuery(getSelectFields());
        select = joinEditPermissions(select, conditions, user);
        customizedQuery(select, conditions.getCondition(), conditions.getSort(), conditions.getLimit(), conditions.getOffset(), callback);
    }

    public <R extends Record> SelectJoinStep<R> joinEditPermissions(SelectJoinStep<R> select, ConditionSortLimit conditions, PermissionHolder user) {

        if(!permissionService.hasAdminRole(user)) {
            List<Integer> roleIds = permissionService.getAllInheritedRoles(user).stream().map(r -> r.getId()).collect(Collectors.toList());

            Condition roleIdsIn = MintermsRoles.MINTERMS_ROLES.roleId.in(roleIds);

            Table<?> mintermsGranted = this.create.select(MintermsRoles.MINTERMS_ROLES.mintermId)
                    .from(MintermsRoles.MINTERMS_ROLES)
                    .groupBy(MintermsRoles.MINTERMS_ROLES.mintermId)
                    .having(DSL.count().eq(DSL.count(
                            DSL.case_().when(roleIdsIn, DSL.inline(1))
                            .else_(DSL.inline((Integer)null))))).asTable("mintermsGranted");

            Table<?> permissionsGranted = this.create.selectDistinct(PermissionsMinterms.PERMISSIONS_MINTERMS.permissionId)
                    .from(PermissionsMinterms.PERMISSIONS_MINTERMS)
                    .join(mintermsGranted).on(mintermsGranted.field(MintermsRoles.MINTERMS_ROLES.mintermId).eq(PermissionsMinterms.PERMISSIONS_MINTERMS.mintermId))
                    .asTable("permissionsGranted");

            select = select.join(permissionsGranted).on(
                    permissionsGranted.field(PermissionsMinterms.PERMISSIONS_MINTERMS.permissionId).in(
                            table.editPermissionId));

        }
        return select;
    	
    }

    @Override
    protected String getXidPrefix() {
        return PointListVO.XID_PREFIX;
    }

    @Override
    protected Record toRecord(PointListVO vo) {
    	
    	 Record record = table.newRecord();
         record.set(table.xid, vo.getXid());
         record.set(table.name, vo.getName());
         record.set(table.context, convertData(vo.getContext()));
         record.set(table.readPermissionId, vo.getReadPermission().getId());
         record.set(table.editPermissionId, vo.getEditPermission().getId());
         return record;
        /* 
        return new PointListRecord(
        		vo.getId(),
                vo.getXid(),
                vo.getName(),
                convertData(vo.getContext()),
                vo.getReadPermission().getId(),
                vo.getEditPermission().getId()
        );
        */
    }

    class PointListRowMapper implements RowMapper<PointListVO> {
        @Override
        public PointListVO mapRow(ResultSet rs, int rowNum) throws SQLException {
            int i = 0;
            PointListVO vo = new PointListVO();
            vo.setId(rs.getInt(++i));
            vo.setXid(rs.getString(++i));
            vo.setName(rs.getString(++i));
            vo.setContext(extractData(rs.getClob(++i)));
            vo.setReadPermission(new MangoPermission(rs.getInt(++i)));
            vo.setEditPermission(new MangoPermission(rs.getInt(++i)));
            return vo;
        }
    }
    
    public JsonNode readValueFromString(String json) throws JsonParseException, JsonMappingException, IOException{
        return getObjectReader(JsonNode.class).readTree(json);
    }
    
    public String writeValueAsString(Object value) throws JsonProcessingException{
        return getObjectWriter(Object.class).writeValueAsString(value);
    }

	@Override
	public @NonNull PointListVO mapRecord(@NonNull Record record) {
		
        PointListVO vo = new PointListVO();
        vo.setId(record.get(table.id));
        vo.setXid(record.get(table.xid));
        vo.setName(record.get(table.name));
        vo.setContext(extractData(record.get(table.context)));
        vo.setReadPermission(new MangoPermission(record.get(table.readPermissionId)));
        vo.setEditPermission(new MangoPermission(record.get(table.editPermissionId)));
        return vo;
	}
}
