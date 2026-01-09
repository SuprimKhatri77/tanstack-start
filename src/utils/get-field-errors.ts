import type { z } from "zod";

export function isServerFnValidationError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;

  try {
    const parsed = JSON.parse(error.message);
    return Array.isArray(parsed) && parsed.length > 0 && "code" in parsed[0];
  } catch {
    return false;
  }
}

export function getFieldErrors<T>(error: unknown): T | null {
  if (!isServerFnValidationError(error)) {
    return null;
  }

  try {
    const issues = JSON.parse(error.message) as z.core.$ZodIssue[];
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === "string") {
        fieldErrors[fieldName] ??= [];
        fieldErrors[fieldName].push(issue.message);
      }
    }

    return fieldErrors as T;
  } catch {
    return null;
  }
}
