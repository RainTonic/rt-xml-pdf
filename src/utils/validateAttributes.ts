export function validateAttributes(
  attrs: Record<string, any>,
  allowedAttrs: Record<string, (value: any) => boolean>,
): string | null {
  for (const attr in attrs) {
    if (!(attr in allowedAttrs)) {
      return `Unrecognized attribute: ${attr}`;
    }
    const isValidValue = allowedAttrs[attr](attrs[attr]);
    if (!isValidValue) {
      return `Invalid value for attribute ${attr}: ${attrs[attr]}`;
    }
  }
  return null;
}

