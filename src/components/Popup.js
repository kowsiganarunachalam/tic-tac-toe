"use client";

export default function Popup({
  message,
  type = "Info",
  onClose,
  primaryAction,
  secondaryAction,
}) {
  // Tailwind colors for different alert types
  const typeStyles = {
    Success: "bg-green-100 text-green-800 border-green-400",
    Error: "bg-red-100 text-red-800 border-red-400",
    Warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    Info: "bg-blue-100 text-blue-800 border-blue-400",
  };
  const safeType = typeStyles[type] ? type : "Info";
  const actions = [secondaryAction, primaryAction].filter(Boolean);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 alert-popup px-4">
      <div
        className={`w-full max-w-sm rounded-lg p-5 sm:p-6 shadow-lg border transition-all duration-300 ease-in-out ${typeStyles[safeType]}`}
      >
        <p className="text-lg font-semibold leading-snug text-center sm:text-left">{message}</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold shadow transition disabled:cursor-not-allowed disabled:opacity-70 ${action.className || "bg-white hover:bg-gray-100"}`}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-white rounded-md text-sm font-semibold shadow hover:bg-gray-100 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
