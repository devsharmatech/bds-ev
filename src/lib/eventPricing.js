/**
 * Event Pricing Utility
 * Determines the correct price based on user category and timing tier
 * 
 * Categories:
 * - BDS Member (paid membership)
 * - Non-Member (regular)
 * - Student (undergraduate)
 * - Hygienist/Assistant/Technician
 * 
 * Tiers (determined by early_bird_deadline and standard_deadline):
 * - Early Bird: Before early_bird_deadline
 * - Standard: After early_bird_deadline until event starts (or standard_deadline if set)
 * - On-site: Only for at-venue registration (not used for online registration)
 */

/**
 * Determine the current pricing tier based on event dates
 * For online registration, only Early Bird and Standard are used
 * On-site pricing is reserved for at-venue registration
 * @param {Object} event - Event object with datetime and deadline fields
 * @returns {'earlybird' | 'standard' | 'onsite'} - Current pricing tier
 */
export function getPricingTier(event) {
  if (!event) return 'earlybird';
  
  const now = new Date();
  const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
  
  // Check if event has early_bird_deadline set
  const earlyBirdDeadline = event.early_bird_deadline ? new Date(event.early_bird_deadline) : null;
  const standardDeadline = event.standard_deadline ? new Date(event.standard_deadline) : null;
  
  // If early_bird_deadline is set and we're before it, use Early Bird
  if (earlyBirdDeadline && now < earlyBirdDeadline) {
    return 'earlybird';
  }
  
  // If early_bird_deadline has passed, check for Standard pricing
  if (earlyBirdDeadline && now >= earlyBirdDeadline) {
    // If standard_deadline is set and we're before it, use Standard
    if (standardDeadline && now < standardDeadline) {
      return 'standard';
    }
    // If no standard_deadline but event hasn't started, use Standard
    if (!standardDeadline && startDate && now < startDate) {
      return 'standard';
    }
    // If standard_deadline has passed or event has started, use On-site (for display purposes)
    return 'onsite';
  }
  
  // If no early_bird_deadline set, check standard_deadline
  if (standardDeadline) {
    if (now < standardDeadline) {
      // No early bird deadline means we go straight to Standard
      return 'standard';
    }
    return 'onsite';
  }
  
  // Fallback: If no deadlines set, use event start date
  // Early Bird: More than 14 days before event
  // Standard: 0-14 days before event (until event starts)
  if (startDate) {
    const daysUntilEvent = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent > 14) {
      return 'earlybird';
    } else if (daysUntilEvent > 0) {
      return 'standard';
    } else {
      // Event has started - On-site only
      return 'onsite';
    }
  }
  
  return 'earlybird'; // Default
}

/**
 * Get the tier display name
 * @param {'earlybird' | 'standard' | 'onsite'} tier
 * @returns {string}
 */
export function getTierDisplayName(tier) {
  switch (tier) {
    case 'earlybird': return 'Early Bird';
    case 'standard': return 'Standard';
    case 'onsite': return 'On-site';
    default: return 'Early Bird';
  }
}

/**
 * Determine user category for pricing
 * @param {Object} user - User object with membership_type, category, position, specialty
 * @returns {'member' | 'regular' | 'student' | 'hygienist'} - User's pricing category
 */
export function getUserPricingCategory(user) {
  if (!user) return 'regular';
  
  // Check user's category and position (from member_profiles)
  const category = (user.category || user.member_category || '').toLowerCase();
  const position = (user.position || '').toLowerCase();
  
  // Student categories - check both category and position
  if (
    category.includes('student') || 
    category.includes('undergraduate') ||
    category.includes('postgraduate') ||
    position === 'student'
  ) {
    return 'student';
  }
  
  // Hygienist/Assistant/Technician categories - check both category and position
  if (
    category.includes('hygienist') || 
    category.includes('assistant') || 
    category.includes('technician') ||
    category.includes('dental assistant') ||
    category.includes('dental hygienist') ||
    category.includes('dental technologist') ||
    position.includes('hygienist') ||
    position.includes('assistant') ||
    position.includes('technologist')
  ) {
    return 'hygienist';
  }
  
  // BDS Member (paid membership) - only applies if user is a dentist
  // Check if user is a dentist based on category or position
  const isDentist = 
    category === 'dentist' ||
    category.includes('dentist') ||
    position.includes('dentist') ||
    position.includes('specialist') ||
    position.includes('consultant') ||
    position.includes('resident') ||
    position.includes('intern') ||
    position.includes('hod') ||
    position.includes('lead') ||
    position.includes('faculty') ||
    position.includes('lecturer');
  
  if (isDentist && user.membership_type === 'paid') {
    return 'member';
  }
  
  // Non-dental / Others - treat as regular (non-member) pricing
  // This includes "Others (Non Dental)" category
  
  // Default to regular (non-member dentist pricing)
  return 'regular';
}

/**
 * Get the display name for user category
 * @param {'member' | 'regular' | 'student' | 'hygienist'} category
 * @returns {string}
 */
export function getCategoryDisplayName(category) {
  switch (category) {
    case 'member': return 'BDS Member';
    case 'regular': return 'Non-Member';
    case 'student': return 'Student';
    case 'hygienist': return 'Hygienist/Assistant';
    default: return 'Non-Member';
  }
}

