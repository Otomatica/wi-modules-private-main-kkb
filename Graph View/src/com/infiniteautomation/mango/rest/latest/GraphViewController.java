
package com.infiniteautomation.mango.rest.latest;

import com.infiniteautomation.mango.graphView.model.GraphViewModel;
import com.infiniteautomation.mango.graphView.service.GraphViewService;
import com.infiniteautomation.mango.graphView.vo.GraphViewVO;
import com.infiniteautomation.mango.rest.latest.model.StreamedArrayWithTotal;
import com.infiniteautomation.mango.rest.latest.patch.PatchVORequestBody;
import com.infiniteautomation.mango.util.RQLUtils;
import com.serotonin.m2m2.vo.User;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import net.jazdw.rql.parser.ASTNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;


@Api(value = "Graph View Rest Controller")
@RestController()
@RequestMapping("/graph-view")
public class GraphViewController {

    private final GraphViewService service;

    @Autowired
    public GraphViewController(GraphViewService service) {
        this.service = service;
    }

    @ApiOperation(
            value = "Graph view query operation",
            responseContainer = "List",
            response = GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.GET)
    public StreamedArrayWithTotal query(HttpServletRequest request, @AuthenticationPrincipal User user) {
        ASTNode rql = RQLUtils.parseRQLtoAST(request.getQueryString());
        return service.doQuery(rql, user);
    }

    @ApiOperation(
            value = "Graph view get operation",
            response = GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.GET, value = "/{xid}")
    public ResponseEntity<GraphViewModel> get(@PathVariable String xid, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.get(xid);
        return ResponseEntity.ok(new GraphViewModel(vo));
    }
    
    @ApiOperation(
            value = "Graph view get operation",
            response = GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.GET, value="/by-id/{id}")
    public ResponseEntity<GraphViewModel> getById(@PathVariable int id, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.get(id);
        return ResponseEntity.ok(new GraphViewModel(vo));
    }

    @ApiOperation(
            value = "Graph view create operation",
            response = GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<GraphViewModel> create(@RequestBody GraphViewModel model, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.insert(model.toVO());
        return ResponseEntity.ok(new GraphViewModel(vo));
    }
    
    @ApiOperation(
            value = "Update a graph view",
            response=GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.PUT, value="/{xid}")
    public ResponseEntity<GraphViewModel> update(@PathVariable String xid, @RequestBody GraphViewModel model, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.update(xid, model.toVO());
        return ResponseEntity.ok(new GraphViewModel(vo));
    }

    @ApiOperation(
            value = "Partially update a graph view",
            response = GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.PATCH, value = "/{xid}")
    public ResponseEntity<GraphViewModel> partialUpdate(@PathVariable String xid, @PatchVORequestBody(service=GraphViewService.class, modelClass=GraphViewModel.class) GraphViewModel model, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.update(xid, model.toVO());
        return ResponseEntity.ok(new GraphViewModel(vo));
    }

    @ApiOperation(
            value = "Delete a graph view",
            response=GraphViewModel.class
    )
    @RequestMapping(method = RequestMethod.DELETE, value="/{xid}")
    public ResponseEntity<GraphViewModel> delete(@PathVariable String xid, @AuthenticationPrincipal User user) {
        GraphViewVO vo = service.delete(xid);
        return ResponseEntity.ok(new GraphViewModel(vo));
    }

}
