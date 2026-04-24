package com.azrael.adm.download.torrent;

public record TorrentCreateRequest(
        String magnet,
        String torrentUrl,
        String torrentBase64,
        String folder
) {
}
