package com.azrael.adm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AdmApplication {

    public static void main(String[] args) throws Exception {
        java.nio.file.Files.createDirectories(
            java.nio.file.Paths.get(System.getProperty("user.home"), ".adm")
        );
        SpringApplication.run(AdmApplication.class, args);
    }
}
