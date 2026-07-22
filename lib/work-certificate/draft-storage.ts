import type { WorkCertificateData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface WorkCertificateDraft {
  id: string;
  data: WorkCertificateData;
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<WorkCertificateDraft>({
  storageKey: 'persian-tools.work-certificate.v1',
  idPrefix: 'wc_',
  freeMaxDrafts: FREE_MAX_DRAFTS,
});

export const {
  saveDraft,
  loadDrafts,
  loadDraft,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} = storage;
