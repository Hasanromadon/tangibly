import { render, screen, fireEvent } from "@/test-utils/test-helpers";
import { Button } from "../ui/button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);

    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled button</Button>);

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it("should apply variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");
  });

  it("should apply size classes correctly", () => {
    render(<Button size="sm">Small button</Button>);

    const button = screen.getByRole("button", { name: /small button/i });
    expect(button).toHaveClass("h-9");
  });

  it("should render as different element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });
});
