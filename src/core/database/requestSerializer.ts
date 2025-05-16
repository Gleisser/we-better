import { QueuedRequest } from './db';

/**
 * Utilities for serializing and deserializing request objects
 * for storage and transmission.
 */
export const requestSerializer = {
  /**
   * Serialize a request to a JSON string
   *
   * @param request The request object to serialize
   * @returns Serialized request string
   */
  serialize(request: QueuedRequest): string {
    // Handle special cases like Date objects before serialization
    const processed = {
      ...request,
      // Add any special handling for non-JSON serializable properties here
    };

    return JSON.stringify(processed);
  },

  /**
   * Deserialize a request from a JSON string
   *
   * @param serialized The serialized request string
   * @returns Deserialized request object
   */
  deserialize(serialized: string): QueuedRequest {
    const data = JSON.parse(serialized);

    // Handle any special post-processing here
    return data;
  },

  /**
   * Serialize a request for storage in localStorage or other storage APIs
   *
   * @param request The request to serialize
   * @returns Serialized and encoded string
   */
  serializeForStorage(request: QueuedRequest): string {
    const json = this.serialize(request);
    // Base64 encode to safely store in localStorage, etc.
    return btoa(json);
  },

  /**
   * Deserialize a request from storage
   *
   * @param encoded The encoded string from storage
   * @returns Deserialized request object
   */
  deserializeFromStorage(encoded: string): QueuedRequest {
    // Base64 decode
    const json = atob(encoded);
    return this.deserialize(json);
  },

  /**
   * Convert a fetch Request object to a QueuedRequest
   *
   * @param request The fetch Request object
   * @param options Additional options
   * @returns A QueuedRequest object
   */
  async fromFetchRequest(
    request: Request,
    options: {
      priority?: number;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<Partial<QueuedRequest>> {
    const method = request.method as QueuedRequest['method'];
    let body: Record<string, unknown> | undefined;

    // Clone the request so we can read the body
    const requestClone = request.clone();

    // Only process body for POST and PUT requests
    if ((method === 'POST' || method === 'PUT') && requestClone.body) {
      try {
        const bodyText = await requestClone.text();
        body = JSON.parse(bodyText);
      } catch (error) {
        console.warn('Could not parse request body as JSON:', error);
      }
    }

    return {
      endpoint: request.url,
      method,
      body,
      tags: options.tags,
      priority: options.priority,
      groupId: options.groupId,
    };
  },

  /**
   * Convert a QueuedRequest to a fetch Request object
   *
   * @param queuedRequest The QueuedRequest to convert
   * @returns A fetch Request object
   */
  toFetchRequest(queuedRequest: QueuedRequest): Request {
    const { endpoint, method, body } = queuedRequest;

    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      init.body = JSON.stringify(body);
    }

    return new Request(endpoint, init);
  },

  /**
   * Batch serialize multiple requests
   *
   * @param requests Array of requests to serialize
   * @returns Array of serialized request strings
   */
  serializeBatch(requests: QueuedRequest[]): string[] {
    return requests.map(request => this.serialize(request));
  },

  /**
   * Batch deserialize multiple requests
   *
   * @param serialized Array of serialized request strings
   * @returns Array of deserialized request objects
   */
  deserializeBatch(serialized: string[]): QueuedRequest[] {
    return serialized.map(item => this.deserialize(item));
  },
};
