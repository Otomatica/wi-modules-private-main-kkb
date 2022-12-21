package com.infiniteautomation.mango.pointList.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
import com.infiniteautomation.mango.rest.latest.model.AbstractVoModel;
import com.infiniteautomation.mango.rest.latest.model.permissions.MangoPermissionModel;

public class PointListModel extends AbstractVoModel<PointListVO> {
    
    private JsonNode context;
    private MangoPermissionModel readPermissions;
    private MangoPermissionModel editPermissions;
    
    public PointListModel() {
        super();
    }

    public PointListModel(PointListVO vo) {
        fromVO(vo);
    }

    @Override
    protected PointListVO newVO() {
        return new PointListVO();
    }
    
    public MangoPermissionModel getReadPermissions() {
        return readPermissions;
    }

    public void setReadPermissions(MangoPermissionModel readPermissions) {
        this.readPermissions = readPermissions;
    }

    public MangoPermissionModel getEditPermissions() {
        return editPermissions;
    }

    public void setEditPermissions(MangoPermissionModel editPermissions) {
        this.editPermissions = editPermissions;
    }
    
    public JsonNode getContext() {
        return context;
    }
    
    public void setContext(JsonNode context) {
        this.context = context;
    }
    
    @Override
    public void fromVO(PointListVO vo) {
        super.fromVO(vo);
        this.context = vo.getContext();
        this.readPermissions = new MangoPermissionModel(vo.getReadPermission());
        this.editPermissions = new MangoPermissionModel(vo.getEditPermission());
    }

    @Override
    public PointListVO toVO() {
        PointListVO vo = super.toVO();
        vo.setContext(context);
        //TODO Mango 4.0 Use ModelMapper.unmap
        if (readPermissions != null) {
            vo.setReadPermission(readPermissions.getPermission());
        }
        //TODO Mango 4.0 Use ModelMapper.unmap
        if (editPermissions != null) {
            vo.setEditPermission(editPermissions.getPermission());
        }
        
        return vo;
    }
}
