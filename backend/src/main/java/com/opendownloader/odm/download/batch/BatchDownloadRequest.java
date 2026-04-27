package com.opendownloader.odm.download.batch;

import java.util.List;

public record BatchDownloadRequest(
        List<String> urls,
        String pattern,
        String folder,
        Integer segments,
        String username,
        String password
) {
}
