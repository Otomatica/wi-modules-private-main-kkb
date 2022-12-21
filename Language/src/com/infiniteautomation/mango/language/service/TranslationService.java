package com.infiniteautomation.mango.language.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;

import org.springframework.stereotype.Service;

import com.infiniteautomation.mango.language.model.TranslationModel;
import com.serotonin.m2m2.Common;

@Service
public class TranslationService {

	// execution: java -cp "lib\*;i18n\" com.serotonin.m2m2.Main
    public synchronized void save(TranslationModel model) throws IOException, URISyntaxException {
        Map<String, String> translations = model.getTranslations();
        //String pathStr = Common.MA_HOME_PATH +"/overrides/classes/"+  model.getFileName();
        String pathStr = 
        		Common.MA_HOME_PATH + File.separator + "i18n" + File.separator + model.getFileName();
//        System.out.println("onurc update received. pathStr:" + pathStr);
        if(translations.size() == 0) {
            Path path = Paths.get(pathStr);
            Files.deleteIfExists(path); 
            return;
        }
        
        OutputStream stream = null; 
        OutputStreamWriter writer = null;
        try{
        	stream = new FileOutputStream(pathStr);
        	writer = new OutputStreamWriter(stream, StandardCharsets.UTF_8);
	        SortedProperties props = new SortedProperties();
	        props.putAll(translations);
	        props.store(writer, null);
        }finally {
            writer.close();
            stream.close();
        }
    }
    
    public class SortedProperties extends Properties {
        private static final long serialVersionUID = 1L;
        /**
         * https://stackoverflow.com/questions/45374114/sorting-the-properties-in-java/45374460#45374460
         * 
         * Overrides, called by the store method.
         */
        @Override
        @SuppressWarnings({"unchecked", "rawtypes"})
        public synchronized Enumeration keys() {
           Enumeration keysEnum = super.keys();
           Vector keyList = new Vector();
           while(keysEnum.hasMoreElements()){
             keyList.add(keysEnum.nextElement());
           }
           Collections.sort(keyList);
           return keyList.elements();
        }
    }

}
