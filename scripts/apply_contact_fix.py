import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

NOT = chr(33)

p = 'components/contact-content.tsx'
t = open(p).read()
old_lines = [
    '    try {',
    '      // Save to Supabase if available',
    '      if (supabase) {',
    '        await supabase',
    '          .from("contact_submissions")',
    '          .insert([{ full_name: name, email, message, form_data: { subject }, status: "new" }])',
    '      }',
    '',
    '      // Send email notification via API',
    '      await fetch("/api/contact", {',
    '        method: "POST",',
    '        headers: { "Content-Type": "application/json" },',
    '        body: JSON.stringify({',
    '          name,',
    '          email,',
    '          subject,',
    '          message,',
    '          source_page: "Contact Page",',
    '        }),',
    '      })',
    '',
    '      setSubmitted(true)',
    '      form.reset()',
    '      setTimeout(() => setSubmitted(false), 5000)',
    '    } catch (err) {',
    '      console.error("Error:", err)',
    '      setError("Something went wrong. Please try again.")',
    '    } finally {',
    '      setLoading(false)',
    '    }',
]
old = '\n'.join(old_lines)
new_lines = [
    '    try {',
    '      // Save to Supabase (form_submissions = the table the dashboard reads)',
    '      if (supabase) {',
    '        await supabase',
    '          .from("form_submissions")',
    '          .insert([{ full_name: name, email, message, form_data: { subject }, status: "new" }])',
    '      }',
    '',
    '      // Send email notification via API',
    '      const res = await fetch("/api/contact", {',
    '        method: "POST",',
    '        headers: { "Content-Type": "application/json" },',
    '        body: JSON.stringify({',
    '          name,',
    '          email,',
    '          subject,',
    '          message,',
    '          source_page: "Contact Page",',
    '        }),',
    '      })',
    '',
    '      if (XNOTXres.ok) {',
    '        throw new Error("Email notification failed (" + res.status + ")")',
    '      }',
    '',
    '      setSubmitted(true)',
    '      form.reset()',
    '      setTimeout(() => setSubmitted(false), 5000)',
    '    } catch (err) {',
    '      console.error("Error:", err)',
    '      setError("Something went wrong. Please try again or email us directly at contact@devanhaar.com.")',
    '    } finally {',
    '      setLoading(false)',
    '    }',
]
new = '\n'.join(new_lines).replace('XNOTX', NOT)

if old not in t:
    print('ERR: old block not found in contact-content.tsx')
    sys.exit(1)
t2 = t.replace(old, new)
open(p, 'w').write(t2)
print('contact-content.tsx OK')

p2 = 'components/dashboard/app-sidebar.tsx'
t = open(p2).read()
A_lines = [
    "const systemNav: NavItem[] = [",
    "  { title: 'Activity Log', url: '/dashboard/activity', icon: Activity },",
    "  { title: 'Settings', url: '/dashboard/settings', icon: Settings, adminOnly: true },",
    "]",
]
A = '\n'.join(A_lines)
B_lines = [
    "const systemNav: NavItem[] = [",
    "  { title: 'Settings', url: '/dashboard/settings', icon: Settings, adminOnly: true },",
    "]",
]
B = '\n'.join(B_lines)
t2 = t.replace(A, B)
if t == t2:
    print('ERR: sidebar nav not replaced')
    sys.exit(1)
C = "  BriefcaseBusiness,\n  Users,\n  Activity,\n  Settings,"
D = "  BriefcaseBusiness,\n  Users,\n  Settings,"
t3 = t2.replace(C, D)
if t2 == t3:
    print('ERR: Activity import not removed')
    sys.exit(1)
open(p2, 'w').write(t3)
print('app-sidebar.tsx OK')
