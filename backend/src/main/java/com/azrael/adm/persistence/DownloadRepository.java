package com.azrael.adm.persistence;

import java.util.List;

import com.azrael.adm.download.DownloadStatus;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DownloadRepository extends JpaRepository<DownloadEntity, String> {
    List<DownloadEntity> findByStatus(DownloadStatus status);
    List<DownloadEntity> findAllByOrderByCreatedAtDesc();
}
