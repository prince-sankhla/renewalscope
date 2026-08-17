// src/entitlements.ts — User entitlement checking

export interface EntitlementStatus {
  hasProAccess: boolean;
  reason: string;
}

/**
 * Check if a user has Pro/Paid access.
 *
 * BETA MODE: All authenticated users get Pro access
 * Future: Check against Supabase entitlements table populated by payment webhooks
 */
export async function checkEntitlement(userId: string, userEmail?: string): Promise<EntitlementStatus> {
  // BETA: Grant Pro access to all authenticated users
  // This will be replaced with real payment/subscription checks later
  return {
    hasProAccess: true,
    reason: 'Beta access granted',
  };

  // TODO: In production with payment integration, replace above with:
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
}
