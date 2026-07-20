const fs = require("fs");

// ---- resend-email.ts ----
let re = fs.readFileSync("lib/resend-email.ts", "utf8");

// Update approval email signature to include donation amounts
re = re.replace(
  "export async function sendApprovalEmail(to: string, firstName: string, requiresPaymentSupport = false)",
  "export async function sendApprovalEmail(to: string, firstName: string, requiresPaymentSupport = false, donationAmount = 199, monthlyDonationAmount = 0)"
);

// Replace the approval email payment text
re = re.replace(
  "? 'Your application has been reviewed and your place is now confirmed. Our team will be in touch regarding payment arrangements.'\n        : 'Your payment of <strong>\\u00a3199</strong> has been captured and your place is now confirmed.'",
  "? 'Your application has been reviewed and your place is now confirmed. Our team will be in touch regarding payment arrangements.'\n        : `Your donation of <strong>\\u00a3${donationAmount}</strong> has been confirmed and your place is now secured.`"
);

// Add monthly donation paragraph after approval text
re = re.replace(
  "      <div style=\"background:#ecfdf5;border-left:4px solid #059669;padding:16px;border-radius:4px;margin:24px 0;\">",
  "      \${monthlyDonationAmount > 0 ? `<p style=\"color:#374151;font-size:16px;line-height:1.6;\">Your monthly donation of <strong>\\u00a3\${monthlyDonationAmount}</strong> will be deducted automatically each month. Thank you for your generous ongoing support!</p>` : ''}\n      <div style=\"background:#ecfdf5;border-left:4px solid #059669;padding:16px;border-radius:4px;margin:24px 0;\">"
);

// Add buttons to approval email before "We look forward"
re = re.replace(
  "      <p style=\"color:#374151;font-size:16px;line-height:1.6;\">We look forward to seeing you at Singhs Camp UK!</p>",
  '      <div style="text-align:center;margin:24px 0;">\n        <a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a>\n        <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a>\n      </div>\n      <p style="color:#374151;font-size:16px;line-height:1.6;">We look forward to seeing you at Singhs Camp UK!</p>'
);

// Now fix the template literal - we need the whole function to use backtick interpolation for monthlyDonationAmount
// Add "const hasMonthly = monthlyDonationAmount > 0" at the start of the function
re = re.replace(
  "export async function sendApprovalEmail(to: string, firstName: string, requiresPaymentSupport = false, donationAmount = 199, monthlyDonationAmount = 0) {\n  if (!process.env.RESEND_API_KEY) return\n  try {",
  "export async function sendApprovalEmail(to: string, firstName: string, requiresPaymentSupport = false, donationAmount = 199, monthlyDonationAmount = 0) {\n  if (!process.env.RESEND_API_KEY) return\n  const hasMonthly = monthlyDonationAmount > 0\n  try {"
);

// Update decline email - waiting list language
re = re.replace(
  "After careful review, we regret to inform you that we are unable to approve your application at this time.",
  "After careful review, we would like to let you know that you have been <strong>placed on the waiting list</strong> for this camp."
);

// Update decline email note box
re = re.replace(
  "<strong>Please note:</strong> This decision does not prevent you from applying to future Devanhaar initiatives. We encourage you to stay connected and apply again.",
  "<strong>What does this mean?</strong> If a place becomes available, we will contact you. In the meantime, we encourage you to stay connected with Devanhaar and explore our other initiatives."
);

