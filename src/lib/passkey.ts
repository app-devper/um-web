import type { PasskeyOptions } from "@/types";

export type PasskeyFailure = "cancelled" | "exists" | "unsupported" | "failed";

export class PasskeyError extends Error {
  constructor(readonly kind: PasskeyFailure) {
    super(kind);
  }
}

type JsonCredentialStatics = {
  parseCreationOptionsFromJSON?: (o: unknown) => PublicKeyCredentialCreationOptions;
  parseRequestOptionsFromJSON?: (o: unknown) => PublicKeyCredentialRequestOptions;
  isConditionalMediationAvailable?: () => Promise<boolean>;
};

/** How to ask for a passkey: in the browser's modal prompt, or offered in the username field (conditional). */
export type PasskeyRequest = { conditional?: boolean; signal?: AbortSignal };

function statics(): JsonCredentialStatics | null {
  if (typeof window === "undefined" || typeof window.PublicKeyCredential !== "function") return null;
  return window.PublicKeyCredential as unknown as JsonCredentialStatics;
}

/** Whether this browser can run a passkey ceremony from UM's JSON options. */
export function passkeysSupported(): boolean {
  const s = statics();
  return !!s && typeof s.parseCreationOptionsFromJSON === "function" && typeof s.parseRequestOptionsFromJSON === "function";
}

function failure(error: unknown): PasskeyError {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "AbortError") return new PasskeyError("cancelled");
  if (name === "InvalidStateError") return new PasskeyError("exists");
  if (name === "NotSupportedError") return new PasskeyError("unsupported");
  return new PasskeyError("failed");
}

function serialize(credential: Credential | null): unknown {
  if (!credential) throw new PasskeyError("cancelled");
  return (credential as PublicKeyCredential & { toJSON: () => unknown }).toJSON();
}

/** Runs navigator.credentials.create with UM's registration options and returns the credential as JSON. */
export async function createPasskey(options: PasskeyOptions): Promise<unknown> {
  const s = statics();
  if (!s?.parseCreationOptionsFromJSON) throw new PasskeyError("unsupported");
  try {
    const publicKey = s.parseCreationOptionsFromJSON(options.options.publicKey);
    return serialize(await navigator.credentials.create({ publicKey }));
  } catch (error) {
    throw error instanceof PasskeyError ? error : failure(error);
  }
}

/** Whether this browser can offer passkeys in the username field (WebAuthn conditional mediation). */
export async function passkeyAutofillSupported(): Promise<boolean> {
  const s = statics();
  if (!s?.parseRequestOptionsFromJSON || typeof s.isConditionalMediationAvailable !== "function") return false;
  try {
    return await s.isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

/** Runs navigator.credentials.get with UM's login options and returns the assertion as JSON. */
export async function getPasskey(options: PasskeyOptions, request: PasskeyRequest = {}): Promise<unknown> {
  const s = statics();
  if (!s?.parseRequestOptionsFromJSON) throw new PasskeyError("unsupported");
  try {
    const publicKey = s.parseRequestOptionsFromJSON(options.options.publicKey);
    const mediation = request.conditional ? "conditional" : undefined;
    return serialize(await navigator.credentials.get({ publicKey, mediation, signal: request.signal }));
  } catch (error) {
    throw error instanceof PasskeyError ? error : failure(error);
  }
}

export function passkeyFailureMessage(kind: PasskeyFailure): string {
  switch (kind) {
    case "cancelled":
      return "Passkey request was cancelled.";
    case "exists":
      return "This device already has a passkey for your account.";
    case "unsupported":
      return "This browser cannot use passkeys.";
    default:
      return "The passkey could not be used.";
  }
}
