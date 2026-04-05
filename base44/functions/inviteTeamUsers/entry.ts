import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Invite team members
    const users = [
      { email: 'andrea@krautkonzept.de', name: 'Andrea Feuchtgruber', role: 'employee' },
      { email: 'luc@krautkonzept.de', name: 'Luc Weaver', role: 'employee' },
      { email: 'vincent@krautkonzept.de', name: 'Vincent Vogt', role: 'employee' },
    ];

    const results = [];
    for (const u of users) {
      try {
        await base44.users.inviteUser(u.email, u.role);
        results.push({ email: u.email, status: 'invited' });
      } catch (err) {
        results.push({ email: u.email, status: 'error', message: err.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});