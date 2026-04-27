package com.opendownloader.odm.download.http;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Set;

public final class ChecksumVerifier {

    private static final Set<String> SUPPORTED = Set.of("MD5", "SHA-1", "SHA-256", "SHA-512");

    public record Result(String algorithm, String actual, String expected, boolean matches) { }

    private ChecksumVerifier() { }

    public static String normalize(String algo) {
        if (algo == null) return null;
        String upper = algo.trim().toUpperCase(Locale.ROOT).replace("SHA1", "SHA-1")
                .replace("SHA256", "SHA-256").replace("SHA512", "SHA-512");
        return SUPPORTED.contains(upper) ? upper : null;
    }

    public static Result verify(Path file, String algorithm, String expectedHex) throws Exception {
        String algo = normalize(algorithm);
        if (algo == null) throw new IllegalArgumentException("unsupported checksum algorithm: " + algorithm);
        MessageDigest md = MessageDigest.getInstance(algo);
        try (InputStream in = Files.newInputStream(file)) {
            byte[] buf = new byte[1 << 16];
            int read;
            while ((read = in.read(buf)) != -1) {
                md.update(buf, 0, read);
            }
        }
        String actual = HexFormat.of().formatHex(md.digest());
        boolean matches = expectedHex == null
                || expectedHex.isBlank()
                || actual.equalsIgnoreCase(expectedHex.trim());
        return new Result(algo, actual, expectedHex, matches);
    }
}
