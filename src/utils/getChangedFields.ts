export const getChangedFields = <T extends object>(current: Partial<T>, original?: Partial<T>): Partial<T> => {
  if (!original) return current;

  const changed: Partial<T> = {};

  (Object.keys(current) as (keyof T)[]).forEach((key) => {
    if (current[key] !== original[key]) {
      changed[key] = current[key];
    }
  });

  return changed;
};
