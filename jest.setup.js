// Jest test setup file
import "@testing-library/jest-dom";

// Polyfill for Node.js environment
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    })
  );
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => key => key,
  useLocale: () => "en",
  useMessages: () => ({}),
  useFormatter: () => ({
    dateTime: date => new Date(date).toLocaleDateString(),
    number: (number, options) => {
      if (options?.style === "currency") {
        return `$${number.toLocaleString()}`;
      }
      return number.toLocaleString();
    },
  }),
}));

// Mock next/image
jest.mock("next/image", () => {
  const MockedImage = ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  );
  MockedImage.displayName = "MockedImage";
  return MockedImage;
});

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock console methods to reduce noise during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("componentWillReceiveProps has been renamed")
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
