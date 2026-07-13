export interface SuperadminSetupUser {
  company_id?: number | null;
}

export const shouldRedirectSuperadminToCompanySettings = (
  role?: string | null,
  users: SuperadminSetupUser[] = [],
): boolean => {
  if (role !== "superadmin") {
    return false;
  }

  return users.length === 0;
};
