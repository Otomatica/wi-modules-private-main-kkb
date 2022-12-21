
package com.infiniteautomation.mango.pointList.misc;

import org.apache.commons.lang3.StringUtils;

import com.infiniteautomation.mango.emport.ImportContext;
import com.infiniteautomation.mango.pointList.dao.PointListDao;
import com.infiniteautomation.mango.pointList.service.PointListService;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
import com.infiniteautomation.mango.util.exception.NotFoundException;
import com.infiniteautomation.mango.util.exception.ValidationException;
import com.serotonin.json.JsonException;
import com.serotonin.json.type.JsonObject;
import com.serotonin.json.type.JsonValue;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.i18n.TranslatableJsonException;
import com.serotonin.m2m2.module.EmportDefinition;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

public class PointListEmportDefinition extends EmportDefinition {
    
    @Override
    public String getElementId() {
        return "pointList";
    }

    @Override
    public String getDescriptionKey() {
        return "header.pointList";
    }

    @Override
    public Object getExportData() {
        return PointListDao.getInstance().getAll();
    }

    @Override
    public void doImport(JsonValue jsonValue, ImportContext importContext, PermissionHolder importer) throws JsonException {
        PointListService service = Common.getBean(PointListService.class);
        JsonObject pointListJson = jsonValue.toJsonObject();

        String xid = pointListJson.getString("xid");
        if (StringUtils.isBlank(xid))
            xid = service.generateUniqueXid();

        PointListVO vo = null;
        try {
            vo = service.get(xid);
        }
        catch(NotFoundException e) {}
        boolean isnew = false;
        if (vo == null) {
            isnew = true;
            vo = new PointListVO();
            vo.setXid(xid);
        }

        try {
            importContext.getReader().readInto(vo, pointListJson);
            if(isnew) service.insert(vo);
            else service.update(vo.getId(), vo);
            importContext.addSuccessMessage(isnew, "emport.pointList.prefix", xid);
        } 
        catch(ValidationException e) {
            importContext.copyValidationMessages(e.getValidationResult(), "emport.pointList.prefix", xid);
        }
        catch (TranslatableJsonException e) {
            importContext.getResult().addGenericMessage("emport.pointList.prefix", xid, e.getMsg());
        }
        catch (JsonException e) {
            importContext.getResult().addGenericMessage("emport.pointList.prefix", xid, importContext.getJsonExceptionMessage(e));
        }
        
    }
}
