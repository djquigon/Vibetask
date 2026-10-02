import { Temporal } from 'temporal-polyfill';
export function scheduledInstant(local: string, timezone: string): string {
    return Temporal.ZonedDateTime.from(local + '[' + timezone + ']', { disambiguation: 'reject' }).toInstant().toString();
}
export function scheduledLocal(instant: string | null, timezone: string): string {
    return instant ? Temporal.Instant.from(instant).toZonedDateTimeISO(timezone).toPlainDateTime().toString().slice(0, 16) : '';
}
