
package com.infiniteautomation.mango.rest.latest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infiniteautomation.mango.pointList.model.PointListModel;
import com.infiniteautomation.mango.pointList.service.PointListService;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
import com.infiniteautomation.mango.rest.latest.websocket.DaoNotificationWebSocketHandler;
import com.infiniteautomation.mango.rest.latest.websocket.WebSocketMapping;
import com.infiniteautomation.mango.spring.events.DaoEvent;
import com.serotonin.m2m2.vo.permission.PermissionHolder;

@Component
@WebSocketMapping("/websocket/point-list")
public class PointListWebSocketHandler extends DaoNotificationWebSocketHandler<PointListVO> {

    private final PointListService service;

    @Autowired
    public PointListWebSocketHandler(PointListService service) {
        this.service = service;
    }

    @Override
    protected boolean hasPermission(PermissionHolder user, PointListVO vo) {
        try{
            service.ensureReadPermission(user, vo);
            return true;
        }catch(Exception e) {
            return false;
        }
    }

    @Override
	protected Object createModel(PointListVO vo, ApplicationEvent event, PermissionHolder user) {
        return new PointListModel(vo);
    }

    //TODO override notify to send notification with initiatorId = (socketSessionId or userId)
    @Override
    @EventListener
    protected void handleDaoEvent(DaoEvent<? extends PointListVO> event) {
        this.notify(event);
    }
}
