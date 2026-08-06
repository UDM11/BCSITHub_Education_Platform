# app/email.py
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)


def _otp_digit_boxes(otp: str) -> str:
    """Render each digit of the OTP as an individual styled box."""
    boxes = ""
    for digit in otp:
        boxes += (
            f'<td style="padding:0 5px;">'
            f'<div class="otp-digit" style="width:52px;height:64px;background:#ffffff;'
            f'border:2.5px solid #818cf8;border-radius:14px;display:inline-block;'
            f'text-align:center;line-height:64px;font-size:32px;font-weight:900;'
            f'color:#4338ca;font-family:Courier New,monospace;'
            f'box-shadow:0 4px 20px rgba(99,102,241,0.18);">'
            f'{digit}'
            f'</div>'
            f'</td>'
        )
    return boxes


# ─────────────────────────────────────────────────────────────────────────────
#  SHARED HEADER / FOOTER PARTIALS
# ─────────────────────────────────────────────────────────────────────────────

def _email_header(title: str, subtitle: str) -> str:
    return f"""
      <!-- ══ HEADER ══ -->
      <tr>
        <td style="background-color:#1e1b4b; background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%);
                   padding:0; text-align:center;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="padding:40px 20px; text-align:center;">

                <!-- Wordmark pill -->
                <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                       style="margin:0 auto 20px;">
                  <tr>
                    <td style="background:rgba(129,140,248,0.15);
                                border:1.5px solid rgba(165,180,252,0.40);
                                border-radius:999px;padding:8px 20px;">
                      <span style="font-size:14px;font-weight:900;color:#e0e7ff;
                                   letter-spacing:1.5px;text-transform:uppercase;
                                   font-family:'Segoe UI',Arial,sans-serif;display:block;">
                        &#9733;&nbsp;BCSITHub
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Accent line -->
                <div style="width:48px;height:3px;background-color:#6366f1;background:linear-gradient(90deg,#6366f1,#a78bfa);
                            border-radius:99px;margin:0 auto 16px;"></div>

                <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;
                           letter-spacing:-0.5px;line-height:1.25;
                           font-family:'Segoe UI',Arial,sans-serif;">
                  {title}
                </h1>
                <p style="margin:0;font-size:13px;color:rgba(199,210,254,0.75);font-weight:500;font-family:'Segoe UI',Arial,sans-serif;">
                  {subtitle}
                </p>

              </td>
            </tr>
          </table>
        </td>
      </tr>
"""


