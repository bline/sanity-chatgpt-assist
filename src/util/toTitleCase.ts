export function toTitleCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase letters
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2') // Add space between consecutive uppercase letters and following words
    .replace(/[A-Z]+/g, (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()) // Capitalize all-uppercase words
    .replace(/\b\w/g, (match) => match.toUpperCase()) // Capitalize the first letter of each word
    .replace(/\s+/g, ' ') // Ensure consistent spacing
    .trim() // Remove any leading or trailing spaces
}
