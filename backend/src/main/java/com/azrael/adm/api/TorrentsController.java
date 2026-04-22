package com.azrael.adm.api;

import java.nio.file.Path;
import java.util.Base64;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azrael.adm.download.torrent.TorrentSession;

@RestController
@RequestMapping("/api/torrents")
public class TorrentsController {

    private final TorrentSession torrents;

    public TorrentsController(TorrentSession torrents) {
        this.torrents = torrents;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> add(@RequestBody Map<String, String> body) throws Exception {
        if (!torrents.available()) {
            return ResponseEntity.status(503).body(Map.of("error", "torrent session unavailable"));
        }
        String magnet = body.get("magnet");
        String folder = body.getOrDefault("folder", System.getProperty("user.home") + "/Downloads/ADM/Torrents");
        Path save = Path.of(folder);
        if (magnet != null && !magnet.isBlank()) {
            String id = torrents.addMagnet(magnet, save);
            return ResponseEntity.accepted().body(Map.of("id", id));
        }
        String b64 = body.get("torrentBase64");
        if (b64 != null && !b64.isBlank()) {
            byte[] bytes = Base64.getDecoder().decode(b64);
            String id = torrents.addTorrentFile(bytes, save);
            return ResponseEntity.accepted().body(Map.of("id", id));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "magnet or torrentBase64 required"));
    }
}
