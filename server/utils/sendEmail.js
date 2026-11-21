

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ==========================================
// LOCAL LOGO CONFIGURATION
// ==========================================

// Project structure:
// banking-app/
// ├── client/
// │   └── public/
// │       └── Logo.png
// └── server/
//     └── services/
//         └── emailService.js

const BANK_LOGO_PATH = path.join(
    __dirname,
    "../../client/public/Logo.png"
);

const BANK_WEBSITE =
    process.env.BANK_WEBSITE ||
    "http://localhost:5173";

const BANK_NAME = "Skyravon Bank";

// ==========================================
// EMAIL LAYOUT
// ==========================================

const emailLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BANK_NAME} Notification</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0"
    style="padding:30px 10px;background:#f1f5f9;">

<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
    style="
        max-width:600px;
        width:100%;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
    ">

    <!-- HEADER -->

    <tr>
        <td align="center"
            style="
                background:#0f1f46;
                padding:30px 20px;
            ">

            <img
                src="cid:richieeBankLogo"
                alt="${BANK_NAME}"
                width="145"
                style="
                    display:block;
                    max-width:145px;
                    height:auto;
                    margin:0 auto 15px;
                    border:0;
                "
            />

            <h1 style="
                color:#ffffff;
                font-size:25px;
                margin:0;
            ">
                ${BANK_NAME}
            </h1>

            <p style="
                color:#cbd5e1;
                font-size:13px;
                margin:8px 0 0;
            ">
                Banking Made Simple
            </p>

        </td>
    </tr>

    <!-- CONTENT -->

    <tr>
        <td style="padding:35px 30px;">
            ${content}
        </td>
    </tr>

    <!-- FOOTER -->

    <tr>
        <td align="center"
            style="
                padding:25px 20px;
                background:#f8fafc;
                border-top:1px solid #e5e7eb;
            ">

            <p style="
                color:#64748b;
                font-size:12px;
                margin:0 0 8px;
            ">
                This is an automated notification from ${BANK_NAME}.
            </p>

            <a href="${escapeHtml(BANK_WEBSITE)}"
                style="
                    color:#2563eb;
                    font-size:12px;
                    text-decoration:none;
                ">
                Visit our website
            </a>

            <p style="
                color:#94a3b8;
                font-size:11px;
                margin:15px 0 0;
            ">
                &copy; ${new Date().getFullYear()} ${BANK_NAME}.
                All rights reserved.
            </p>

        </td>
    </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

// ==========================================
// SHARED EMAIL SENDER
// ==========================================

const sendBankEmail = async ({ to, subject, content }) => {

    if (!to || !String(to).trim()) {
        throw new Error("Recipient email address is required.");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error("Email credentials are missing from environment variables.");
    }

    // Check whether the logo exists before attaching it.
    const attachments = [];

    if (fs.existsSync(BANK_LOGO_PATH)) {
        attachments.push({
            filename: "Logo.png",
            path: BANK_LOGO_PATH,
            cid: "richieeBankLogo",
            contentDisposition: "inline"
        });
    } else {
        console.error("BANK LOGO NOT FOUND:", BANK_LOGO_PATH);
    }

    return transporter.sendMail({
        from: `"${BANK_NAME}" <${process.env.EMAIL_USER}>`,
        to: String(to).trim(),
        subject,
        html: emailLayout(content),
        attachments
    });
};

// ==========================================
// 1. ACCOUNT CREATION EMAIL
// ==========================================

const sendUserCreatedEmail = async ({
    email,
    full_name,
    account_number
}) => {

    const content = `

        <h2 style="color:#0f172a;">
            Welcome, ${escapeHtml(full_name)}!
        </h2>

        <p style="color:#475569;line-height:1.8;">
            Your ${BANK_NAME} customer account has been
            successfully created.
        </p>

        <p style="color:#475569;">
            Your account details are provided below.
        </p>

        <div style="
            background:#eff6ff;
            border:1px solid #bfdbfe;
            border-radius:10px;
            padding:25px;
            text-align:center;
            margin:25px 0;
        ">

            <p style="
                color:#64748b;
                font-size:12px;
                margin:0 0 10px;
            ">
                YOUR ACCOUNT NUMBER
            </p>

            <h2 style="
                color:#1d4ed8;
                font-size:27px;
                letter-spacing:3px;
                margin:0;
            ">
                ${escapeHtml(account_number)}
            </h2>

        </div>

        <p style="color:#475569;line-height:1.8;">
            You can now access your account using your
            registered login credentials.
        </p>

        <p style="color:#475569;line-height:1.8;">
            Never share your password, PIN or verification
            codes with anyone.
        </p>

        <p style="color:#475569;line-height:1.8;">
            Thank you for banking with us.
        </p>

        <p style="color:#334155;">
            Regards,<br>
            <strong>${BANK_NAME} Team</strong>
        </p>
    `;

    return sendBankEmail({
        to: email,
        subject: `Welcome to ${BANK_NAME} - Account Created`,
        content
    });
};

