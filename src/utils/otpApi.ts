export const getMaskedIdentifier = (identifier: string): string => {
  if (!identifier) return "";

  // For email
  if (identifier.includes("@")) {
    const [local, domain] = identifier.split("@");
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  }

  // For phone
  return `${"*".repeat(identifier.length - 4)}${identifier.slice(-4)}`;
};
