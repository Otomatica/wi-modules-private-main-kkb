
package com.infiniteautomation.mango.graphView.misc;

import org.apache.commons.lang3.StringUtils;

import com.infiniteautomation.mango.emport.ImportContext;
import com.infiniteautomation.mango.graphView.dao.GraphViewDao;
import com.infiniteautomation.mango.graphView.service.GraphViewService;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.util.exception.NotFoundException;
import com.infiniteautomation.mango.util.exception.ValidationException;
import com.serotonin.json.JsonException;
import com.serotonin.json.type.JsonObject;
import com.serotonin.json.type.JsonValue;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.i18n.TranslatableJsonException;
import com.serotonin.m2m2.module.EmportDefinition;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

public class GraphViewEmportDefinition extends EmportDefinition {
    
    @Override
    public String getElementId() {
        return "graphView";
    }

    @Override
    public String getDescriptionKey() {
        return "header.graphView";
    }

    @Override
    public Object getExportData() {
        return GraphViewDao.getInstance().getAll();
    }

    @Override
    public void doImport(JsonValue jsonValue, ImportContext importContext, PermissionHolder importer) throws JsonException {
        GraphViewService service = Common.getBean(GraphViewService.class);
        JsonObject graphViewJson = jsonValue.toJsonObject();

        String xid = graphViewJson.getString("xid");
        if (StringUtils.isBlank(xid))
            xid = service.generateUniqueXid();
        
        GraphViewVO vo = null;
        try {
            vo = service.get(xid);
        }
        catch(NotFoundException e) {}
        boolean isnew = false;
        if (vo == null) {
            isnew = true;
            vo = new GraphViewVO();
            vo.setXid(xid);
        }

        try {
            importContext.getReader().readInto(vo, graphViewJson);
            if(isnew) service.insert(vo);
            else service.update(vo.getId(), vo);
            importContext.addSuccessMessage(isnew, "emport.graphView.prefix", xid);
        } 
        catch(ValidationException e) {
            importContext.copyValidationMessages(e.getValidationResult(), "emport.graphView.prefix", xid);
        }
        catch (TranslatableJsonException e) {
            importContext.getResult().addGenericMessage("emport.graphView.prefix", xid, e.getMsg());
        }
        catch (JsonException e) {
            importContext.getResult().addGenericMessage("emport.graphView.prefix", xid, importContext.getJsonExceptionMessage(e));
        }
        
    }
}