// Add buttons to decline email before "If you have any questions"
re = re.replace(
  "      <p style=\"color:#374151;font-size:16px;line-height:1.6;\">If you have any questions or would like further information, please do not hesitate to reach out.</p>\n      <p style=\"color:#374151;font-size:16px;line-height:1.6;\">Warm regards,<br><strong>The Devanhaar Team</strong></p>\n    </div>\n    <p style=\"text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;\">Devanhaar. All rights reserved.</p>\n  </div>\n</body>\n</html>`,\n    })\n  } catch (e) {\n    console.error('[Resend] Failed to send decline email:', e)\n  }\n}",
  '      <div style="text-align:center;margin:24px 0;">\n        <a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a>\n        <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a>\n      </div>\n      <p style="color:#374151;font-size:16px;line-height:1.6;">If you have any questions or would like further information, please do not hesitate to reach out.</p>\n      <p style="color:#374151;font-size:16px;line-height:1.6;">Warm regards,<br><strong>The Devanhaar Team</strong></p>\n    </div>\n    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">Devanhaar. All rights reserved.</p>\n  </div>\n</body>\n</html>`,\n    })\n  } catch (e) {\n    console.error(\'[Resend] Failed to send decline email:\', e)\n  }\n}'
);

fs.writeFileSync("lib/resend-email.ts", re);
console.log("Updated: lib/resend-email.ts");

// ---- camp-applicant-emails.ts ----
let ce = fs.readFileSync("lib/camp-applicant-emails.ts", "utf8");

// Update approved email
ce = ce.replace(
  '<h2 style="margin:0 0 16px;">Congratulations, ${escapedName}!</h2>\n      <p>We are pleased to let you know that your Singhs Camp UK application has been <strong>accepted</strong>.</p>\n      <p>Your payment has now been captured. You will receive further details about the camp closer to the date, including location, schedule, and what to bring.</p>\n      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>\n      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>\n      <p><strong>Singhs Camp UK Team</strong><br/>Devanhaar</p>',
  '<h2 style="margin:0 0 16px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h2>\n      <p>Dear ${escapedName},</p>\n      <p>We are delighted to let you know that your Singhs Camp UK application has been <strong>approved</strong>.</p>\n      <p>Your donation has been confirmed and your place is now secured. You will receive further details about the camp closer to the date.</p>\n      <p style="text-align:center;margin:24px 0;"><a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a> <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a></p>\n      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>\n      <p style="margin-top:24px;">Warm regards,<br/><strong>The Devanhaar Team</strong></p>'
);

// Update approved text email
ce = ce.replace(
  "Congratulations, ${params.firstName}!\n\nWe are pleased to let you know that your Singhs Camp UK application has been accepted.\n\nYour payment has now been captured. You will receive further details about the camp closer to the date, including location, schedule, and what to bring.\n\nIf you have any questions, please contact us at singhscampuk@devanhaar.com.\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nSinghs Camp UK Team\nDevanhaar",
  "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nDear ${params.firstName},\n\nWe are delighted to let you know that your Singhs Camp UK application has been approved.\n\nYour donation has been confirmed and your place is now secured.\n\nView Our Projects: https://devanhaar.com/projects\nSet Up a Donation: https://devanhaar.com/donate\n\nWarm regards,\nThe Devanhaar Team"
);

// Update declined HTML email
ce = ce.replace(
  '<h2 style="margin:0 0 16px;">Update on your Singhs Camp UK Application</h2>\n      <p>Dear ${escapedName},</p>\n      <p>Thank you for applying to Singhs Camp UK. After careful review, we regret to inform you that your application has <strong>not been accepted</strong> on this occasion.</p>\n      <p>Your payment hold has been <strong>fully released</strong> and no charge has been made. The refund should appear in your account within 5-10 business days.</p>\n      <p>We encourage you to apply again in the future. If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>\n      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>\n      <p><strong>Singhs Camp UK Team</strong><br/>Devanhaar</p>',
  '<h2 style="margin:0 0 16px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h2>\n      <p>Dear ${escapedName},</p>\n      <p>Thank you for applying to Singhs Camp UK. After careful review, we would like to let you know that you have been <strong>placed on the waiting list</strong> for this camp.</p>\n      <p>Your payment hold has been <strong>fully released</strong> and no charge has been made. The refund should appear in your account within 5-10 business days.</p>\n      <p>If a place becomes available, we will contact you. In the meantime, we encourage you to stay connected with Devanhaar.</p>\n      <p style="text-align:center;margin:24px 0;"><a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a> <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a></p>\n      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>\n      <p style="margin-top:24px;">Warm regards,<br/><strong>The Devanhaar Team</strong></p>'
);

