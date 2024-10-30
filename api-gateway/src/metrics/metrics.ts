import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

const registry = new Registry();

// Collect default metrics
collectDefaultMetrics({ register: registry });

// Example: Counter for tracking requests
const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route'],
});

// Example: Histogram for response duration
const responseDurationHistogram = new Histogram({
    name: 'http_response_duration_seconds',
    help: 'Histogram of response durations in seconds',
    labelNames: ['method', 'route'],
});

// Function to record request metrics
export const recordRequest = (method: string, route: string) => {
    httpRequestsTotal.inc({ method, route });
};

// Function to record response duration
export const recordResponseDuration = (method: string, route: string, duration: number) => {
    responseDurationHistogram.observe({ method, route }, duration);
};

// Export the registry
export const metricsRegistry = registry;
