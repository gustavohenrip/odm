export type DownloadStatus = 'downloading' | 'paused' | 'queued' | 'complete' | 'failed';
export type DownloadKind = 'http' | 'torrent';

export interface Download {
  id: string;
  kind: DownloadKind;
  name: string;
  ext: string;
  sizeBytes: number;
  downloadedBytes: number;
  progress: number;
  speedBps: number;
  etaSeconds: number;
  status: DownloadStatus;
  source: string;
  completedAt?: string;
  folder?: string;
  url?: string;
  errorMessage?: string;
}

export interface DownloadCreateRequest {
  url: string;
  folder?: string;
  segments?: number;
  username?: string;
  password?: string;
}

export interface TorrentCreateRequest {
  magnet?: string;
  torrentUrl?: string;
  torrentBase64?: string;
  folder?: string;
}
