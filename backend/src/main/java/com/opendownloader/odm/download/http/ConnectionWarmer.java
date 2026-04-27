package com.opendownloader.odm.download.http;

import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ConnectionWarmer {

    private static final Logger log = LoggerFactory.getLogger(ConnectionWarmer.class);

    private ConnectionWarmer() { }

    public static void prefetchDns(Collection<URI> uris) {
        Set<String> hosts = new HashSet<>();
        for (URI u : uris) {
            if (u != null && u.getHost() != null) hosts.add(u.getHost());
        }
        for (String host : hosts) {
            CompletableFuture.runAsync(() -> {
                try { InetAddress.getAllByName(host); }
                catch (Exception e) { log.debug("dns prefetch skipped for {}: {}", host, e.toString()); }
            });
        }
    }

    public static void prewarmTcp(HttpClient client, Collection<URI> uris) {
        for (URI uri : uris) {
            if (uri == null) continue;
            CompletableFuture.runAsync(() -> {
                try {
                    HttpRequest probe = HttpRequest.newBuilder(uri)
                            .method("HEAD", HttpRequest.BodyPublishers.noBody())
                            .timeout(Duration.ofSeconds(5))
                            .build();
                    client.sendAsync(probe, HttpResponse.BodyHandlers.discarding())
                            .orTimeout(5, TimeUnit.SECONDS)
                            .exceptionally(t -> null);
                } catch (Exception e) {
                    log.debug("tcp prewarm skipped for {}: {}", uri, e.toString());
                }
            });
        }
    }
}
