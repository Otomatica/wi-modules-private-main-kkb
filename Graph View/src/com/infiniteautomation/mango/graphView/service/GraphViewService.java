package com.infiniteautomation.mango.graphView.service;

import java.util.function.Function;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infiniteautomation.mango.graphView.dao.GraphViewDao;
import com.infiniteautomation.mango.graphView.misc.GraphViewCreatePermission;
import com.infiniteautomation.mango.graphView.model.GraphViewModel;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.rest.latest.model.StreamedArrayWithTotal;
import com.infiniteautomation.mango.rest.latest.model.StreamedVORqlQueryWithTotal;
import com.infiniteautomation.mango.spring.service.AbstractVOService;
import com.infiniteautomation.mango.spring.service.ServiceDependencies;
import com.serotonin.m2m2.module.PermissionDefinition;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

import net.jazdw.rql.parser.ASTNode;

@Service
public class GraphViewService extends AbstractVOService<GraphViewVO, GraphViewDao> {
    
    private final GraphViewCreatePermission createPermission;
    
    @Autowired 
    public GraphViewService(GraphViewDao dao, 
				            ServiceDependencies dependencies,
				            GraphViewCreatePermission createPermission) {
        super(dao, dependencies);
        this.createPermission = createPermission;
    }

//    @Override
//    public boolean hasCreatePermission(PermissionHolder user, GraphViewVO vo) {
//        Set<Role> heldRoles = user.getRoles();
//        if (heldRoles.contains(PermissionHolder.SUPERADMIN_ROLE)) {
//            return true;
//        }
//        return false;
//    }
    
    @Override
    public boolean hasEditPermission(PermissionHolder user, GraphViewVO item) {
        return true;
    }


    @Override
    public boolean hasReadPermission(PermissionHolder user, GraphViewVO item) {
        return true;
    }
    
    @Override
    protected PermissionDefinition getCreatePermission() {
        return createPermission;
    }
    
    public StreamedArrayWithTotal doQuery(ASTNode rql, PermissionHolder user) {
        return new StreamedVORqlQueryWithTotal<>(this, rql, null, null, null, transform);
    }
    
    private final Function<GraphViewVO, Object> transform = item -> {
        return new GraphViewModel(item);
    };

}
