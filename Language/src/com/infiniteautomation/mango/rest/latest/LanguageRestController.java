
package com.infiniteautomation.mango.rest.latest;

import com.infiniteautomation.mango.language.model.TranslationModel;
import com.infiniteautomation.mango.language.service.TranslationService;
import com.serotonin.m2m2.vo.User;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

import java.io.IOException;
import java.net.URISyntaxException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Api(value = "Language Rest Controller")
@RestController()
@RequestMapping("/language")
public class LanguageRestController {
    
    private final TranslationService service;

    @Autowired
    public LanguageRestController(TranslationService service) {
        this.service = service;
    }

    @PreAuthorize("isAdmin()")
    @ApiOperation(
            value = "Save/Update i18n translation",
            response = TranslationModel.class
    )
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<TranslationModel> save(@RequestBody TranslationModel model, @AuthenticationPrincipal User user) throws IOException, URISyntaxException {
        service.save(model);
        return ResponseEntity.ok(model);
    }
    
}
