// Calculate remaining days or elapsed days and return status text
export function calculateRemainingDays(expiryDate: Date | undefined, registrationDate?: Date, hasNoExpiry?: boolean): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Case 1: Item has no expiry date - show days elapsed since registration
  if (hasNoExpiry && registrationDate) {
    const registration = new Date(registrationDate);
    registration.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - registration.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "今日登録";
    } else {
      return `登録から${diffDays}日経過`;
    }
  }
  
  // Case 2: Item has expiry date - show remaining days until expiry
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `期限切れ (${Math.abs(diffDays)}日経過)`;
    } else if (diffDays === 0) {
      return "本日まで";
    } else {
      return `あと${diffDays}日`;
    }
  }
  
  return "期限なし";
}

// Get CSS class based on expiry status
export function getExpiryClass(expiryDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return "expired"; // Expired
  } else if (diffDays === 0) {
    return "today-expiry"; // Today
  } else if (diffDays <= 3) { // Within 3 days
    return "near-expiry"; // Near expiry
  }
  return "border-l-4 border-green-500"; // Normal
}

// Get text color class based on expiry status
export function getExpiryTextClass(expiryDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return "text-slate-500"; // Expired
  } else if (diffDays === 0) {
    return "text-amber-500 font-medium"; // Today
  } else if (diffDays <= 3) {
    return "text-amber-500 font-medium"; // Near expiry
  }
  return "text-slate-600"; // Normal
}