def _email_footer() -> str:
    return """
      <!-- ══ FEATURE ROW ══ -->
      <tr>
        <td style="padding:28px 32px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Notes -->
              <td class="feature-cell" align="center" width="33%" style="padding:0 5px; vertical-align:top;">
                <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                       style="width:100%;background:#f5f3ff;border:1.5px solid #ddd6fe;
                              border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 10px;text-align:center;">
                      <div style="font-size:26px;line-height:1;">&#128218;</div>
                      <div style="margin-top:7px;font-size:10px;font-weight:800;color:#5b21b6;
                                  text-transform:uppercase;letter-spacing:0.8px;">Study Notes</div>
                      <div style="margin-top:3px;font-size:10px;color:#8b5cf6;">All Semesters</div>
                    </td>
                  </tr>
                </table>
              </td>
              <!-- CGPA -->
              <td class="feature-cell" align="center" width="33%" style="padding:0 5px; vertical-align:top;">
                <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                       style="width:100%;background:#eff6ff;border:1.5px solid #bfdbfe;
                              border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 10px;text-align:center;">
                      <div style="font-size:26px;line-height:1;">&#128202;</div>
                      <div style="margin-top:7px;font-size:10px;font-weight:800;color:#1e40af;
                                  text-transform:uppercase;letter-spacing:0.8px;">CGPA Calc</div>
                      <div style="margin-top:3px;font-size:10px;color:#3b82f6;">Smart GPA Tool</div>
                    </td>
                  </tr>
                </table>
              </td>
              <!-- Papers -->
              <td class="feature-cell" align="center" width="33%" style="padding:0 5px; vertical-align:top;">
                <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                       style="width:100%;background:#fdf4ff;border:1.5px solid #e9d5ff;
                              border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 10px;text-align:center;">
                      <div style="font-size:26px;line-height:1;">&#128196;</div>
                      <div style="margin-top:7px;font-size:10px;font-weight:800;color:#7e22ce;
                                  text-transform:uppercase;letter-spacing:0.8px;">Past Papers</div>
                      <div style="margin-top:3px;font-size:10px;color:#a855f7;">PU Exam Bank</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ══ FOOTER BAR ══ -->
      <tr>
        <td style="background:linear-gradient(135deg,#0f0c29 0%,#1e1b4b 100%);
                   padding:28px 32px;text-align:center;border-radius:0 0 24px 24px;">

          <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#a5b4fc;letter-spacing:0.4px;">
            BCSITHub &mdash; Pokhara University BCSIT Portal
          </p>
          <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.38);line-height:1.7;">
            This is an automated message. Please do not reply directly to this email.
          </p>

          <!-- Trust badges -->
          <div>
            <span style="display:inline-block;background:rgba(255,255,255,0.07);
                         border:1px solid rgba(255,255,255,0.14);border-radius:999px;
                         padding:5px 13px;margin:3px;font-size:10px;font-weight:700;
                         color:rgba(199,210,254,0.65);">&#128274; SSL Secured</span>
            <span style="display:inline-block;background:rgba(255,255,255,0.07);
                         border:1px solid rgba(255,255,255,0.14);border-radius:999px;
                         padding:5px 13px;margin:3px;font-size:10px;font-weight:700;
                         color:rgba(199,210,254,0.65);">&#128100; 2,500+ Students</span>
            <span style="display:inline-block;background:rgba(255,255,255,0.07);
                         border:1px solid rgba(255,255,255,0.14);border-radius:999px;
                         padding:5px 13px;margin:3px;font-size:10px;font-weight:700;
                         color:rgba(199,210,254,0.65);">&#127881; Free Platform</span>
          </div>

          <p style="margin:16px 0 0;font-size:10px;color:rgba(255,255,255,0.22);">
            &copy; 2025 BCSITHub. All rights reserved.
          </p>
        </td>
      </tr>
"""


# ─────────────────────────────────────────────────────────────────────────────
#  OTP EMAIL
# ─────────────────────────────────────────────────────────────────────────────

def _build_steps_html(steps: list) -> str:
    """Build numbered step rows HTML — computed outside f-strings for Python 3.10 compat."""
    html = ""
    for i, step in steps:
        html += (
            f'<table role="presentation" cellpadding="0" cellspacing="0"'
            f' style="margin-bottom:12px;">'
            f'<tr>'
            f'<td style="width:28px;height:28px;min-width:28px;'
            f'background:linear-gradient(135deg,#4338ca,#6366f1);'
            f'border-radius:50%;text-align:center;vertical-align:middle;">'
            f'<span style="font-size:12px;font-weight:800;color:#fff;">{i}</span>'
            f'</td>'
            f'<td style="padding-left:13px;font-size:13px;color:#475569;'
            f'font-weight:500;line-height:1.6;">{step}</td>'
            f'</tr>'
            f'</table>'
        )
    return html


