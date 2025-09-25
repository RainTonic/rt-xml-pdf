export const isString = (v: unknown) => typeof v == "string";

export const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