// Update declined text email
ce = ce.replace(
  "Update on your Singhs Camp UK Application\n\nDear ${params.firstName},\n\nThank you for applying to Singhs Camp UK. After careful review, we regret to inform you that your application has not been accepted on this occasion.\n\nYour payment hold has been fully released and no charge has been made. The refund should appear in your account within 5-10 business days.\n\nWe encourage you to apply again in the future. If you have any questions, please contact us at singhscampuk@devanhaar.com.\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nSinghs Camp UK Team\nDevanhaar",
  "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nDear ${params.firstName},\n\nThank you for applying to Singhs Camp UK. After careful review, you have been placed on the waiting list for this camp.\n\nYour payment hold has been fully released and no charge has been made.\n\nView Our Projects: https://devanhaar.com/projects\nSet Up a Donation: https://devanhaar.com/donate\n\nWarm regards,\nThe Devanhaar Team"
);

fs.writeFileSync("lib/camp-applicant-emails.ts", ce);
console.log("Updated: lib/camp-applicant-emails.ts");

// ---- actions.ts ----
let ac = fs.readFileSync("app/dashboard/submissions/actions.ts", "utf8");

// Update select to include donation_amount
ac = ac.replace(
  ".select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support, monthly_donation_opted, monthly_donation_amount')",
  ".select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support, donation_amount, monthly_donation_opted, monthly_donation_amount')"
);

// Update sendApprovalEmail call to pass amounts
ac = ac.replace(
  "sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true)",
  "sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true, Number(app.donation_amount) || 199, Number(app.monthly_donation_amount) || 0)"
);

// Fix subscription creation - create price first then subscribe
ac = ac.replace(
  "items: [{ price_data: { currency: 'gbp', unit_amount: Math.round(app.monthly_donation_amount * 100), product_data: { name: 'Devanhaar Monthly Donation' }, recurring: { interval: 'month' } } }],",
  "items: [{ price: (await stripe.prices.create({ currency: 'gbp', unit_amount: Math.round(app.monthly_donation_amount * 100), recurring: { interval: 'month' }, product_data: { name: 'Devanhaar Monthly Donation' } })).id }],"
);

fs.writeFileSync("app/dashboard/submissions/actions.ts", ac);
console.log("Updated: app/dashboard/submissions/actions.ts");

// ---- camp-application-form.tsx - update monthly donation text ----
let form = fs.readFileSync("components/camp-application-form.tsx", "utf8");

form = form.replace(
  "A member of our team will be in touch to set up your monthly direct debit after your application is approved. Your Gift Aid declaration above also applies to your monthly donations.",
  "Your monthly donation will be automatically deducted each month once your application is approved. Your Gift Aid declaration above also applies to your monthly donations."
);

fs.writeFileSync("components/camp-application-form.tsx", form);
console.log("Updated: components/camp-application-form.tsx");

// ---- supabase migration ----
let sql = fs.readFileSync("supabase-monthly-donation.sql", "utf8");
if (sql.indexOf("stripe_customer_id") < 0) {
  sql += "\n\nALTER TABLE camp_applications\n  ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT null,\n  ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT null;\n\nCOMMENT ON COLUMN camp_applications.stripe_customer_id IS 'Stripe Customer ID for subscription management';\nCOMMENT ON COLUMN camp_applications.stripe_subscription_id IS 'Stripe Subscription ID for monthly donations';\n";
  fs.writeFileSync("supabase-monthly-donation.sql", sql);
  console.log("Updated: supabase-monthly-donation.sql");
}

console.log("All email + form + SQL updates applied");
