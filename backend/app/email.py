# app/email.py
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

def _email_style_header() -> str:
    return """
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .header { background-color: #0f172a; padding: 32px; text-align: center; }
        .header-logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none; }
        .header-subtitle { font-size: 12px; color: #94a3b8; font-weight: 500; margin-top: 4px; }
        .content { padding: 40px 32px; }
        .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
        .paragraph { font-size: 15px; color: #475569; line-height: 1.625; margin-top: 0; margin-bottom: 24px; }
        .otp-container { background-color: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px; }
        .otp-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 12px; }
        .otp-digits { font-size: 32px; font-weight: 900; color: #4f46e5; font-family: Courier New, monospace; letter-spacing: 8px; margin: 0; }
        .btn-container { text-align: center; margin-bottom: 28px; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
        .steps-container { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
        .steps-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 16px; }
        .step { font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 10px; }
        .step-num { font-weight: 700; color: #4f46e5; }
        .notice-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 18px; margin-bottom: 28px; }
        .notice-text { font-size: 12px; color: #b45309; line-height: 1.6; margin: 0; }
        .footer { background-color: #f8fafc; padding: 28px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0; }
        .footer-bold { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 4px; }
        .fallback-text { font-size: 11px; color: #94a3b8; margin-top: 16px; word-break: break-all; }
        .fallback-link { color: #4f46e5; text-decoration: underline; }
        @media only screen and (max-width: 600px) {
            .wrapper { padding: 0; }
            .container { border-radius: 0; border: none; }
            .content { padding: 32px 20px; }
        }
    </style>
    """

def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    subject = "Verify Your BCSITHub Account"
    first_name = name.split(" ")[0] if name else "Student"
    
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>{subject}</title>
    {_email_style_header()}
</head>
<body>
    <div class="wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container" align="center">
            <tr>
                <td class="header" style="text-align: center;">
                    <a href="https://bcsithubs.web.app" style="display: block; text-decoration: none; margin-bottom: 4px;">
                        <img src="https://bcsithubs.web.app/logo.png" alt="BCSITHub Logo" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; display: inline-block; vertical-align: middle; border: 1.5px solid rgba(255,255,255,0.25);" />
                        <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BCSIT<span style="color:#818cf8;">Hub</span></span>
                    </a>
                    <div class="header-subtitle">Pokhara University &mdash; BCSIT Student Portal</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2 class="greeting">Hey, {first_name}! 👋</h2>
                    <p class="paragraph">
                        Welcome to <strong>BCSITHub</strong> — your academic console. Use the one-time verification code below to verify your account and unlock access to subject notes, past question papers, and interactive study tools.
                    </p>
                    
                    <div class="otp-container">
                        <div class="otp-label">Verification Code</div>
                        <div class="otp-digits">{otp}</div>
                        <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Expires in 10 minutes</div>
                    </div>

                    <div class="steps-container">
                        <div class="steps-title">How to activate your account</div>
                        <div class="step"><span class="step-num">1.</span> Copy the 6-digit verification code above</div>
                        <div class="step"><span class="step-num">2.</span> Enter it on the verification page in your browser</div>
                        <div class="step"><span class="step-num">3.</span> Access notes, syllabus, and study aids instantly</div>
                    </div>

                    <div class="notice-box">
                        <p class="notice-text">
                            <strong>Security Notice:</strong> BCSITHub will never ask for your password. Do not share this code with anyone.
                        </p>
                    </div>

                    <p class="paragraph" style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;">
                        If you did not create a BCSITHub account, please ignore this email.
                    </p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="footer-bold">BCSITHub Platform</div>
                    <p class="footer-text">This is an automated system email. Please do not reply directly.</p>
                    <p class="footer-text" style="margin-top:12px;">&copy; 2026 BCSITHub. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </div>
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

        logger.info(f"Verification OTP email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification OTP email to {to_email}: {e}")
        return False

def send_welcome_email(to_email: str, name: str) -> bool:
    subject = "Welcome to BCSITHub! 🚀"
    first_name = name.split(" ")[0] if name else "Student"
    
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>{subject}</title>
    {_email_style_header()}
