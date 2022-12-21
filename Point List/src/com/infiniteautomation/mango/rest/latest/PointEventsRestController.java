
package com.infiniteautomation.mango.rest.latest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;

import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.infiniteautomation.mango.db.tables.Events;
import com.infiniteautomation.mango.rest.latest.model.RestModelMapper;
import com.infiniteautomation.mango.rest.latest.model.StreamedArray;
import com.infiniteautomation.mango.rest.latest.model.StreamedArrayWithTotal;
import com.infiniteautomation.mango.rest.latest.model.StreamedVORqlQueryWithTotal;
import com.infiniteautomation.mango.rest.latest.model.event.EventInstanceModel;
import com.infiniteautomation.mango.spring.service.DataPointService;
import com.infiniteautomation.mango.spring.service.EventInstanceService;
import com.infiniteautomation.mango.util.RQLUtils;
import com.serotonin.m2m2.vo.DataPointVO;
import com.serotonin.m2m2.vo.User;
import com.serotonin.m2m2.vo.event.EventInstanceVO;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import net.jazdw.rql.parser.ASTNode;


@Api(value = "PointEvents")
@RestController()
@RequestMapping("/point-events")
public class PointEventsRestController {

    private final EventInstanceService service;
    private final BiFunction<EventInstanceVO, User, EventInstanceModel> map;
    private final Map<String, Function<Object, Object>> valueConverters;
    private final Map<String, Field<?>> fieldMap;
    private final DataPointService dataPointService;
    
    @Autowired
    public PointEventsRestController(RestModelMapper modelMapper, EventInstanceService service, DataPointService dataPointService) {
        this.service = service;
        this.map = (vo, user) -> {
            return modelMapper.map(vo, EventInstanceModel.class, user);
        };

        this.valueConverters = new HashMap<>();
        this.fieldMap = new EventTableRqlMappings();

        this.dataPointService = dataPointService;
    }
    
    @ApiOperation(
            value = "Find Events by pointRql",
            notes = "",
            response = EventInstanceModel.class,
            responseContainer = "List"
            )
    @RequestMapping(method = RequestMethod.POST, value="/custom-query")
    public EventPointResponse customQuery(
            @RequestBody PointEventQuery body, 
            @AuthenticationPrincipal User user) {
        
        
        List<Integer> pointIds = new ArrayList<>();
        StreamedArrayWithTotal eventResult = null;
        ASTNode query = createQuery(user, body, pointIds);
        
        if(query == null) {
            eventResult = new StreamedArrayWithTotal() {
                @Override
                public StreamedArray getItems() {
                    return null;
                }
                @Override
                public int getTotal() {
                    return 0;
                }
            };
        }
        else {
            eventResult = doQuery(query, user);
        }
        return new EventPointResponse(pointIds, eventResult);
    }
    
    //Overrided
    private ASTNode createQuery(User user, PointEventQuery body, List<Integer> pointIds) {
        List<Object> args = new ArrayList<>();
        args.add("typeRef1");
        
        if(body.pointIds == null) {
            ASTNode pointRql = RQLUtils.parseRQLtoAST(body.getPointsRql());
            pointRql = addAndRestriction(pointRql, new ASTNode("limit", 1000000));
            dataPointService.customizedQuery(pointRql, new Consumer<DataPointVO>() {
				@Override
				public void accept(DataPointVO vo) {
                    pointIds.add(vo.getId());
				}
            });
        }
        else {
            pointIds.addAll(body.pointIds);
        }
        args.add(pointIds);
        
        String eventsRql = body.getEventsRql();
        if(args.size() > 1 && eventsRql != null && !eventsRql.equals("undefined")) {
            ASTNode pointQuery = new ASTNode("in", args);
            ASTNode eventRql = RQLUtils.parseRQLtoAST(eventsRql);
            eventRql = addAndRestriction(pointQuery, eventRql);
            return eventRql;
        } else {
            return null;
        }
    }
    
    private ASTNode addAndRestriction(ASTNode query, ASTNode restriction){
        //Root query node
        ASTNode root = null;

        if(query == null){
            root = restriction;
        }else if(query.getName().equalsIgnoreCase("and")){
            root = query.addArgument(restriction);
        }else{
            root = new ASTNode("and", restriction, query);
        }
        return root;
    }

    private StreamedArrayWithTotal doQuery(ASTNode rql, User user) {
        //if (service.getPermissionService().hasAdminRole(user)) { -- TODO - check this
        if(true) {
            return new StreamedVORqlQueryWithTotal<>(service, rql, null, fieldMap, valueConverters, item -> true, vo -> map.apply(vo, user));
        } else {
            return new StreamedVORqlQueryWithTotal<>(service, rql, null, fieldMap, valueConverters, item -> service.hasReadPermission(user, item), vo -> map.apply(vo, user));
        }
    }

    public static class EventTableRqlMappings extends HashMap<String, Field<?>> {

        private static final long serialVersionUID = 1L;

        public EventTableRqlMappings() {
        	
            //Setup any exposed special query aliases to map model fields to db columns
            this.put("activeTimestamp", Events.EVENTS.activeTs);
            this.put("rtnTimestamp",Events.EVENTS.rtnTs);
            this.put("userNotified", Events.EVENTS.ackUserId); // silenced - bu kolon yok eskiden de yokmus, check check -- onurc 
            this.put("acknowledged", Events.EVENTS.ackTs);
            this.put("acknowledgedTimestamp", Events.EVENTS.ackTs);
            this.put("eventType", Events.EVENTS.typeName);
            this.put("referenceId1", Events.EVENTS.typeRef1);
            this.put("referenceId2", Events.EVENTS.typeRef2);
            this.put("acknowledged", Events.EVENTS.ackTs);
            this.put("active", Events.EVENTS.rtnTs);
        }

    }
    
    public static class PointEventQuery {
        private String pointsRql;
        private String eventsRql;
        private List<Integer> pointIds;

        public String getPointsRql() {
            return pointsRql;
        }
        public void setPointsRql(String pointsRql) {
            this.pointsRql = pointsRql;
        }
        public String getEventsRql() {
            return eventsRql;
        }
        public void setEventsRql(String eventsRql) {
            this.eventsRql = eventsRql;
        }
        
        public List<Integer> getPointIds() {
            return pointIds;
        }

        public void setPointIds(List<Integer> pointIds) {
            this.pointIds = pointIds;
        }
    }
    
    public static class EventPointResponse {
        private List<Integer> pointIds = null;
        private StreamedArrayWithTotal events = null;
        
        public EventPointResponse(List<Integer> pointIds, StreamedArrayWithTotal events) {
            this.setPointIds(pointIds);
            this.setEvents(events);
        }

        public List<Integer> getPointIds() {
            return pointIds;
        }

        public void setPointIds(List<Integer> pointIds) {
            this.pointIds = pointIds;
        }

        public StreamedArrayWithTotal getEvents() {
            return events;
        }

        public void setEvents(StreamedArrayWithTotal events) {
            this.events = events;
        }
    }

}
