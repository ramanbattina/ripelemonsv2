/**
 * Utility functions for the application
 */

/**
 * Generate a URL-friendly slug from product name
 * Format: "product-name-revenue"
 * Example: "SuperX" -> "superx-revenue"
 */
export function generateSlug(name: string): string {
  if (!name) return 'product-revenue'
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 100) // Limit length
    + '-revenue'
}

/**
 * Validate if a string is a valid slug format
 */
export function validateSlug(slug: string): boolean {
  if (!slug) return false
  // Must end with -revenue and contain only lowercase letters, numbers, and hyphens
  return /^[a-z0-9]+(?:-[a-z0-9]+)*-revenue$/.test(slug)
}

/**
 * Ensure slug uniqueness by adding a number suffix if needed
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }
  
  let counter = 1
  let newSlug = baseSlug.replace(/-revenue$/, '') + '-' + counter + '-revenue'
  
  while (existingSlugs.includes(newSlug)) {
    counter++
    newSlug = baseSlug.replace(/-revenue$/, '') + '-' + counter + '-revenue'
  }
  
  return newSlug
}
