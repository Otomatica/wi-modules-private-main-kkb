package com.infiniteautomation.mango.graphView.dao;

import java.io.IOException;

import org.checkerframework.checker.nullness.qual.NonNull;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.infiniteautomation.mango.graphView.misc.GraphViewAuditEvent;
import com.infiniteautomation.mango.graphView.model.GraphView;
import com.infiniteautomation.mango.graphView.model.GraphViewRecord;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.spring.DaoDependencies;
import com.infiniteautomation.mango.util.LazyInitSupplier;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.db.dao.AbstractVoDao;
import com.serotonin.m2m2.i18n.TranslatableMessage;

@Repository
public class GraphViewDao extends AbstractVoDao<GraphViewVO, GraphViewRecord, GraphView> {
    
    private static final LazyInitSupplier<GraphViewDao> springInstance = new LazyInitSupplier<>(() -> {
        return Common.getRuntimeContext().getBean(GraphViewDao.class);
    });
    
    @Autowired
    private GraphViewDao(DaoDependencies dependencies) {
        
        super(dependencies, GraphViewAuditEvent.TYPE_NAME, GraphView.GRAPH_VIEW, new TranslatableMessage("internal.monitor.GRAPH_VIEW_COUNT"));
    }

    public static GraphViewDao getInstance() {
        return springInstance.get();
    }
    
    @Override
    protected String getXidPrefix() {
        return GraphViewVO.XID_PREFIX;
    }

    @Override
    protected Record toRecord(GraphViewVO vo) {
        
    	 Record record = table.newRecord();
         record.set(table.xid, vo.getXid());
         record.set(table.name, vo.getName());
         record.set(table.context, convertData(vo.getContext()));
         return record;
    	
    	
    	
    	
    	
    	
    	
    	/*
    	return new GraphViewRecord(
        		vo.getId(),
                vo.getXid(),
                vo.getName(),
                convertData(vo.getContext()));
        */
    }
    
    public JsonNode readValueFromString(String json) throws JsonParseException, JsonMappingException, IOException{
        return getObjectReader(JsonNode.class).readTree(json);
    }
    
    public String writeValueAsString(Object value) throws JsonProcessingException{
        return getObjectWriter(Object.class).writeValueAsString(value);
    }

	@Override
	public @NonNull GraphViewVO mapRecord(@NonNull Record record) {
		
        GraphViewVO vo = new GraphViewVO();
        vo.setId(record.get(table.id));
        vo.setXid(record.get(table.xid));
        vo.setName(record.get(table.name));
        vo.setContext(extractData(record.get(table.context)));
        return vo;
	}
}
