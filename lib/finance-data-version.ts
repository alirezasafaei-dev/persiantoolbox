export type FinanceDataVersion = {
  tool: 'salary' | 'loan' | 'interest';
  source: 'local-versioned-json' | 'formula-static';
  version: string;
  updatedAt: string;
};

export const financeDataVersions: FinanceDataVersion[] = [
  {
    tool: 'salary',
    source: 'local-versioned-json',
    version: 'v1',
    updatedAt: '2026-02-16',
  },
  {
    tool: 'loan',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-02-16',
  },
  {
    tool: 'interest',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-02-16',
  },
];

export function getFinanceDataVersion(tool: FinanceDataVersion['tool']): FinanceDataVersion {
  const found = financeDataVersions.find((item) => item.tool === tool);
  if (!found) {
    throw new Error(`finance data version not found for tool: ${tool}`);
  }
  return found;
}
