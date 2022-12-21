
package com.infiniteautomation.mango.rest.latest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infiniteautomation.mango.graphView.model.GraphViewModel;
import com.infiniteautomation.mango.graphView.service.GraphViewService;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.rest.latest.websocket.DaoNotificationWebSocketHandler;
import com.infiniteautomation.mango.rest.latest.websocket.WebSocketMapping;
import com.infiniteautomation.mango.spring.events.DaoEvent;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

@Component
@WebSocketMapping("/websocket/graph-view")
public class GraphViewWebSocketHandler extends DaoNotificationWebSocketHandler<GraphViewVO> {

    private final GraphViewService service;

    @Autowired
    public GraphViewWebSocketHandler(GraphViewService service) {
        this.service = service;
    }

    @Override
    protected boolean hasPermission(PermissionHolder user, GraphViewVO vo) {
        try{
            service.ensureReadPermission(user, vo);
            return true;
        }catch(Exception e) {
            return false;
        }
    }

    @Override
	protected Object createModel(GraphViewVO vo, ApplicationEvent event, PermissionHolder user) {
        return new GraphViewModel(vo);
    }

    //TODO override notify to send notification with initiatorId = (socketSessionId or userId)
    @Override
    @EventListener
    protected void handleDaoEvent(DaoEvent<? extends GraphViewVO> event) {
        this.notify(event);
    }
}
