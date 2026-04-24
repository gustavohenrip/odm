package com.azrael.adm.download;

public record DownloadCreateRequest(
        String url,
        String folder,
        Integer segments,
        String username,
        String password
) {
}
