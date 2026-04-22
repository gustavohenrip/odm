package com.azrael.adm.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.azrael.adm.persistence.DownloadEntity;
import com.azrael.adm.persistence.DownloadRepository;

@RestController
@RequestMapping("/api/downloads")
public class DownloadsController {

    private final DownloadRepository repo;

    public DownloadsController(DownloadRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<DownloadEntity> list() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.accepted().body(Map.of("id", "placeholder", "status", "queued"));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<Void> pause(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Void> resume(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable String id, @RequestParam(defaultValue = "false") boolean deleteFiles) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
