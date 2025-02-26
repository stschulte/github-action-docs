export type Entries<T> = T extends { [s: string]: infer U } ? [string, U] : never;
export type Metadata = MetadataComposite | MetadataDocker | MetadataJS;

// https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions
export interface MetadataCommon {
  author?: string;
  branding: {
    color: 'black' | 'blue' | 'gray-dark' | 'green' | 'orange' | 'purple' | 'red' | 'white' | 'yellow';
    icon: string;
  };
  description: string;
  inputs?: {
    [inputId: string]: {
      default?: string;
      deprecationMessage?: string;
      description: string;
      required?: boolean;
    };
  };
  name: string;
}

export interface MetadataComposite extends MetadataCommon {
  outputs?: {
    [outputId: string]: {
      description: string;
      value: string;
    };
  };
  runs: {
    steps: Array<{
      env: {
        [name: string]: string;
      };
      if?: string;
      name?: string;
      run?: string;
      shell?: 'bash' | 'cmd' | 'powershell' | 'pwsh' | 'python' | 'sh';
      uses?: string;
      with: {
        [name: string]: string;
      };
    }>;
    using: 'composite';
  };
}

export interface MetadataDocker extends MetadataCommon {
  outputs?: {
    [outputId: string]: {
      description: string;
    };
  };
  runs: {
    'args': string[];
    'entrypoint'?: string;
    'env'?: {
      [key: string]: string;
    };
    'image': string;
    'post-entrypoint'?: string;
    'pre-entrypoint'?: string;
    'using': 'docker';
  };
}

export interface MetadataJS extends MetadataCommon {
  outputs?: {
    [outputId: string]: {
      description: string;
    };
  };
  runs: {
    'main': string;
    'post'?: string;
    'post-if'?: string;
    'pre'?: string;
    'pre-if'?: string;
    'using': 'node12' | 'node16' | 'node20';
  };
}

/**
 * Sort outputs from an actions.yml file
 *
 * When generating documentation, a deterministic order of actions
 * s preferred. This sorts the result of Object.entries by property name.
 *
 * @param a - A single item of Object.entries(some_object)
 * @param b - A single item of Object.entries(some_object)
 *
 * @returns 1, -1, 0 depending of which should come first
 */
export function sortEntries<T extends [string, unknown]>(a: T, b: T): number {
  return a[0].localeCompare(b[0]);
}

/**
 * Sort inputs from an actions.yml file
 *
 * When generating documentation, a deterministic order of actions
 * input is preferred. In general the most interesting inputs are the
 * ones that have to be defined by the user, so those are preferred over
 * optional input. Otherwise this function sorts inputs alphabetically
 *
 * @param a - A single item of Object.entries(configuration["inputs"])
 * @param b - A single item of Object.entries(configuration["inputs"])
 *
 * @returns 1, -1, 0 depending of which should come first
 */
export function sortInput<T extends Entries<Metadata['inputs']>>(a: T, b: T): number {
  if (a[1].required && !b[1].required) {
    return -1;
  }
  else if (!a[1].required && b[1].required) {
    return 1;
  }
  else {
    return a[0].localeCompare(b[0]);
  }
}