// ==========================================
// 2. DEBIT ALERT EMAIL
// ==========================================

const sendDebitAlertEmail = async ({
    email,
    full_name,
    amount,
    account_number,
    description,
    reference,
    transaction_date,
    available_balance,
    currency = "NGN"
}) => {

    const content = `

        <h2 style="color:#0f172a;">
            Hello ${escapeHtml(full_name)},
        </h2>

        <h3 style="color:#dc2626;">
            Debit Transaction Alert
        </h3>

        <p style="color:#475569;line-height:1.8;">
            A debit transaction has been recorded on your account.
        </p>

        <div style="
            background:#fef2f2;
            border:1px solid #fecaca;
            border-radius:10px;
            padding:25px;
            text-align:center;
            margin:25px 0;
        ">

            <p style="color:#991b1b;font-size:13px;margin:0;">
                AMOUNT DEBITED
            </p>

            <h1 style="
                color:#dc2626;
                font-size:30px;
                margin:10px 0 0;
            ">
                - ${formatMoney(amount, currency)}
            </h1>

        </div>

        ${transactionDetails({
            account_number,
            description,
            reference,
            transaction_date,
            available_balance,
            currency
        })}

        <p style="color:#475569;line-height:1.8;">
            If you do not recognise this transaction,
            contact your bank through its verified support channels.
        </p>

        <p style="color:#334155;">
            Regards,<br>
            <strong>${BANK_NAME} Team</strong>
        </p>
    `;

    return sendBankEmail({
        to: email,
        subject: `${BANK_NAME} - Debit Transaction Alert`,
        content
    });
};

// ==========================================
// 3. CREDIT ALERT EMAIL
// ==========================================

const sendCreditAlertEmail = async ({
    email,
    full_name,
    amount,
    account_number,
    description,
    reference,
    transaction_date,
    available_balance,
    currency = "NGN"
}) => {

    const content = `

        <h2 style="color:#0f172a;">
            Hello ${escapeHtml(full_name)},
        </h2>

        <h3 style="color:#15803d;">
            Credit Transaction Alert
        </h3>

        <p style="color:#475569;line-height:1.8;">
            Your account has received a credit transaction.
        </p>

        <div style="
            background:#f0fdf4;
            border:1px solid #bbf7d0;
            border-radius:10px;
            padding:25px;
            text-align:center;
            margin:25px 0;
        ">

            <p style="color:#166534;font-size:13px;margin:0;">
                AMOUNT CREDITED
            </p>

            <h1 style="
                color:#15803d;
                font-size:30px;
                margin:10px 0 0;
            ">
                + ${formatMoney(amount, currency)}
            </h1>

        </div>

        ${transactionDetails({
            account_number,
            description,
            reference,
            transaction_date,
            available_balance,
            currency
        })}

        <p style="color:#475569;line-height:1.8;">
            Thank you for banking with ${BANK_NAME}.
        </p>

        <p style="color:#334155;">
            Regards,<br>
            <strong>${BANK_NAME} Team</strong>
        </p>
    `;

    return sendBankEmail({
        to: email,
        subject: `${BANK_NAME} - Credit Transaction Alert`,
        content
    });
};

// ==========================================
// TRANSACTION DETAILS
// ==========================================

const transactionDetails = ({
    account_number,
    description,
    reference,
    transaction_date,
    available_balance,
    currency
}) => {

    const details = [
        ["Account Number", account_number],
        ["Description", description],
        ["Transaction Reference", reference],
        ["Transaction Date", formatDate(transaction_date)],
        [
            "Available Balance",
            available_balance !== undefined &&
            available_balance !== null
                ? formatMoney(available_balance, currency)
                : null
        ]
    ];

    return `
        <table width="100%" cellpadding="12" cellspacing="0"
            style="border-collapse:collapse;margin:20px 0;">

            ${details.map(([label, value]) =>
                value !== undefined && value !== null ? `
                    <tr>
                        <td style="
                            border-bottom:1px solid #e5e7eb;
                            color:#64748b;
                            font-size:13px;
                        ">
                            ${escapeHtml(label)}
                        </td>

                        <td align="right" style="
                            border-bottom:1px solid #e5e7eb;
                            color:#0f172a;
                            font-size:13px;
                            font-weight:bold;
                        ">
                            ${escapeHtml(value)}
                        </td>
                    </tr>
                ` : ""
            ).join("")}

        </table>
    `;
};

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {

    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return parsedDate.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos"
    });
};

// ==========================================
// FORMAT MONEY
// ==========================================

const formatMoney = (amount, currency = "NGN") => {

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        throw new Error("Invalid transaction amount.");
    }

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency
    }).format(numericAmount);
};

// ==========================================
// HTML ESCAPING
// ==========================================

const escapeHtml = (value) => {

    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    sendUserCreatedEmail,
    sendDebitAlertEmail,
    sendCreditAlertEmail
};
