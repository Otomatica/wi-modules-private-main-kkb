package com.infiniteautomation.mango.pointList.service;

import java.util.function.Function;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infiniteautomation.mango.pointList.dao.PointListDao;
import com.infiniteautomation.mango.pointList.misc.PointListCreatePermission;
import com.infiniteautomation.mango.pointList.model.PointListModel;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
import com.infiniteautomation.mango.rest.latest.model.StreamedArrayWithTotal;
import com.infiniteautomation.mango.rest.latest.model.StreamedVORqlQueryWithTotal;
import com.infiniteautomation.mango.spring.service.AbstractVOService;
import com.infiniteautomation.mango.spring.service.ServiceDependencies;
import com.serotonin.m2m2.module.PermissionDefinition;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

import net.jazdw.rql.parser.ASTNode;

@Service
public class PointListService extends AbstractVOService<PointListVO, PointListDao> {
    
    private final PointListCreatePermission createPermission;
    
    @Autowired 
    public PointListService(PointListDao dao, 
				            ServiceDependencies dependencies, 
				            PointListCreatePermission createPermission) {
        super(dao, dependencies);
        this.createPermission = createPermission;
    }

//    @Override
//    public boolean hasCreatePermission(PermissionHolder user, PointListVO vo) {
//        Set<Role> heldRoles = user.getRoles();
//        if (heldRoles.contains(PermissionHolder.SUPERADMIN_ROLE)) {
//            return true;
//        }
//        return false;
//    }
    
    @Override
    public boolean hasEditPermission(PermissionHolder user, PointListVO vo) {
        return permissionService.hasPermission(user, vo.getEditPermission());
    }

    @Override
    public boolean hasReadPermission(PermissionHolder user, PointListVO vo) {
        return permissionService.hasPermission(user, vo.getReadPermission());
    }
    
    @Override
    protected PermissionDefinition getCreatePermission() {
        return createPermission;
    }
    
    public StreamedArrayWithTotal doQuery(ASTNode rql, PermissionHolder user) {
        //If we are admin or have overall data source permission we can view all
        if (permissionService.hasAdminRole(user)) {
            return new StreamedVORqlQueryWithTotal<>(this, rql, null, null, null, transform);
        } else {
            return new StreamedVORqlQueryWithTotal<>(this, rql, null, null, null, vo -> hasReadPermission(user, vo), transform);
        }
    }
    
    private final Function<PointListVO, Object> transform = item -> {
        return new PointListModel(item);
    };
    
}
