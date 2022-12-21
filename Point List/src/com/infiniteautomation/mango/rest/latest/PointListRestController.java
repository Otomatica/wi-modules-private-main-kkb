
package com.infiniteautomation.mango.rest.latest;

import com.infiniteautomation.mango.pointList.model.PointListModel;
import com.infiniteautomation.mango.pointList.service.PointListService;
import com.infiniteautomation.mango.pointList.vo.PointListVO;
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


@Api(value = "Point List Rest Controller")
@RestController()
@RequestMapping("/point-list")
public class PointListRestController {

    private final PointListService service;

    @Autowired
    public PointListRestController(PointListService service) {
        this.service = service;
    }

    @ApiOperation(
            value = "Point list query operation",
            responseContainer = "List",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.GET)
    public StreamedArrayWithTotal query(HttpServletRequest request, @AuthenticationPrincipal User user) {
        ASTNode rql = RQLUtils.parseRQLtoAST(request.getQueryString());
        return service.doQuery(rql, user);
    }

    @ApiOperation(
            value = "Point list get operation",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.GET, value = "/{xid}")
    public ResponseEntity<PointListModel> get(@PathVariable String xid, @AuthenticationPrincipal User user) {
        PointListVO vo = service.get(xid);
        return ResponseEntity.ok(new PointListModel(vo));
    }
    
    @ApiOperation(
            value = "Point list get operation",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.GET, value="/by-id/{id}")
    public ResponseEntity<PointListModel> getById(@PathVariable int id, @AuthenticationPrincipal User user) {
        PointListVO vo = service.get(id);
        return ResponseEntity.ok(new PointListModel(vo));
    }

    @ApiOperation(
            value = "Point list create operation",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<PointListModel> create(@RequestBody PointListModel model, @AuthenticationPrincipal User user) {
        PointListVO vo = service.insert(model.toVO());
        return ResponseEntity.ok(new PointListModel(vo));
    }
    
    @ApiOperation(
            value = "Update a point list",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.PUT, value="/{xid}")
    public ResponseEntity<PointListModel> update(@PathVariable String xid, @RequestBody PointListModel model, @AuthenticationPrincipal User user) {
        PointListVO vo = service.update(xid, model.toVO());
        return ResponseEntity.ok(new PointListModel(vo));
    }

    @ApiOperation(
            value = "Partially update a point list",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.PATCH, value = "/{xid}")
    public ResponseEntity<PointListModel> partialUpdate(@PathVariable String xid, @PatchVORequestBody(service=PointListService.class, modelClass=PointListModel.class) PointListModel model, @AuthenticationPrincipal User user) {
        PointListVO vo = service.update(xid, model.toVO());
        return ResponseEntity.ok(new PointListModel(vo));
    }

    @ApiOperation(
            value = "Delete a point list",
            response = PointListModel.class
    )
    @RequestMapping(method = RequestMethod.DELETE, value="/{xid}")
    public ResponseEntity<PointListModel> delete(@PathVariable String xid, @AuthenticationPrincipal User user) {
        PointListVO vo = service.delete(xid);
        return ResponseEntity.ok(new PointListModel(vo));
    }

}
