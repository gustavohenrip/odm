package com.opendownloader.odm.download.http;

public interface DownloadRunner {
    void run() throws Exception;
    void stop();
}