</head>
<body>
    <div class="wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container" align="center">
            <tr>
                <td class="header" style="text-align: center;">
                    <a href="https://bcsithubs.web.app" style="display: block; text-decoration: none; margin-bottom: 4px;">
                        <img src="https://bcsithubs.web.app/logo.png" alt="BCSITHub Logo" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; display: inline-block; vertical-align: middle; border: 1.5px solid rgba(255,255,255,0.25);" />
                        <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BCSIT<span style="color:#818cf8;">Hub</span></span>
                    </a>
                    <div class="header-subtitle">Pokhara University &mdash; BCSIT Student Portal</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2 class="greeting">Welcome to the Hub, {first_name}! 🎉</h2>
                    <p class="paragraph">
                        We are absolutely thrilled to have you here! <strong>BCSITHub</strong> is built specifically for Pokhara University BCSIT students to make learning, collaboration, and examination preparation simple, interactive, and structured.
                    </p>
                    
                    <div class="steps-container">
                        <div class="steps-title">Here is what you can do right now:</div>
                        <div class="step"><span class="step-num">📚</span> <strong>Subject Notes:</strong> Access detailed, chapter-wise notes for all 8 semesters.</div>
                        <div class="step"><span class="step-num">📄</span> <strong>Past Papers:</strong> Browse, preview, and download PU board exam question papers.</div>
                        <div class="step"><span class="step-num">💻</span> <strong>Code Compiler:</strong> Write and execute code directly in your browser without any setups.</div>
                        <div class="step"><span class="step-num">⏳</span> <strong>Study tools:</strong> Utilize built-in CGPA/SGPA calculators and a Pomodoro focus timer.</div>
                    </div>

                    <div class="btn-container">
                        <a href="https://bcsithubs.web.app" target="_blank" class="btn">Explore BCSITHub Console</a>
                    </div>

                    <div class="notice-box">
                        <p class="notice-text">
                            <strong>Need any support?</strong> If you have any feedback, questions, or want to contribute study resources, feel free to visit our Support tab or reply to us!
                        </p>
                    </div>

                    <p class="paragraph" style="text-align: center; font-style: italic; color: #64748b; margin-top: 32px;">
                        Let's master the BCSIT course together. Good luck with your studies!
                    </p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="footer-bold">BCSITHub Platform</div>
                    <p class="footer-text">You are receiving this because you registered an account on BCSITHub.</p>
                    <p class="footer-text" style="margin-top:12px;">&copy; 2026 BCSITHub. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </div>
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

        logger.info(f"Welcome email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {to_email}: {e}")
        return False

def send_reset_password_email(to_email: str, name: str, token: str) -> bool:
    subject = "Reset Your BCSITHub Password"
    first_name = name.split(" ")[0] if name else "Student"
    reset_link = f"https://bcsithubs.web.app/reset-password?token={token}&email={to_email}"
    
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>{subject}</title>
    {_email_style_header()}
</head>
<body>
    <div class="wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container" align="center">
            <tr>
                <td class="header" style="text-align: center;">
                    <a href="https://bcsithubs.web.app" style="display: block; text-decoration: none; margin-bottom: 4px;">
                        <img src="https://bcsithubs.web.app/logo.png" alt="BCSITHub Logo" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; display: inline-block; vertical-align: middle; border: 1.5px solid rgba(255,255,255,0.25);" />
                        <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BCSIT<span style="color:#818cf8;">Hub</span></span>
                    </a>
                    <div class="header-subtitle">Pokhara University &mdash; BCSIT Student Portal</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2 class="greeting">Hello, {first_name}!</h2>
                    <p class="paragraph">
                        We received a request to reset the password for your <strong>BCSITHub</strong> account. Click the button below to secure your account and set a new password.
                    </p>
                    
                    <div class="btn-container">
                        <a href="{reset_link}" target="_blank" class="btn">Reset My Password</a>
                        <div class="fallback-text">
                            Link not working? Copy and paste this into your browser:<br/>
                            <a href="{reset_link}" class="fallback-link">{reset_link}</a>
                        </div>
                    </div>

                    <div class="steps-container">
                        <div class="steps-title">What happens next?</div>
                        <div class="step"><span class="step-num">1.</span> Click the reset password button above</div>
                        <div class="step"><span class="step-num">2.</span> Choose a strong, secure new password</div>
                        <div class="step"><span class="step-num">3.</span> Sign in using your updated login credentials</div>
                    </div>

                    <div class="notice-box" style="background-color:#fff7ed;border-color:#ffedd5;">
                        <p class="notice-text" style="color:#c2410c;">
                            <strong>Didn't request this?</strong> If you did not initiate a password reset, you can safely ignore this email. Your credentials remain secure.
                        </p>
                    </div>

                    <p class="paragraph" style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;">
                        This password reset link is valid for 20 minutes.
                    </p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="footer-bold">BCSITHub Platform</div>
                    <p class="footer-text">This is an automated system email. Please do not reply directly.</p>
                    <p class="footer-text" style="margin-top:12px;">&copy; 2026 BCSITHub. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </div>
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

