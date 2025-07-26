import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attribute: string, value?: string): R;
      toHaveValue(value: string | number): R;
      toHaveDisplayValue(value: string | string[]): R;
      toHaveFocus(): R;
      toHaveTextContent(text: string | RegExp): R;
    }
  }
}
