import type { VehicleData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface VehicleDraft {
  id: string;
  data: VehicleData;
  selectedPremiumClauses: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<VehicleDraft>({
  storageKey: 'persian-tools.contract-vehicle.v1',
  idPrefix: 'veh_',
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