/**
 * Get the price for a specific category and tier
 * @param {Object} event - Event object with all price fields
 * @param {'member' | 'regular' | 'student' | 'hygienist'} category
 * @param {'earlybird' | 'standard' | 'onsite'} tier
 * @returns {number | null} - Price or null if not set
 */
export function getPriceForCategoryAndTier(event, category, tier) {
  if (!event || !event.is_paid) return null;
  
  const priceMap = {
    member: {
      earlybird: event.member_price,
      standard: event.member_standard_price,
      onsite: event.member_onsite_price,
    },
    regular: {
      earlybird: event.regular_price,
      standard: event.regular_standard_price,
      onsite: event.regular_onsite_price,
    },
    student: {
      earlybird: event.student_price,
      standard: event.student_standard_price,
      onsite: event.student_onsite_price,
    },
    hygienist: {
      earlybird: event.hygienist_price,
      standard: event.hygienist_standard_price,
      onsite: event.hygienist_onsite_price,
    },
  };
  
  const categoryPrices = priceMap[category] || priceMap.regular;
  let price = categoryPrices[tier];
  
  // Fallback: If specific tier price not set, try earlier tiers
  if (price === null || price === undefined) {
    if (tier === 'onsite') {
      price = categoryPrices.standard || categoryPrices.earlybird;
    } else if (tier === 'standard') {
      price = categoryPrices.earlybird;
    }
  }
  
  // Ultimate fallback: Use regular price
  if (price === null || price === undefined) {
    const regularPrices = priceMap.regular;
    price = regularPrices[tier] || regularPrices.standard || regularPrices.earlybird;
  }
  
  return price;
}

/**
 * Get the user's applicable price for an event
 * @param {Object} event - Event object with all price fields
 * @param {Object} user - User object with membership_type and category
 * @returns {{ price: number | null, category: string, tier: string, categoryDisplay: string, tierDisplay: string }}
 */
export function getUserEventPrice(event, user) {
  if (!event || !event.is_paid) {
    return {
      price: null,
      category: 'regular',
      tier: 'earlybird',
      categoryDisplay: 'Non-Member',
      tierDisplay: 'Early Bird',
      isFree: true,
    };
  }
  
  const category = getUserPricingCategory(user);
  const tier = getPricingTier(event);
  const price = getPriceForCategoryAndTier(event, category, tier);
  
  return {
    price,
    category,
    tier,
    categoryDisplay: getCategoryDisplayName(category),
    tierDisplay: getTierDisplayName(tier),
    isFree: false,
  };
}

/**
 * Calculate savings compared to regular price for the same tier
 * @param {Object} event - Event object
 * @param {Object} user - User object
 * @returns {number} - Savings amount
 */
export function calculateSavings(event, user) {
  if (!event || !event.is_paid || !user) return 0;
  
  const tier = getPricingTier(event);
  const category = getUserPricingCategory(user);
  
  if (category === 'regular') return 0; // No savings for regular price
  
  const userPrice = getPriceForCategoryAndTier(event, category, tier);
  const regularPrice = getPriceForCategoryAndTier(event, 'regular', tier);
  
  if (userPrice !== null && regularPrice !== null && regularPrice > userPrice) {
    return regularPrice - userPrice;
  }
  
  return 0;
}

/**
 * Get all prices for display in a pricing table
 * @param {Object} event - Event object with all price fields
 * @returns {Object} - Organized pricing data for display
 */
export function getAllEventPrices(event) {
  if (!event || !event.is_paid) {
    return null;
  }
  
  const currentTier = getPricingTier(event);
  
  return {
    currentTier,
    currentTierDisplay: getTierDisplayName(currentTier),
    categories: [
      {
        id: 'member',
        name: 'BDS & Partner Dentists',
        earlybird: event.member_price,
        standard: event.member_standard_price,
        onsite: event.member_onsite_price,
      },
      {
        id: 'regular',
        name: 'Non-Member Dentist',
        earlybird: event.regular_price,
        standard: event.regular_standard_price,
        onsite: event.regular_onsite_price,
      },
      {
        id: 'student',
        name: 'Undergraduate Student',
        earlybird: event.student_price,
        standard: event.student_standard_price,
        onsite: event.student_onsite_price,
      },
      {
        id: 'hygienist',
        name: 'Hygienist / Assistant / Technician',
        earlybird: event.hygienist_price,
        standard: event.hygienist_standard_price,
        onsite: event.hygienist_onsite_price,
      },
    ],
  };
}

/**
 * Format BHD currency
 * @param {number} amount
 * @returns {string}
 */
export function formatBHD(amount) {
  if (amount === null || amount === undefined || amount === 0) return 'FREE';
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

/**
 * Check if event has multiple pricing tiers set
 * @param {Object} event
 * @returns {boolean}
 */
export function hasMultiplePricingTiers(event) {
  if (!event || !event.is_paid) return false;
  
  const hasStandard = event.regular_standard_price || event.member_standard_price || 
                      event.student_standard_price || event.hygienist_standard_price;
  const hasOnsite = event.regular_onsite_price || event.member_onsite_price ||
                    event.student_onsite_price || event.hygienist_onsite_price;
  
  return !!(hasStandard || hasOnsite);
}

/**
 * Check if event has category-specific pricing
 * @param {Object} event
 * @returns {boolean}
 */
export function hasCategoryPricing(event) {
  if (!event || !event.is_paid) return false;
  
  return !!(event.student_price || event.hygienist_price);
}
