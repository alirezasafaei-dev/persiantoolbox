/**
 * Agent Environment Configuration - PersianToolbox
 *
 * Provides environment configuration and validation for agent operations
 */

export interface AgentEnvironment {
  projectRoot: string;
  allowedDirectories: string[];
  restrictedDirectories: string[];
  qualityGates: {
    lint: boolean;
    typecheck: boolean;
    test: boolean;
    build: boolean;
  };
  features: {
    monitoring: boolean;
    logging: boolean;
    validation: boolean;
  };
}

export const agentEnvironment: AgentEnvironment = {
  projectRoot: '/home/dev13/my-project/sites/live/persiantoolbox',
  allowedDirectories: [
    'app/',
    'lib/',
    'components/',
    'tests/',
    'docs/',
    'scripts/',
    'public/',
    '.agents/',
  ],
  restrictedDirectories: ['.git/', 'node_modules/', '.next/', 'dist/', '.turbo', '.env*'],
  qualityGates: {
    lint: true,
    typecheck: true,
    test: true,
    build: false, // Build is optional for most operations
  },
  features: {
    monitoring: true,
    logging: true,
    validation: true,
  },
};

export function validatePath(path: string): boolean {
  const normalizedPath = path.replace(/^\.\//, '');

  // Check if path is in restricted directories
  for (const restricted of agentEnvironment.restrictedDirectories) {
    if (normalizedPath.startsWith(restricted)) {
      return false;
    }
  }

  // Check if path is in allowed directories
  for (const allowed of agentEnvironment.allowedDirectories) {
    if (normalizedPath.startsWith(allowed)) {
      return true;
    }
  }

  // Allow root-level configuration files
  const rootFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.',
    'vitest.config.',
    'tailwind.config.',
    '.eslintrc',
  ];

  for (const rootFile of rootFiles) {
    if (normalizedPath === rootFile || normalizedPath.startsWith(rootFile)) {
      return true;
    }
  }

  return false;
}

export function validateOperation(operation: string): boolean {
  const allowedOperations = [
    'read',
    'write',
    'edit',
    'search',
    'test',
    'build',
    'lint',
    'typecheck',
    'git',
  ];

  return allowedOperations.some((op) => operation.startsWith(op));
}

export function getQualityGateStatus(): {
  lint: 'enabled' | 'disabled';
  typecheck: 'enabled' | 'disabled';
  test: 'enabled' | 'disabled';
  build: 'enabled' | 'disabled';
} {
  return {
    lint: agentEnvironment.qualityGates.lint ? 'enabled' : 'disabled',
    typecheck: agentEnvironment.qualityGates.typecheck ? 'enabled' : 'disabled',
    test: agentEnvironment.qualityGates.test ? 'enabled' : 'disabled',
    build: agentEnvironment.qualityGates.build ? 'enabled' : 'disabled',
  };
}

export function isFeatureEnabled(feature: keyof AgentEnvironment['features']): boolean {
  return agentEnvironment.features[feature];
}

export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if project root exists
  if (require('fs').existsSync(agentEnvironment.projectRoot)) {
    errors.push(`Project root does not exist: ${agentEnvironment.projectRoot}`);
  }

  // Check if package.json exists
  if (!require('fs').existsSync(`${agentEnvironment.projectRoot}/package.json`)) {
    errors.push('package.json not found in project root');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
