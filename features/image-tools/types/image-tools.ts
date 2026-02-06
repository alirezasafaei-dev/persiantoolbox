export type ImageOutputFormat = 'auto' | 'image/jpeg' | 'image/webp' | 'image/png';

export type CompressionSettings = {
  outputFormat: ImageOutputFormat;
  quality: number;
  maxDimension: number;
  backgroundColor: string;
};

export type ImageCompressionRequest = {
  id: string;
  type: 'compress';
  buffer: ArrayBuffer;
  mimeType: string;
  outputType: string;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string;
};

export type ImageCompressionProgress = {
  id: string;
  type: 'progress';
  progress: number;
};

export type ImageCompressionResult = {
  id: string;
  type: 'result';
  buffer: ArrayBuffer;
  mimeType: string;
  width: number;
  height: number;
};

export type ImageCompressionError = {
  id: string;
  type: 'error';
  message: string;
};

export type WorkerMessage =
  | ImageCompressionProgress
  | ImageCompressionResult
  | ImageCompressionError;

export type WorkerProgressHandler = (progress: number) => void;

export type ImageQueueResult = {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
};

export type ImageQueueStatus = 'idle' | 'processing' | 'done' | 'error';

export type ImageQueueItem = {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  progress: number;
  status: ImageQueueStatus;
  originalDimensions?: {
    width: number;
    height: number;
  };
  result?: ImageQueueResult;
  error?: string;
  lastRunKey?: string;
};

export type ImageCompressionPreset = {
  id: string;
  label: string;
  description: string;
  outputFormat: ImageOutputFormat;
  quality: number;
  maxDimension: number;
};