def send_newsletter_otp_email(to_email: str, otp: str) -> bool:
    subject = "Verify Your Newsletter Subscription"
    
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>{subject}</title>
    {_email_style_header()}
</head>
<body>
    <div class="wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container" align="center">
            <tr>
                <td class="header" style="text-align: center;">
                    <a href="https://bcsithubs.web.app" style="display: block; text-decoration: none; margin-bottom: 4px;">
                        <img src="https://bcsithubs.web.app/logo.png" alt="BCSITHub Logo" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; display: inline-block; vertical-align: middle; border: 1.5px solid rgba(255,255,255,0.25);" />
                        <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BCSIT<span style="color:#818cf8;">Hub</span></span>
                    </a>
                    <div class="header-subtitle">Pokhara University &mdash; BCSIT Student Portal</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2 class="greeting">Hello Student! 🔔</h2>
                    <p class="paragraph">
                        You requested to subscribe to our newsletter for Pokhara University Exam Notices. Use the 6-digit verification code below to verify your email address.
                    </p>
                    
                    <div class="otp-container">
                        <div class="otp-label">Verification Code</div>
                        <div class="otp-digits">{otp}</div>
                        <div style="font-size:12px;color:#94a3b8;margin-top:8px;">Expires in 10 minutes</div>
                    </div>

                    <p class="paragraph" style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;">
                        If you did not request this newsletter subscription, you can safely ignore this email.
                    </p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="footer-bold">BCSITHub Platform</div>
                    <p class="footer-text">This is an automated system email. Please do not reply directly.</p>
                    <p class="footer-text" style="margin-top:12px;">&copy; 2026 BCSITHub. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </div>
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

        logger.info(f"Newsletter verification email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send newsletter verification email to {to_email}: {e}")
        return False
def send_notice_alert_email(to_email: str, notice_title: str, notice_category: str, notice_content: Optional[str], file_url: Optional[str]) -> bool:
    subject = f"🔔 New Notice: {notice_title}"
    
    # Notice content fallback
    content_snippet = notice_content or "A new Pokhara University notice has been uploaded. Please check the attachment or visit our platform."
        
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>{subject}</title>
    {_email_style_header()}
</head>
<body>
    <div class="wrapper">
        <table role="presentation" cellpadding="0" cellspacing="0" class="container" align="center">
            <tr>
                <td class="header" style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}" style="display: block; text-decoration: none; margin-bottom: 4px;">
                        <img src="{settings.FRONTEND_URL}/logo.png" alt="BCSITHub Logo" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; display: inline-block; vertical-align: middle; border: 1.5px solid rgba(255,255,255,0.25);" />
                        <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BCSIT<span style="color:#818cf8;">Hub</span></span>
                    </a>
                    <div class="header-subtitle">Pokhara University &mdash; BCSIT Student Portal</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <div style="display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
                        📌 {notice_category} Notice
                    </div>
                    
                    <h2 class="greeting" style="margin-bottom: 16px;">{notice_title}</h2>
                    
                    <p class="paragraph" style="white-space: pre-wrap; word-break: break-word;">
                        {content_snippet}
                    </p>
                    
                    <div class="btn-container" style="margin-top: 28px; margin-bottom: 0;">
                        <a href="{settings.FRONTEND_URL}/pu-notices" target="_blank" class="btn">🌐 View Notices Dashboard</a>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <div class="footer-bold">BCSITHub Platform Alerts</div>
                    <p class="footer-text">You received this notification because you are a registered student or newsletter subscriber on BCSITHub.</p>
                    <p class="footer-text" style="margin-top: 12px;">&copy; 2026 BCSITHub. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </div>
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

        return True
    except Exception as e:
        logger.error(f"Failed to send notice alert email to {to_email}: {e}")
        return False
