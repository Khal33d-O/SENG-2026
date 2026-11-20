// Supplied controlled-response factory: the ONLY replaced collaborator. It stands in for the external
// save service, returns synthetic JSON and records the requested slot and how many bodies were read.
export interface SaveResponse { text(): Promise<string> }
export interface SaveService { load(slot: string): Promise<SaveResponse> }
export interface ControlledService extends SaveService { requestedSlots: string[]; bodyReads: number }

export function controlledResponses(saved: unknown): ControlledService {
  const json = JSON.stringify(saved); // a fresh copy per factory: no object is shared with the caller
  const service: ControlledService = {
    requestedSlots: [],
    bodyReads: 0,
    async load(slot: string) {
      service.requestedSlots.push(slot);
      return {
        async text() {
          service.bodyReads += 1;
          return json;
        },
      };
    },
  };
  return service;
}
