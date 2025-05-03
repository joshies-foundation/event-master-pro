export const pagePaddingXCssClass = 'px-4';
export const pagePaddingXCssAmount = '1rem';

export const pagePaddingYCssClass = 'py-6';
export const pagePaddingYCssAmount = '1.5rem';

export function getCssVariableValue(varName: string): string {
  // Get the raw CSS variable value
  const rawValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();

  // Check if it contains light-dark()
  if (rawValue.includes('light-dark(')) {
    // Create a temporary element to resolve the value
    const tempElement = document.createElement('div');
    tempElement.style.color = `var(${varName})`;
    document.body.appendChild(tempElement);

    // Get the computed color
    const computedValue = window.getComputedStyle(tempElement).color;

    // Clean up
    document.body.removeChild(tempElement);

    return computedValue;
  }

  return rawValue;
}
