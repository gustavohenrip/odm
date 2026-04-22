package com.azrael.adm.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azrael.adm.persistence.SettingEntity;
import com.azrael.adm.persistence.SettingRepository;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingRepository repo;

    public SettingsController(SettingRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public Map<String, String> get() {
        Map<String, String> map = new HashMap<>();
        for (SettingEntity e : repo.findAll()) {
            map.put(e.getKey(), e.getValue());
        }
        return map;
    }

    @PutMapping
    public Map<String, String> put(@RequestBody Map<String, String> body) {
        for (Map.Entry<String, String> entry : body.entrySet()) {
            SettingEntity e = repo.findById(entry.getKey()).orElseGet(() -> {
                SettingEntity fresh = new SettingEntity();
                fresh.setKey(entry.getKey());
                return fresh;
            });
            e.setValue(entry.getValue());
            repo.save(e);
        }
        return body;
    }
}
