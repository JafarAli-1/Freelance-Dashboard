"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: 24 }}>
      حدث خطأ غير متوقع.
      {process.env.NODE_ENV !== "production" && (
        <pre style={{ marginTop: 12, direction: "ltr" }}>{error.message}</pre>
      )}
    </div>
  );
}
