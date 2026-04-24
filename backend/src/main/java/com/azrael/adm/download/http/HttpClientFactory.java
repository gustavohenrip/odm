package com.azrael.adm.download.http;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.concurrent.Executors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HttpClientFactory {

    @Bean
    public HttpClient admHttpClient() {
        return HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(30))
                .version(HttpClient.Version.HTTP_2)
                .executor(Executors.newCachedThreadPool())
                .build();
    }
}
