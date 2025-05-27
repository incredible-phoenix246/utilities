/**
 * HTTP methods used in the API requests.
 * @typedef {('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')} HttpMethod
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Options for customizing a fetch request.
 *
 * @template TRequestBody - The type of the request body.
 * @interface FetchOptions
 * @extends {Omit<RequestInit, 'body' | 'method'>} - Extends the native `RequestInit` interface, excluding 'body' and 'method' to allow custom handling.
 *
 * @property {HttpMethod} [method='GET'] - The HTTP method for the request (default is 'GET').
 * @property {Record<string, string>} [headers] - Headers to include in the request.
 * @property {TRequestBody} [body] - The body content to send with the request, if applicable.
 * @property {Record<string, string>} [params] - URL parameters to be appended to the endpoint.
 */
interface FetchOptions<TRequestBody>
    extends Omit<RequestInit, "body" | "method"> {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: TRequestBody;
    params?: Record<string, string>;
}

/**
 * Configuration for the fetch utility, including the base URL and default headers.
 *
 * @interface FetchConfig
 * @property {string} apiUrl - The URL to use for all API requests.
 * @property {Record<string, string>} [defaultHeaders] - Default headers to include in every request (e.g., Content-Type).
 */
interface FetchConfig {
    apiUrl: string;
    defaultHeaders?: Record<string, string>;
}

/**
 * Custom error class to represent HTTP errors.
 * Extends the native `Error` class to include additional properties like status code and response body.
 *
 * @class HttpError
 * @extends {Error}
 * @property {number} statusCode - The HTTP status code of the response.
 * @property {any} responseBody - The body of the response.
 * @property {string} statusText - The status text from the response.
 *
 * @param {Response} response - The Response object from the fetch call.
 * @param {any} responseBody - The body of the response, parsed or raw.
 * @param {string} statusText - The status text from the response.
 */
export class HttpError<T> extends Error {
    public statusCode: number;
    public responseBody: T;
    public statusText: string;

    constructor(
        public response: Response,
        responseBody: T,
        statusText: string,
    ) {
        super(`HTTP error! status: ${response.status}`);
        this.name = "HttpError";
        this.statusCode = response.status;
        this.responseBody = responseBody;
        this.statusText = statusText;
    }
}

/**
 * Creates a utility function for making fetch requests with custom configuration.
 *
 * @function createFetchUtil
 * @param {FetchConfig} config - Configuration for the fetch utility (base URL and default headers).
 * @returns {function} A function that makes HTTP requests with the specified options and returns the parsed response.
 *
 * @template TResponse - The expected type of the response body.
 * @template TRequestBody - The type of the request body (default is `unknown`).
 */
export const createFetchUtil = (config: FetchConfig) => {
    const { apiUrl, defaultHeaders = {} } = config;

    /**
     * A helper function to make HTTP requests.
     *
     * @param {string} endpoint - The API endpoint to send the request to.
     * @param {FetchOptions<TRequestBody>} [options] - Additional options like method, headers, body, etc.
     * @returns {Promise<TResponse>} - A promise that resolves with the response body parsed as `TResponse`.
     */
    return async function fetchUtil<TResponse, TRequestBody = unknown>(
        endpoint: string,
        options: FetchOptions<TRequestBody> = {},
    ): Promise<TResponse> {
        const {
            method = "GET",
            headers = {},
            body,
            params,
            ...restOptions
        } = options;

        const normalizedApiUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
        const normalizedEndpoint = endpoint.startsWith("/")
            ? endpoint.slice(1)
            : endpoint;

        const url = new URL(normalizedEndpoint, normalizedApiUrl);

        console.log(`${method} request to URL: ${url.toString()}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
                console.log(`${method} request to URL: ${url.toString()}`);
            });
        }

        const mergedHeaders = {
            "Content-Type": "application/json",
            ...defaultHeaders,
            ...headers,
        };

        const fetchOptions: RequestInit = {
            method,
            headers: mergedHeaders,
            ...restOptions,
        };

        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), fetchOptions);

        let responseBody;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        if (!response.ok) {
            throw new HttpError(response, responseBody, response.statusText);
        }

        return responseBody as TResponse;
    };
};

/**
 * Creates an authorization header for API requests.
 *
 * @function withAuth
 * @param {string} token - The authorization token (e.g., a Bearer token).
 * @returns {Record<string, string>} - An object with the `Authorization` header set to `Bearer ${token}`.
 */
export const withAuth = (token: string): Record<string, string> => ({
    Authorization: `Bearer ${token}`,
});