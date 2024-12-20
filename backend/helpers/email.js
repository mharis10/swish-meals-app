const transporter = require('../helpers/emailConfig');
const fs = require('fs');

sendSignUpEmail = (user) => {
  let emailSubect;
  let emailTemplate;
  let emailRecipient;

  emailSubect = 'Welcome Aboard';

  const template = fs.readFileSync(
    './emailTemplates/signUp.html',
    'utf-8'
  );
  emailTemplate = template.replace('{{Name}}', user.full_name);

  emailRecipient = user.email;

  const mailOptions = {
    to: emailRecipient,
    subject: emailSubect,
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error occurred while sending the email: ${error}`);
    } else {
      console.log('Email sent successfully!');
    }
  });
};

sendSubscriptionExpiryEmail = (user) => {
  let emailSubect;
  let emailTemplate;
  let emailRecipient;

  emailSubect = 'Reminder: Your Meal Subscription Expires Soon!';

  const template = fs.readFileSync(
    './emailTemplates/subscriptionExpiring.html',
    'utf-8'
  );
  emailTemplate = template.replace('{{Subscriber}}', user.full_name);

  emailRecipient = user.email;

  const mailOptions = {
    to: emailRecipient,
    subject: emailSubect,
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error occurred while sending the email: ${error}`);
    } else {
      console.log('Email sent successfully!');
    }
  });
};

sendWeeklyStatsEmail = (stats) => {
  let emailSubect = 'Weekly Stats';
  let emailRecipient;

  let emailTemplate = fs.readFileSync(
    './emailTemplates/weeklyStats.html',
    'utf-8'
  );

  emailTemplate = emailTemplate.replace('{{weekStart}}', new Date(stats.weekStart).toLocaleDateString());
  emailTemplate = emailTemplate.replace('{{weekEnd}}', new Date(stats.weekEnd).toLocaleDateString());
  emailTemplate = emailTemplate.replace('{{totalOrders}}', stats.totalOrders);

  const mealCountsHtml = Object.entries(stats.mealCountByCode)
    .map(([code, count]) => `<tr><td>${code}</td><td>${count}</td></tr>`)
    .join('');

  emailTemplate = emailTemplate.replace('{{mealCounts}}', mealCountsHtml);

  const sideCountsHtml = Object.entries(stats.sideCounts)
    .map(([side, count]) => `<tr><td>${side}</td><td>${count}</td></tr>`)
    .join('');

  emailTemplate = emailTemplate.replace('{{sideCounts}}', sideCountsHtml);

  const mealTypeCountsHtml = Object.entries(stats.mealTypeCount)
    .map(([type, count]) => `<tr><td>${type}</td><td>${count}</td></tr>`)
    .join('');

  emailTemplate = emailTemplate.replace('{{mealTypeCounts}}', mealTypeCountsHtml);

  emailRecipient = process.env.CHEF_EMAIL;

  const mailOptions = {
    to: emailRecipient,
    subject: emailSubect,
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error occurred while sending the email: ${error}`);
    } else {
      console.log('Email sent successfully!');
    }
  });
};

module.exports = {
  sendSignUpEmail,
  sendSubscriptionExpiryEmail,
  sendWeeklyStatsEmail,
};
