const fs = require("fs");
let f = fs.readFileSync("app/api/camp-applications/route.ts", "utf8");

// Replace the single line_items block with one that shows camp fee + monthly donation separately
const oldLineItems = `line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: donationAmountPence,
              product_data: {
                name: 'Devanhaar Donation',
                description: body.monthly_donation_opted === 'yes' ? \`\${body.first_name} \${body.last_name} (Camp fee + \\u00a3\${body.monthly_donation_amount}/mo subscription)\` : \`\${body.first_name} \${body.last_name}\`,
              },
            },
            quantity: 1,
          },
        ],`;

const newLineItems = `line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: donationAmountPence,
              product_data: {
                name: 'Singhs Camp UK \u2013 Camp Fee',
                description: \`One-off donation for \${body.first_name} \${body.last_name}\`,
              },
            },
            quantity: 1,
          },
          ...(body.monthly_donation_opted === 'yes' && Number(body.monthly_donation_amount) > 0 ? [{
            price_data: {
              currency: 'gbp',
              unit_amount: 0,
              product_data: {
                name: \`Monthly Donation \u2013 \\u00a3\${body.monthly_donation_amount}/month\`,
                description: 'Recurring subscription starts after approval (not charged today)',
              },
            },
            quantity: 1,
          }] : []),
        ],`;

f = f.replace(oldLineItems, newLineItems);
fs.writeFileSync("app/api/camp-applications/route.ts", f);
console.log("Fixed checkout line items");
