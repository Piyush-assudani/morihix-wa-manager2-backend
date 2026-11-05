/**
 * Helper to map Meta WhatsApp API error codes and payloads
 * to clear, human-readable explanations.
 */
function formatMetaError(errorInput) {
  if (!errorInput) return "Unknown error occurred";

  let code = null;
  let title = "";
  let message = "";
  let details = "";

  if (typeof errorInput === "object") {
    code = errorInput.code || errorInput.error_subcode;
    title = errorInput.title || "";
    message = errorInput.message || "";
    details = errorInput.error_data?.details || errorInput.details || "";
  } else if (typeof errorInput === "string") {
    message = errorInput;
    const match = errorInput.match(/#?(\d{5,6})/);
    if (match) {
      code = parseInt(match[1], 10);
    }
  }

  const numCode = Number(code);

  switch (numCode) {
    case 131026:
      return "Number is not registered on WhatsApp or undeliverable (Meta #131026)";
    case 131047:
      return "24-hour service window expired (User hasn't messaged back, template required) (Meta #131047)";
    case 131051:
      return "Template does not exist or has not been approved (Meta #131051)";
    case 131056:
      return "User has blocked or opted out of messages (Meta #131056)";
    case 130429:
      return "Rate limit hit on WhatsApp Cloud API account (Meta #130429)";
    case 132000:
      return `Template parameter mismatch: ${details || message || 'check template variable count'} (Meta #132000)`;
    case 132001:
      return "Template language/locale mismatch (Meta #132001)";
    case 131009:
      return `Invalid parameter format: ${details || message} (Meta #131009)`;
    case 131042:
      return "Meta account payment issue or credit card needed (Meta #131042)";
    case 131053:
      return "Media upload failed or expired (Meta #131053)";
    case 130428:
      return "Cloud API throughput limit exceeded (Meta #130428)";
    case 100:
      return `Invalid parameter: ${details || message} (Meta #100)`;
    case 190:
      return "Meta WhatsApp access token expired or invalid (Meta #190)";
    default:
      if (details) return `${message || title || "Failed"} (${details})`;
      if (message) return message;
      if (title) return title;
      return "Failed to deliver WhatsApp message";
  }
}

module.exports = { formatMetaError };

