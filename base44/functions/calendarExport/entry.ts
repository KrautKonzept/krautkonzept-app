import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId } = await req.json().catch(() => ({}));

    // Get all bookings
    const bookings = await base44.asServiceRole.entities.Booking.list();
    const userBookings = userId
      ? bookings.filter(b => b.created_by === userId || b.customer_email === userId)
      : bookings;

    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const events = userBookings.map(b => {
      const dateStr = (b.date || "").replace(/-/g, "");
      const timeStr = (b.time_slot || "08:00").replace(":", "") + "00";
      const dtStart = `${dateStr}T${timeStr}Z`;
      // 1 hour duration
      const endHour = parseInt(b.time_slot?.split(":")[0] || "8") + 1;
      const endMin = b.time_slot?.split(":")[1] || "00";
      const dtEnd = `${dateStr}T${String(endHour).padStart(2, "0")}${endMin}00Z`;

      return [
        "BEGIN:VEVENT",
        `UID:${b.id}@krautkonzept.de`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${(b.service || "Termin").replace(/,/g, "\\,")}`,
        `DESCRIPTION:Kunde: ${b.customer_name || ""} | Status: ${b.status || ""}`,
        `ORGANIZER;CN=KrautKonzept:mailto:info@krautkonzept.de`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KrautKonzept//Buchungskalender//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:KrautKonzept Termine",
      "X-WR-TIMEZONE:Europe/Berlin",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="krautkonzept.ics"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});