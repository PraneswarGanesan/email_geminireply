package com.email.writer.Service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.email.writer.model.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class emailgeneratorService {
    private final WebClient webClient;

    public emailgeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    public String generateEmail(EmailRequest emailRequest) {


        String geminiApiUrl = "your api url";
        String geminiApiKey = "your api key";
        // Building the promt
        String promt = buildPromt(emailRequest);
        //craft a request to gemini_api
        // {
        //     "contents": [{
        //       "parts":[{"text": "Explain how AI works"}]
        //       }]
        //   } --- request formate --key value pair
        Map<String,Object> requestBody = Map.of(
            "contents", new Object[]{
                Map.of("parts",new Object[]{
                    Map.of("text",promt)
                })
            }
        );

        //do request and get response
        String response = webClient.post().uri(geminiApiUrl + geminiApiKey).header("Content-Type", "application/json").bodyValue(requestBody).retrieve().bodyToMono(String.class).block();
        //return response
        return extractResponseContent(response);
    }
        private String extractResponseContent(String response) {
            try{
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(response);
                return rootNode.path("candidates")
                                .get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text").asText();
            }
            catch(Exception e){
                return "error in processing the request"+e.getMessage();
            }
        }
    
            private String buildPromt(EmailRequest emailRequest) {
                StringBuilder promt = new StringBuilder();
                promt.append("Generate a professional email reply for the following email. Please don't generate a subject line ok...");
                if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
                    promt.append("use a  " + emailRequest.getTone() + "tone ");
                }
                promt.append("\nOrginal email: \n").append(emailRequest.getEmailContent());
                return promt.toString();
            }
}
