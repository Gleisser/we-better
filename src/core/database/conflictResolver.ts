import { QueuedRequest, RequestStatus } from './db';

/**
 * Types of conflict resolution strategies
 */
export enum ConflictStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  LATEST_WINS = 'latest_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

/**
 * Structure representing a data conflict
 */
export interface Conflict<T> {
  clientData: T;
  serverData: T;
  timestamp: number;
  resolved: boolean;
  resolution?: T;
  strategy?: ConflictStrategy;
}

/**
 * Interface for objects that can have conflicts
 */
export interface ConflictDetectable {
  _version?: number;
  _lastModified?: number;
  _localModified?: number;
  [key: string]: unknown;
}

/**
 * Utilities for handling conflicts in offline data
 */
export const conflictResolver = {
  /**
   * Detect if there's a conflict between client and server data
   *
   * @param clientData Data from the client
   * @param serverData Data from the server
   * @returns True if there's a conflict
   */
  hasConflict<T extends ConflictDetectable>(clientData: T, serverData: T): boolean {
    // No conflict if objects are identical
    if (this.areEqual(clientData, serverData)) {
      return false;
    }

    // Check for version conflicts if version info exists
    if (clientData._version !== undefined && serverData._version !== undefined) {
      const clientVersion = clientData._version;
      const serverVersion = serverData._version;

      // If client has older or same version as server, no conflict
      if (clientVersion <= serverVersion) {
        return false;
      }
    }

    // Check for timestamp conflicts
    if (clientData._lastModified && serverData._lastModified) {
      const clientModified = clientData._localModified || clientData._lastModified;
      const serverModified = serverData._lastModified;

      // If client changes are based on the current server version, no conflict
      if (
        clientData._lastModified === serverData._lastModified &&
        clientModified > serverModified
      ) {
        return false;
      }
    }

    // Default to assuming there is a conflict if we can't determine otherwise
    return true;
  },

  /**
   * Create a conflict object for tracking and resolution
   *
   * @param clientData Local client data
   * @param serverData Remote server data
   * @returns Conflict object
   */
  createConflict<T extends ConflictDetectable>(clientData: T, serverData: T): Conflict<T> {
    return {
      clientData,
      serverData,
      timestamp: Date.now(),
      resolved: false,
    };
  },

  /**
   * Resolve a conflict using the specified strategy
   *
   * @param conflict The conflict to resolve
   * @param strategy Strategy to apply
   * @param customMerge Optional custom merge function
   * @returns Resolved data
   */
  resolveConflict<T extends ConflictDetectable>(
    conflict: Conflict<T>,
    strategy: ConflictStrategy = ConflictStrategy.LATEST_WINS,
    customMerge?: (client: T, server: T) => T
  ): T {
    if (conflict.resolved && conflict.resolution) {
      return conflict.resolution;
    }

    let resolution: T;

    switch (strategy) {
      case ConflictStrategy.CLIENT_WINS:
        resolution = { ...conflict.clientData };
        break;

      case ConflictStrategy.SERVER_WINS:
        resolution = { ...conflict.serverData };
        break;

      case ConflictStrategy.LATEST_WINS: {
        const clientModified =
          conflict.clientData._localModified || conflict.clientData._lastModified || 0;
        const serverModified = conflict.serverData._lastModified || 0;

        resolution =
          clientModified > serverModified ? { ...conflict.clientData } : { ...conflict.serverData };
        break;
      }

      case ConflictStrategy.MERGE:
        if (customMerge) {
          resolution = customMerge(conflict.clientData, conflict.serverData);
        } else {
          resolution = this.defaultMerge(conflict.clientData, conflict.serverData);
        }
        break;

      case ConflictStrategy.MANUAL:
        // Return unresolved for manual intervention
        return conflict.clientData;

      default:
        resolution = { ...conflict.serverData };
    }

    // Update the resolution metadata
    resolution._version =
      Math.max(conflict.clientData._version || 0, conflict.serverData._version || 0) + 1;

    resolution._lastModified = Date.now();

    // Update conflict status
    conflict.resolved = true;
    conflict.resolution = resolution;
    conflict.strategy = strategy;

    return resolution;
  },

  /**
   * Default merge strategy that intelligently combines client and server data
   *
   * @param clientData Client version of the data
   * @param serverData Server version of the data
   * @returns Merged data
   */
  defaultMerge<T extends ConflictDetectable>(clientData: T, serverData: T): T {
    const merged = { ...serverData } as T;

    // Get the modification times
    const clientModified = clientData._localModified || clientData._lastModified || 0;
    const serverModified = serverData._lastModified || 0;

    // For each property in client data, apply to merged if it's newer
    for (const key in clientData) {
      // Skip special metadata fields
      if (key.startsWith('_')) continue;

      // If client has a field server doesn't, or client field is newer, use client field
      if (
        clientData[key] !== undefined &&
        (serverData[key] === undefined || clientModified > serverModified)
      ) {
        merged[key] = clientData[key];
      }
    }

    return merged;
  },

  /**
   * Check if two objects are equal (for conflict detection)
   *
   * @param a First object
   * @param b Second object
   * @returns True if objects are equal
   */
  areEqual<T>(a: T, b: T): boolean {
    // Fast path: reference equality
    if (a === b) return true;

    // Null check
    if (a === null || b === null) return a === b;

    // Type check
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.areEqual(a[i], b[i])) return false;
      }
      return true;
    }

    // Handle objects
    const keysA = Object.keys(a as object).filter(k => !k.startsWith('_'));
    const keysB = Object.keys(b as object).filter(k => !k.startsWith('_'));

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.areEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
        return false;
    }

    return true;
  },

  /**
   * Check for and resolve conflicts in a queue request
   *
   * @param localRequest Local request data
   * @param serverResponse Server response data
   * @param strategy Strategy to use for resolution
   * @returns Resolved request data
   */
  resolveRequestConflict(
    localRequest: QueuedRequest,
    serverResponse: unknown,
    strategy: ConflictStrategy = ConflictStrategy.MERGE
  ): QueuedRequest {
    // Extract server data from response
    const serverData =
      (serverResponse as { data?: Record<string, unknown> })?.data || serverResponse;

    // Create a conflict-detectable version of the request
    const conflictDetectable = {
      ...(localRequest.body as Record<string, unknown>),
      _version: localRequest.body?._version,
      _lastModified: localRequest.body?._lastModified,
      _localModified: localRequest.createdAt,
    } as ConflictDetectable;

    // Create server data with appropriate metadata
    const serverDetectable = {
      ...(serverData as Record<string, unknown>),
      _version: (serverData as { _version?: number })?._version,
      _lastModified: (serverData as { _lastModified?: number })?._lastModified || Date.now(),
    } as ConflictDetectable;

    // Check for conflict
    if (!this.hasConflict(conflictDetectable, serverDetectable)) {
      // No conflict, return original request with completed status
      return {
        ...localRequest,
        status: RequestStatus.COMPLETED,
      };
    }

    // Create and resolve conflict
    const conflict = this.createConflict(conflictDetectable, serverDetectable);
    const resolution = this.resolveConflict(conflict, strategy);

    // Build a new request with the resolved data
    return {
      ...localRequest,
      body: {
        ...(localRequest.body || {}),
        ...resolution,
        _version: resolution._version,
        _lastModified: resolution._lastModified,
      },
      status: conflict.resolved ? RequestStatus.COMPLETED : RequestStatus.FAILED,
      errorMessage: conflict.resolved ? undefined : 'Unresolved data conflict',
    };
  },

  /**
   * Create a field-level diff between two objects
   * Useful for tracking exactly what changed in a conflict
   *
   * @param oldObj Original object
   * @param newObj New object
   * @returns Object containing only the changed fields
   */
  createFieldDiff<T extends Record<string, unknown>>(oldObj: T, newObj: T): Partial<T> {
    const diff = {} as Partial<T>;

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      // Skip metadata fields
      if (key.startsWith('_')) continue;

      // Check if value exists in both and is different
      if (key in newObj && (!(key in oldObj) || !this.areEqual(oldObj[key], newObj[key]))) {
        diff[key as keyof T] = newObj[key as keyof T];
      }
    }

    return diff;
  },

  /**
   * Handle a batch of possible conflicts
   *
   * @param items Array of local items
   * @param serverItems Array of server items
   * @param idField Field to use for identifying matching items
   * @param strategy Conflict resolution strategy
   * @returns Array of resolved items
   */
  batchResolveConflicts<T extends ConflictDetectable>(
    items: T[],
    serverItems: T[],
    idField: keyof T,
    strategy: ConflictStrategy = ConflictStrategy.MERGE
  ): T[] {
    const result: T[] = [];
    const serverItemMap = new Map<unknown, T>();

    // Create a map of server items by ID for quick lookup
    for (const item of serverItems) {
      if (item[idField] !== undefined) {
        serverItemMap.set(item[idField], item);
      }
    }

    // Process each local item
    for (const clientItem of items) {
      const id = clientItem[idField];

      // If item exists on server, check for conflicts
      if (id !== undefined && serverItemMap.has(id)) {
        const serverItem = serverItemMap.get(id) as T;

        if (this.hasConflict(clientItem, serverItem)) {
          const conflict = this.createConflict(clientItem, serverItem);
          const resolved = this.resolveConflict(conflict, strategy);
          result.push(resolved);
        } else {
          // No conflict, keep the server version
          result.push(serverItem);
        }

        // Remove from server map as we've handled this item
        serverItemMap.delete(id);
      } else {
        // Item doesn't exist on server, keep client version
        result.push(clientItem);
      }
    }

    // Add any server items that don't exist locally
    for (const serverItem of serverItemMap.values()) {
      result.push(serverItem);
    }

    return result;
  },
};
