/**
 * Standalone OenGo Driver Events & CloudEvents v1.0 Spec
 */
export interface CloudEvent<T = Record<string, unknown>> {
  specversion: '1.0';
  id: string;
  source: string;
  type: string;
  time: string;
  datacontenttype: string;
  subject?: string;
  correlationid?: string;
  causationid?: string;
  data: T;
}

export function createCloudEvent<T>(params: {
  type: string;
  source: string;
  data: T;
  subject?: string;
  correlationId?: string;
  causationId?: string;
}): CloudEvent<T> {
  return {
    specversion: '1.0',
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    source: params.source,
    type: params.type,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    subject: params.subject,
    correlationid: params.correlationId,
    causationid: params.causationId,
    data: params.data,
  };
}