def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    """
    Send a professional OTP verification email.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD or settings.SMTP_EMAIL == "your-gmail@gmail.com":
        logger.warning("SMTP credentials not configured. Skipping email send.")
        logger.info(f"[DEV MODE] OTP for {to_email}: {otp}")
        return True

    first_name = name.split()[0] if name else "Student"
    otp_digits_html = _otp_digit_boxes(otp)
    otp_steps_html = _build_steps_html([
        (1, "Return to the BCSITHub verification page in your browser"),
        (2, "Enter the 6-digit code above into the input boxes"),
        (3, 'Click <strong style="color:#4338ca;">Verify Email</strong> to activate your account'),
    ])

    subject = f"{otp} — Your BCSITHub Verification Code"

    html_body = f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Verify Your Email — BCSITHub</title>
  <style>
    @media only screen and (max-width:600px){{
      .card{{width:100%!important;max-width:100%!important;border-radius:0!important;}}
      .body-pad{{padding:28px 20px!important;}}
      .otp-digit{{width:38px!important;height:50px!important;font-size:24px!important;line-height:50px!important;}}
      .feature-cell{{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:8px 0!important;margin-bottom:10px;}}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background:#e8e9f7;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;
             -webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#e8e9f7;padding:40px 16px;width:100%;">
    <tr>
      <td align="center">

        <!-- ═══ CARD ═══ -->
        <table role="presentation" class="card" align="center" cellpadding="0" cellspacing="0" width="580"
               style="width:100%;max-width:580px;margin:0 auto;background:#ffffff;border-radius:24px;
                      overflow:hidden;box-shadow:0 24px 80px rgba(67,56,202,0.18);">

          {_email_header("Email Verification", "Pokhara University &mdash; BCSIT Student Portal")}

          <!-- ══ BODY ══ -->
          <tr>
            <td class="body-pad" style="padding:36px 40px 28px;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#1e293b;">
                Hey, {first_name}! &#128075;
              </p>
              <p style="margin:0 0 30px;font-size:14px;color:#64748b;line-height:1.75;">
                Welcome to <strong style="color:#4338ca;">BCSITHub</strong> — your all-in-one
                academic hub for BCSIT students. Use the one-time code below to verify your
                email and unlock full access to notes, past papers, CGPA tools, and more.
              </p>

              <!-- ── OTP CARD ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(145deg,#1e1b4b 0%,#312e81 60%,#3730a3 100%);
                            border-radius:20px;margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 24px;text-align:center;">

                    <!-- Label -->
                    <p style="margin:0 0 20px;font-size:11px;font-weight:800;color:#a5b4fc;
                               text-transform:uppercase;letter-spacing:3px;">
                      &#128274;&nbsp; Your Verification Code
                    </p>

                    <!-- Digit boxes -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0">
                      <tr>{otp_digits_html}</tr>
                    </table>

                    <!-- Expiry -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0"
                           style="margin:22px auto 0;">
                      <tr>
                        <td style="background:rgba(254,243,199,0.15);
                                   border:1.5px solid rgba(253,230,138,0.35);
                                   border-radius:999px;padding:7px 20px;">
                          <span style="font-size:12px;font-weight:700;color:#fde68a;">
                            &#9201;&nbsp; Expires in 10 minutes
                          </span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ── STEPS ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f8fafc;border:1.5px solid #e2e8f0;
                            border-radius:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#334155;
                               text-transform:uppercase;letter-spacing:1.5px;">
                      &#9989;&nbsp; How to activate your account
                    </p>
                     {otp_steps_html}
                  </td>
                </tr>
              </table>

              <!-- ── SECURITY NOTICE ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:14px;
                            margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;line-height:1.7;">
                      &#128272;&nbsp;<strong>Security Notice:</strong> BCSITHub will
                      <em>never</em> ask for your password. This code is valid for
                      one-time use only. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Disclaimer -->
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;text-align:center;">
                If you did not create a BCSITHub account, please ignore this email &mdash;
                your address will <strong>not</strong> be added to our system.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
            </td>
          </tr>

          {_email_footer()}

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


# ─────────────────────────────────────────────────────────────────────────────
#  PASSWORD RESET EMAIL
# ─────────────────────────────────────────────────────────────────────────────

def send_reset_password_email(to_email: str, name: str, reset_link: str) -> bool:
    """
    Send a professional password reset link email.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD or settings.SMTP_EMAIL == "your-gmail@gmail.com":
        logger.warning("SMTP credentials not configured. Skipping email send.")
        logger.info(f"[DEV MODE] Password reset link for {to_email}: {reset_link}")
        return True

    first_name = name.split()[0] if name else "Student"
    reset_steps_html = _build_steps_html([
        (1, "Click the 'Reset My Password' button or copy the fallback link"),
        (2, "Choose a strong, secure new password"),
        (3, "Sign in with your updated credentials"),
    ])

    subject = "Reset Your BCSITHub Password"

    html_body = f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Reset Your Password — BCSITHub</title>
  <style>
    @media only screen and (max-width:600px){{
      .card{{width:100%!important;max-width:100%!important;border-radius:0!important;}}
      .body-pad{{padding:28px 20px!important;}}
      .reset-btn a{{font-size:14px!important;padding:14px 24px!important;}}
      .feature-cell{{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:8px 0!important;margin-bottom:10px;}}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background:#e8e9f7;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;
             -webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#e8e9f7;padding:40px 16px;width:100%;">
    <tr>
      <td align="center">

        <!-- ═══ CARD ═══ -->
        <table role="presentation" class="card" align="center" cellpadding="0" cellspacing="0" width="580"
               style="width:100%;max-width:580px;margin:0 auto;background:#ffffff;border-radius:24px;
                      overflow:hidden;box-shadow:0 24px 80px rgba(67,56,202,0.18);">

          {_email_header("Password Reset", "Pokhara University &mdash; BCSIT Student Portal")}

          <!-- ══ BODY ══ -->
          <tr>
            <td class="body-pad" style="padding:36px 40px 28px;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#1e293b;">
                Hello, {first_name}! &#128075;
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.75;">
                We received a request to reset the password for your
                <strong style="color:#4338ca;">BCSITHub</strong> account.
                Click the button below to set a new password and regain access to your
                study materials, past papers, and more.
              </p>

              <!-- ── RESET BUTTON CARD ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(145deg,#1e1b4b 0%,#312e81 60%,#3730a3 100%);
                            border-radius:20px;margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="padding:36px 24px;text-align:center;">

                    <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#a5b4fc;
                               text-transform:uppercase;letter-spacing:3px;">
                      &#128272;&nbsp; Secure Password Reset
                    </p>
                    <p style="margin:0 0 26px;font-size:13px;color:rgba(199,210,254,0.75);line-height:1.6;">
                      This secure link expires in <strong style="color:#fde68a;">20 minutes</strong>.
                      Only use it if you requested a password reset.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" class="reset-btn" align="center"
                           cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#6366f1 0%,#4338ca 100%);
                                   border-radius:14px;
                                   box-shadow:0 8px 30px rgba(99,102,241,0.55);">
                          <a href="{reset_link}" target="_blank"
                             style="display:inline-block;padding:16px 44px;
                                    font-size:16px;font-weight:800;color:#ffffff;
                                    text-decoration:none;letter-spacing:-0.2px;
                                    font-family:'Segoe UI',Arial,sans-serif;">
                            &#128274;&nbsp; Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link -->
                    <p style="margin:20px 0 0;font-size:11px;color:rgba(165,180,252,0.65);">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                    <p style="margin:6px 0 0;font-size:11px;word-break:break-all;">
                      <a href="{reset_link}" style="color:#818cf8;text-decoration:underline;">
                        {reset_link}
                      </a>
                    </p>

                  </td>
                </tr>
              </table>

              <!-- ── SECURITY STEPS ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f8fafc;border:1.5px solid #e2e8f0;
                            border-radius:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#334155;
                               text-transform:uppercase;letter-spacing:1.5px;">
                      &#9989;&nbsp; What happens next?
                    </p>
                     {reset_steps_html}
                  </td>
                </tr>
              </table>

              <!-- ── WARNING NOTICE ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:14px;
                            margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#9a3412;font-weight:600;line-height:1.7;">
                      &#9888;&nbsp;<strong>Didn't request this?</strong> If you didn't request a
                      password reset, you can safely ignore this email. Your account will remain
                      secure and no changes will be made.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Disclaimer -->
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;text-align:center;">
                For security, this link will expire in 20 minutes. If you need a new link,
                visit the <strong>Forgot Password</strong> page again.
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
            </td>
          </tr>

          {_email_footer()}

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

        logger.info(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        return False
