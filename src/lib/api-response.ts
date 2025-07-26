import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message = "Something went wrong",
  status = 500,
  errors?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

export function validationErrorResponse(errors: unknown) {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      errors,
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 404 }
  );
}
