package com.email.writer.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.email.writer.model.*;

import lombok.AllArgsConstructor;

import com.email.writer.Service.*;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/api/emailgenerator")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class emailgeneratorController {
   private final emailgeneratorService emailgeneratorService;
  
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
            String emailResponse = emailgeneratorService.generateEmail(emailRequest);
            return ResponseEntity.ok(emailResponse);
        }
}
