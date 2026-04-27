package com.opendownloader.odm.download.batch;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.opendownloader.odm.download.DownloadCreateRequest;
import com.opendownloader.odm.download.DownloadService;
import com.opendownloader.odm.download.DownloadView;

@Service
public class BatchDownloadService {

    private static final Logger log = LoggerFactory.getLogger(BatchDownloadService.class);
    private static final Pattern RANGE_TOKEN = Pattern.compile("\\[(\\d+)-(\\d+)(?::(\\d+))?\\]|\\{(\\d+)-(\\d+)(?::(\\d+))?\\}");
    private static final int MAX_EXPANSION = 1000;

    private final DownloadService downloads;

    public BatchDownloadService(DownloadService downloads) {
        this.downloads = downloads;
    }

    public List<DownloadView> submit(BatchDownloadRequest req) {
        if (req == null) throw new IllegalArgumentException("batch payload required");
        Set<String> urls = new LinkedHashSet<>();
        if (req.urls() != null) {
            for (String raw : req.urls()) {
                if (raw == null) continue;
                String trimmed = raw.trim();
                if (!trimmed.isEmpty()) urls.add(trimmed);
            }
        }
        if (req.pattern() != null && !req.pattern().isBlank()) {
            urls.addAll(expandPattern(req.pattern().trim()));
        }
        if (urls.isEmpty()) throw new IllegalArgumentException("no urls supplied");
        List<DownloadView> created = new ArrayList<>();
        for (String url : urls) {
            try {
                DownloadCreateRequest dr = new DownloadCreateRequest(url, req.folder(), req.segments(),
                        req.username(), req.password(), null, null, null);
                created.add(downloads.create(dr));
            } catch (Exception e) {
                log.warn("batch entry failed {}: {}", url, e.toString());
            }
        }
        return created;
    }

    public static List<String> expandPattern(String pattern) {
        if (pattern == null) return List.of();
        Matcher matcher = RANGE_TOKEN.matcher(pattern);
        if (!matcher.find()) return List.of(pattern);
        long startNum, endNum;
        long step;
        int width;
        if (matcher.group(1) != null) {
            startNum = Long.parseLong(matcher.group(1));
            endNum = Long.parseLong(matcher.group(2));
            step = matcher.group(3) == null ? 1L : Math.max(1L, Long.parseLong(matcher.group(3)));
            width = matcher.group(1).length();
        } else {
            startNum = Long.parseLong(matcher.group(4));
            endNum = Long.parseLong(matcher.group(5));
            step = matcher.group(6) == null ? 1L : Math.max(1L, Long.parseLong(matcher.group(6)));
            width = matcher.group(4).length();
        }
        if (endNum < startNum) {
            long tmp = startNum;
            startNum = endNum;
            endNum = tmp;
        }
        long count = ((endNum - startNum) / step) + 1;
        if (count > MAX_EXPANSION) {
            throw new IllegalArgumentException("pattern expansion exceeds " + MAX_EXPANSION + " urls");
        }
        String prefix = pattern.substring(0, matcher.start());
        String suffix = pattern.substring(matcher.end());
        List<String> result = new ArrayList<>((int) count);
        String fmt = "%0" + width + "d";
        for (long i = startNum; i <= endNum; i += step) {
            String token = String.format(Locale.ROOT, fmt, i);
            String expanded = prefix + token + suffix;
            result.addAll(expandPattern(expanded));
        }
        return result;
    }
}
