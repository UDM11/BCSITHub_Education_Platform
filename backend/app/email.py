# app/email.py
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)


def _build_otp_digits_html(otp: str) -> str:
    """Render each digit of the OTP as an individual styled box."""
    boxes = ""
    for digit in otp:
        boxes += (
            f'<td style="padding:0 5px;">'
            f'<div style="width:46px;height:56px;background:#ffffff;border:2px solid #c7d2fe;'
            f'border-radius:12px;display:inline-block;text-align:center;line-height:56px;'
            f'font-size:28px;font-weight:900;color:#4f46e5;font-family:Courier New,monospace;'
            f'box-shadow:0 4px 12px rgba(79,70,229,0.15);">'
            f'{digit}'
            f'</div>'
            f'</td>'
        )
    return boxes


def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    """
    Send a professional OTP verification email to the user.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD or settings.SMTP_EMAIL == "your-gmail@gmail.com":
        logger.warning("SMTP credentials not configured. Skipping email send.")
        logger.info(f"[DEV MODE] OTP for {to_email}: {otp}")
        return True  # In dev without SMTP, still allow flow to continue

    first_name = name.split()[0] if name else "Student"
    otp_digits_html = _build_otp_digits_html(otp)

    subject = f"{otp} is your BCSITHub verification code"
    html_body = f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Verify Your Email - BCSITHub</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2ff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#eef2ff;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:#ffffff;border-radius:24px;
                      overflow:hidden;box-shadow:0 20px 60px rgba(79,70,229,0.15);">

          <!-- ═══════════════ HEADER ═══════════════ -->
          <tr>
            <td style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 45%,#7c3aed 100%);
                       padding:0;position:relative;overflow:hidden;">

              <!-- Decorative circles -->
              <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;
                          background:rgba(255,255,255,0.06);border-radius:50%;"></div>
              <div style="position:absolute;bottom:-20px;left:-20px;width:100px;height:100px;
                          background:rgba(255,255,255,0.04);border-radius:50%;"></div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 40px 32px;text-align:center;position:relative;z-index:1;">

                    <!-- Logo badge -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                      <tr>
                        <td style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);
                                   border-radius:16px;padding:12px 22px;">
                          <span style="font-size:24px;font-weight:900;color:#ffffff;
                                       letter-spacing:-0.5px;font-family:'Segoe UI',Arial,sans-serif;">
                            &#9733; BCSITHub
                          </span>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;
                                letter-spacing:-0.5px;line-height:1.3;">
                      Email Verification
                    </h1>
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.70);font-weight:500;">
                      Pokhara University &mdash; BCSIT Student Portal
                    </p>

                    <!-- Divider dots -->
                    <div style="margin-top:20px;">
                      <span style="display:inline-block;width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%;margin:0 3px;"></span>
                      <span style="display:inline-block;width:6px;height:6px;background:rgba(255,255,255,0.6);border-radius:50%;margin:0 3px;"></span>
                      <span style="display:inline-block;width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%;margin:0 3px;"></span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ BODY ═══════════════ -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#1e293b;">
                Hello, {first_name}! &#128075;
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;font-weight:400;">
                Thanks for joining <strong style="color:#4f46e5;">BCSITHub</strong>. To complete your registration
                and unlock access to BCSIT syllabi, past papers, CGPA calculators, and more &mdash;
                please verify your email using the one-time code below.
              </p>

              <!-- OTP Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#f8f7ff 0%,#ede9fe 100%);
                            border:1px solid #ddd6fe;border-radius:18px;margin-bottom:28px;
                            overflow:hidden;">
                <tr>
                  <td style="padding:28px 24px;text-align:center;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#6366f1;
                               text-transform:uppercase;letter-spacing:3px;">
                      &#128274;&nbsp; Your Verification Code
                    </p>

                    <!-- Individual OTP digit boxes -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        {otp_digits_html}
                      </tr>
                    </table>

                    <!-- Expiry badge -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                           style="margin:18px auto 0;">
                      <tr>
                        <td style="background:#fef3c7;border:1px solid #fde68a;border-radius:20px;
                                   padding:6px 16px;">
                          <span style="font-size:12px;font-weight:700;color:#92400e;">
                            &#9201;&nbsp; Expires in 10 minutes
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f8fafc;border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:800;color:#334155;
                               text-transform:uppercase;letter-spacing:1.5px;">
                      &#9989;&nbsp; How to activate your account
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:24px;height:24px;background:#4f46e5;border-radius:50%;
                                         text-align:center;vertical-align:middle;">
                                <span style="font-size:11px;font-weight:800;color:#fff;">1</span>
                              </td>
                              <td style="padding-left:12px;font-size:13px;color:#475569;font-weight:500;line-height:1.5;">
                                Return to the BCSITHub verification page in your browser
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:24px;height:24px;background:#4f46e5;border-radius:50%;
                                         text-align:center;vertical-align:middle;">
                                <span style="font-size:11px;font-weight:800;color:#fff;">2</span>
                              </td>
                              <td style="padding-left:12px;font-size:13px;color:#475569;font-weight:500;line-height:1.5;">
                                Enter the 6-digit code above into the input boxes
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:24px;height:24px;background:#4f46e5;border-radius:50%;
                                         text-align:center;vertical-align:middle;">
                                <span style="font-size:11px;font-weight:800;color:#fff;">3</span>
                              </td>
                              <td style="padding-left:12px;font-size:13px;color:#475569;font-weight:500;line-height:1.5;">
                                Click <strong style="color:#4f46e5;">Verify Email</strong> to activate your account
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;line-height:1.6;">
                      &#128274;&nbsp;<strong>Security Notice:</strong> BCSITHub will never ask for your password.
                      This code is valid for one-time use only. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Disclaimer -->
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;text-align:center;">
                If you did not create a BCSITHub account, please ignore this email &mdash;
                your address will not be added to our system.
              </p>
            </td>
          </tr>

          <!-- ═══════════════ DIVIDER ═══════════════ -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,#e2e8f0,transparent);"></div>
            </td>
          </tr>

          <!-- ═══════════════ FEATURE BADGES ═══════════════ -->
          <tr>
            <td style="padding:24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="33%" style="padding:0 4px;">
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                           style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;">
                      <tr>
                        <td style="text-align:center;">
                          <div style="font-size:20px;">&#128218;</div>
                          <div style="font-size:10px;font-weight:800;color:#166534;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Study Notes</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="center" width="33%" style="padding:0 4px;">
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                           style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;">
                      <tr>
                        <td style="text-align:center;">
                          <div style="font-size:20px;">&#128202;</div>
                          <div style="font-size:10px;font-weight:800;color:#1e40af;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">CGPA Calc</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="center" width="33%" style="padding:0 4px;">
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                           style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:10px;padding:10px 14px;">
                      <tr>
                        <td style="text-align:center;">
                          <div style="font-size:20px;">&#128196;</div>
                          <div style="font-size:10px;font-weight:800;color:#7e22ce;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Past Papers</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════ FOOTER ═══════════════ -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);
                       padding:24px 40px;text-align:center;border-radius:0 0 24px 24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#a5b4fc;letter-spacing:0.5px;">
                BCSITHub &mdash; Pokhara University BCSIT Portal
              </p>
              <p style="margin:0 0 12px;font-size:11px;color:rgba(255,255,255,0.40);line-height:1.6;">
                This is an automated security email. Please do not reply directly to this message.
              </p>
              <div style="margin:0;">
                <span style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
                             border-radius:6px;padding:4px 10px;margin:2px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.50);">
                  &#128274; SSL Secured
                </span>
                <span style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
                             border-radius:6px;padding:4px 10px;margin:2px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.50);">
                  &#128100; 2,500+ Students
                </span>
                <span style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
                             border-radius:6px;padding:4px 10px;margin:2px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.50);">
                  &#127881; Free Platform
                </span>
              </div>
              <p style="margin:14px 0 0;font-size:10px;color:rgba(255,255,255,0.25);">
                &copy; 2025 BCSITHub. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())

        logger.info(f"OTP verification email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False
