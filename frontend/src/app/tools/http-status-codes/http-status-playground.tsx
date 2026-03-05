"use client";

import { useMemo, useState } from "react";

const STATUS_CODES: { code: number; text: string; description: string; category: string }[] = [
  // 1xx Informational
  { code: 100, text: "Continue", description: "The server has received the request headers, and the client should proceed to send the request body.", category: "1xx Informational" },
  { code: 101, text: "Switching Protocols", description: "The requester has asked the server to switch protocols, and the server has agreed to do so.", category: "1xx Informational" },
  { code: 102, text: "Processing", description: "The server has received and is processing the request, but no response is available yet (WebDAV).", category: "1xx Informational" },
  { code: 103, text: "Early Hints", description: "Used to return some response headers before final HTTP message. Allows preloading resources.", category: "1xx Informational" },
  // 2xx Success
  { code: 200, text: "OK", description: "The request has succeeded. Response depends on the HTTP method used.", category: "2xx Success" },
  { code: 201, text: "Created", description: "The request has been fulfilled and a new resource has been created.", category: "2xx Success" },
  { code: 202, text: "Accepted", description: "The request has been accepted for processing, but processing has not been completed.", category: "2xx Success" },
  { code: 203, text: "Non-Authoritative Information", description: "The returned metadata is not exactly the same as available from the origin server.", category: "2xx Success" },
  { code: 204, text: "No Content", description: "The server successfully processed the request but is not returning any content.", category: "2xx Success" },
  { code: 205, text: "Reset Content", description: "The server successfully processed the request, asks the requester to reset its document view.", category: "2xx Success" },
  { code: 206, text: "Partial Content", description: "The server is delivering only part of the resource due to a range header sent by the client.", category: "2xx Success" },
  { code: 207, text: "Multi-Status", description: "A Multi-Status response conveys information about multiple resources (WebDAV).", category: "2xx Success" },
  { code: 208, text: "Already Reported", description: "Members of a DAV binding have already been enumerated and are not included again (WebDAV).", category: "2xx Success" },
  { code: 226, text: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of one or more instance-manipulations.", category: "2xx Success" },
  // 3xx Redirection
  { code: 300, text: "Multiple Choices", description: "Indicates multiple options for the resource from which the client may choose.", category: "3xx Redirection" },
  { code: 301, text: "Moved Permanently", description: "This and all future requests should be directed to the given URI.", category: "3xx Redirection" },
  { code: 302, text: "Found", description: "Tells the client to look at (browse to) another URL. Originally 'Moved Temporarily'.", category: "3xx Redirection" },
  { code: 303, text: "See Other", description: "The response can be found under another URI using the GET method.", category: "3xx Redirection" },
  { code: 304, text: "Not Modified", description: "Indicates the resource has not been modified since the version specified by the request headers.", category: "3xx Redirection" },
  { code: 307, text: "Temporary Redirect", description: "The request should be repeated with another URI, but future requests should use the original URI.", category: "3xx Redirection" },
  { code: 308, text: "Permanent Redirect", description: "This and all future requests should be directed to the given URI. Does not allow method change.", category: "3xx Redirection" },
  // 4xx Client Error
  { code: 400, text: "Bad Request", description: "The server cannot process the request due to a client error (malformed request syntax, etc.).", category: "4xx Client Error" },
  { code: 401, text: "Unauthorized", description: "Authentication is required and has failed or has not been provided.", category: "4xx Client Error" },
  { code: 402, text: "Payment Required", description: "Reserved for future use. Some APIs use this for rate limiting or payment walls.", category: "4xx Client Error" },
  { code: 403, text: "Forbidden", description: "The request was valid, but the server refuses to respond. Unlike 401, re-authenticating won't help.", category: "4xx Client Error" },
  { code: 404, text: "Not Found", description: "The requested resource could not be found but may be available in the future.", category: "4xx Client Error" },
  { code: 405, text: "Method Not Allowed", description: "A request method is not supported for the requested resource.", category: "4xx Client Error" },
  { code: 406, text: "Not Acceptable", description: "The requested resource can only generate content not acceptable per the Accept headers.", category: "4xx Client Error" },
  { code: 407, text: "Proxy Authentication Required", description: "The client must first authenticate itself with the proxy.", category: "4xx Client Error" },
  { code: 408, text: "Request Timeout", description: "The server timed out waiting for the request.", category: "4xx Client Error" },
  { code: 409, text: "Conflict", description: "The request could not be processed because of conflict in the current state of the resource.", category: "4xx Client Error" },
  { code: 410, text: "Gone", description: "The resource requested is no longer available and will not be available again.", category: "4xx Client Error" },
  { code: 411, text: "Length Required", description: "The request did not specify the length of its content, which is required.", category: "4xx Client Error" },
  { code: 412, text: "Precondition Failed", description: "The server does not meet one of the preconditions specified in the request headers.", category: "4xx Client Error" },
  { code: 413, text: "Payload Too Large", description: "The request is larger than the server is willing or able to process.", category: "4xx Client Error" },
  { code: 414, text: "URI Too Long", description: "The URI provided was too long for the server to process.", category: "4xx Client Error" },
  { code: 415, text: "Unsupported Media Type", description: "The request entity has a media type which the server does not support.", category: "4xx Client Error" },
  { code: 416, text: "Range Not Satisfiable", description: "The client has asked for a portion of the file the server cannot supply.", category: "4xx Client Error" },
  { code: 417, text: "Expectation Failed", description: "The server cannot meet the requirements of the Expect request-header field.", category: "4xx Client Error" },
  { code: 418, text: "I'm a Teapot", description: "Any attempt to brew coffee with a teapot should result in this error (RFC 2324).", category: "4xx Client Error" },
  { code: 422, text: "Unprocessable Entity", description: "The request was well-formed but was unable to be followed due to semantic errors (WebDAV).", category: "4xx Client Error" },
  { code: 425, text: "Too Early", description: "Indicates the server is unwilling to risk processing a request that might be replayed.", category: "4xx Client Error" },
  { code: 426, text: "Upgrade Required", description: "The client should switch to a different protocol such as TLS/1.3.", category: "4xx Client Error" },
  { code: 428, text: "Precondition Required", description: "The origin server requires the request to be conditional to prevent 'lost update' conflicts.", category: "4xx Client Error" },
  { code: 429, text: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting).", category: "4xx Client Error" },
  { code: 431, text: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large.", category: "4xx Client Error" },
  { code: 451, text: "Unavailable For Legal Reasons", description: "A server operator has received a legal demand to deny access to a resource.", category: "4xx Client Error" },
  // 5xx Server Error
  { code: 500, text: "Internal Server Error", description: "A generic error message returned when an unexpected condition was encountered.", category: "5xx Server Error" },
  { code: 501, text: "Not Implemented", description: "The server does not recognize the request method or lacks the ability to fulfill the request.", category: "5xx Server Error" },
  { code: 502, text: "Bad Gateway", description: "The server was acting as a gateway and received an invalid response from the upstream server.", category: "5xx Server Error" },
  { code: 503, text: "Service Unavailable", description: "The server cannot handle the request (overloaded or down for maintenance).", category: "5xx Server Error" },
  { code: 504, text: "Gateway Timeout", description: "The server was acting as a gateway and did not receive a timely response from the upstream server.", category: "5xx Server Error" },
  { code: 505, text: "HTTP Version Not Supported", description: "The server does not support the HTTP protocol version used in the request.", category: "5xx Server Error" },
  { code: 507, text: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request (WebDAV).", category: "5xx Server Error" },
  { code: 508, text: "Loop Detected", description: "The server detected an infinite loop while processing the request (WebDAV).", category: "5xx Server Error" },
  { code: 510, text: "Not Extended", description: "Further extensions to the request are required for the server to fulfil it.", category: "5xx Server Error" },
  { code: 511, text: "Network Authentication Required", description: "The client needs to authenticate to gain network access (captive portals).", category: "5xx Server Error" },
];

const categoryColors: Record<string, string> = {
  "1xx Informational": "text-blue-600 bg-blue-50 border-blue-200",
  "2xx Success": "text-green-600 bg-green-50 border-green-200",
  "3xx Redirection": "text-yellow-600 bg-yellow-50 border-yellow-200",
  "4xx Client Error": "text-red-600 bg-red-50 border-red-200",
  "5xx Server Error": "text-purple-600 bg-purple-50 border-purple-200",
};

export default function HttpStatusPlayground() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(STATUS_CODES.map((s) => s.category))];

  const filtered = useMemo(() => {
    return STATUS_CODES.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
      const matchesSearch = !search || s.code.toString().includes(search) || s.text.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code, name, or description…" className="flex-1 min-w-[200px] bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setSelectedCategory("all"); }} className="px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="text-xs text-navy/40 mb-3">{filtered.length} status codes</div>

      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.code} className="border border-navy/10 rounded-xl p-4 bg-white/40 hover:border-orange/20 transition-colors">
            <div className="flex items-start gap-3">
              <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${categoryColors[s.category] || ""}`}>{s.code}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-navy">{s.text}</div>
                <div className="text-xs text-navy/50 mt-1 leading-relaxed">{s.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
