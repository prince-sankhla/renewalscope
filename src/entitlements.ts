// src/entitlements.ts — User entitlement checking

export interface EntitlementStatus {
  hasProAccess: boolean;
  reason: string;
}

/**
 * Check if a user has Pro/Paid access.
 *
 * Current implementation: Dev-mode only (no real payment integration yet)
 * Future: Check against Supabase entitlements table populated by payment webhooks
 */
export async function checkEntitlement(userId: string, userEmail?: string): Promise<EntitlementStatus> {
  // Dev override: Allow access for testing/development emails
  const devOverrides = [
    '@renewalscope.com',
    '@test.com',
    'dev@',
  ];

  if (userEmail) {
    const isDev = devOverrides.some(pattern => userEmail.includes(pattern));
    if (isDev) {
      return {
        hasProAccess: true,
        reason: 'Development access granted',
      };
    }
  }

  // TODO: In production, query Supabase:
  // const { data } = await supabase
  //   .from('entitlements')
  //   .select('status')
  //   .eq('user_id', userId)
  //   .eq('status', 'active')
  //   .single();
  //
  // return {
  //   hasProAccess: data !== null,
  //   reason: data ? 'Active subscription' : 'No active subscription',
  // };

  // Default: No paid access (until payment integration is complete)
  return {
    hasProAccess: false,
    reason: 'Pro access requires subscription',
  };
}
