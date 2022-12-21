package com.infiniteautomation.mango.graphView.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.rest.latest.model.AbstractVoModel;

public class GraphViewModel extends AbstractVoModel<GraphViewVO> {

    private JsonNode context;
    
    public GraphViewModel() {
        super();
    }

    public GraphViewModel(GraphViewVO vo) {
        fromVO(vo);
    }

    @Override
    protected GraphViewVO newVO() {
        return new GraphViewVO();
    }
    
    public JsonNode getContext() {
        return context;
    }
    
    public void setContext(JsonNode context) {
        this.context = context;
    }
    
    @Override
    public void fromVO(GraphViewVO vo) {
        super.fromVO(vo);
        this.context = vo.getContext();
    }

    @Override
    public GraphViewVO toVO() {
        GraphViewVO vo = super.toVO();
        vo.setContext(context);
        return vo;
    }
}
