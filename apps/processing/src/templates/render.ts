// ============================================================
// Nutri Atende — Template Rendering Utilities
// ============================================================

export function renderFile(template: string, data: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  
  return result;
}
