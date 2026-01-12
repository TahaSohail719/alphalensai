/**
 * Risk Surface Interpolation Utilities
 * 
 * Provides bilinear interpolation on the Risk Surface data to determine
 * the probability associated with any (SL_sigma, TP_sigma) pair.
 * 
 * This is used when Market Frictions are applied to SL, as the effective
 * SL differs from the strategic SL, and the probability must be recalculated.
 */

import type { SurfaceApiResponse } from "@/components/labs/RiskSurfaceChart";

export interface InterpolationResult {
  probability: number;
  isInterpolated: boolean;
  isOutOfDomain: boolean;
  closestSlSigma?: number;
  closestTpSigma?: number;
}

/**
 * Find the indices that bracket a value in a sorted array
 * Returns [lowerIndex, upperIndex, fraction] where fraction is the interpolation weight
 */
function findBracketingIndices(
  arr: number[],
  value: number
): { lower: number; upper: number; t: number } | null {
  if (arr.length === 0) return null;
  
  // Handle edge cases
  if (value <= arr[0]) {
    return { lower: 0, upper: 0, t: 0 };
  }
  if (value >= arr[arr.length - 1]) {
    return { lower: arr.length - 1, upper: arr.length - 1, t: 0 };
  }
  
  // Find bracketing indices
  for (let i = 0; i < arr.length - 1; i++) {
    if (value >= arr[i] && value <= arr[i + 1]) {
      const t = (value - arr[i]) / (arr[i + 1] - arr[i]);
      return { lower: i, upper: i + 1, t };
    }
  }
  
  return null;
}

/**
 * Linear interpolation between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate the probability from the Risk Surface for a given (SL_sigma, TP_sigma) pair.
 * 
 * The Risk Surface provides:
 * - target_probs: Array of target probabilities [0.05, 0.10, ..., 0.95]
 * - sl_sigma: Array of SL values [0.1, 0.5, ..., 8.0]
 * - tp_sigma: Matrix [prob_index][sl_index] giving TP for each (prob, SL) combination
 * 
 * The interpolation works in reverse: given a SL and TP, find the corresponding probability.
 * 
 * Algorithm:
 * 1. For each probability level, interpolate the TP at the given SL
 * 2. Find which two probability levels bracket the given TP
 * 3. Interpolate between those probability levels
 * 
 * @param surface - The surface data from the API
 * @param slSigma - Stop-Loss in sigma (effective, with friction)
 * @param tpSigma - Take-Profit in sigma
 * @returns InterpolationResult with the interpolated probability and metadata
 */
export function interpolateProbability(
  surface: SurfaceApiResponse['surface'] | undefined | null,
  slSigma: number,
  tpSigma: number
): InterpolationResult {
  // Guard: no surface data
  if (!surface || !surface.target_probs || !surface.sl_sigma || !surface.tp_sigma) {
    return {
      probability: 0,
      isInterpolated: false,
      isOutOfDomain: true,
    };
  }

  const { target_probs, sl_sigma, tp_sigma } = surface;
  
  // Step 1: Find the SL index bracket
  const slBracket = findBracketingIndices(sl_sigma, slSigma);
  if (!slBracket) {
    return {
      probability: 0,
      isInterpolated: false,
      isOutOfDomain: true,
      closestSlSigma: sl_sigma[0],
    };
  }

  // Step 2: For each probability level, interpolate the TP at the given SL
  const interpolatedTPs: { prob: number; tp: number }[] = [];
  
  for (let pIdx = 0; pIdx < target_probs.length; pIdx++) {
    const tpRow = tp_sigma[pIdx];
    if (!tpRow || tpRow.length === 0) continue;
    
    // Interpolate TP at the given SL for this probability level
    const tp1 = tpRow[slBracket.lower] ?? 0;
    const tp2 = tpRow[slBracket.upper] ?? tp1;
    const interpolatedTp = lerp(tp1, tp2, slBracket.t);
    
    interpolatedTPs.push({
      prob: target_probs[pIdx],
      tp: interpolatedTp,
    });
  }

  if (interpolatedTPs.length === 0) {
    return {
      probability: 0,
      isInterpolated: false,
      isOutOfDomain: true,
    };
  }

  // Step 3: Find which two probability levels bracket the given TP
  // The TP generally increases as probability decreases (higher TP targets are less likely)
  // So we need to find where our tpSigma falls in the interpolatedTPs array
  
  // Sort by TP to ensure correct ordering
  const sortedByTp = [...interpolatedTPs].sort((a, b) => a.tp - b.tp);
  
  // Handle edge cases
  if (tpSigma <= sortedByTp[0].tp) {
    // TP is below the minimum - return the highest probability
    return {
      probability: sortedByTp[0].prob,
      isInterpolated: true,
      isOutOfDomain: false,
    };
  }
  
  if (tpSigma >= sortedByTp[sortedByTp.length - 1].tp) {
    // TP is above the maximum - return the lowest probability
    return {
      probability: sortedByTp[sortedByTp.length - 1].prob,
      isInterpolated: true,
      isOutOfDomain: false,
    };
  }

  // Find bracketing TP values
  for (let i = 0; i < sortedByTp.length - 1; i++) {
    if (tpSigma >= sortedByTp[i].tp && tpSigma <= sortedByTp[i + 1].tp) {
      // Interpolate between the two probability levels
      const t = (tpSigma - sortedByTp[i].tp) / (sortedByTp[i + 1].tp - sortedByTp[i].tp);
      const interpolatedProb = lerp(sortedByTp[i].prob, sortedByTp[i + 1].prob, t);
      
      return {
        probability: interpolatedProb,
        isInterpolated: true,
        isOutOfDomain: false,
      };
    }
  }

  // Fallback: couldn't interpolate, return closest
  return {
    probability: interpolatedTPs[0].prob,
    isInterpolated: false,
    isOutOfDomain: true,
  };
}

/**
 * Get human-readable description of interpolation result
 */
export function getInterpolationDescription(result: InterpolationResult): string {
  if (result.isOutOfDomain) {
    return "Strategic probability (outside surface domain)";
  }
  if (result.isInterpolated) {
    return "Interpolated from risk surface with effective SL";
  }
  return "Strategic probability";
}
