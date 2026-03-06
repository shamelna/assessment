import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment, checkRateLimit, sanitizeInput, isValidEmail, securityHeaders } from '@/lib/security'

export async function POST(request: NextRequest) {
  const headers: Record<string, string> = {}
  Object.entries(securityHeaders).forEach(([k, v]) => { headers[k] = v as string })

  try {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers })
    }

    const body = await request.json()
    const { name, email, company, role, country, score, totalQuestions, percentage, readinessLevel, pdfDataUrl } = body

    const sanitizedName    = sanitizeInput(name    || '')
    const sanitizedEmail   = sanitizeInput(email   || '').toLowerCase()
    const sanitizedCompany = sanitizeInput(company || '')
    const sanitizedRole    = sanitizeInput(role    || '')
    const sanitizedCountry = sanitizeInput(country || '')

    if (!sanitizedName || !sanitizedEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers })
    }
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers })
    }
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Invalid score data' }, { status: 400, headers })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const adminEmail   = process.env.ADMIN_EMAIL || 'ahmed.a.redwan@gmail.com'
    const fromAddress  = 'Kaizen Academy <noreply@continuousimprovement.education>'

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500, headers })
    }

    // Extract PDF base64 from data URL
    let pdfBase64: string | null = null
    if (pdfDataUrl && typeof pdfDataUrl === 'string' && pdfDataUrl.includes(',')) {
      pdfBase64 = pdfDataUrl.split(',')[1] || null
    }

    // ── USER EMAIL ─────────────────────────────────────────────────────────────
    const readinessMessage = getReadinessMessage(readinessLevel)
    const courseLink       = getCourseLink(readinessLevel)

    const userEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Lean Assessment Results</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:32px 40px;">
            <div style="border-left:4px solid #ffd559;padding-left:16px;">
              <p style="margin:0 0 4px;color:#ffd559;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Kaizen Academy</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">LEAN ASSESSMENT REPORT</h1>
            </div>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;">Hi ${sanitizedName},</p>
            <p style="margin:0;color:#555;line-height:1.6;">Thank you for completing the Lean & Operational Excellence Assessment. Here are your results:</p>
          </td>
        </tr>

        <!-- Score Card -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:24px;" align="center">
                  <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Score</p>
                  <p style="margin:0 0 2px;font-size:48px;font-weight:700;color:#1a1a1a;">${score}/${totalQuestions}</p>
                  <p style="margin:0 0 16px;font-size:28px;font-weight:600;color:#4caf50;">${Math.round(percentage)}%</p>
                  <span style="display:inline-block;background:${getBadgeColor(readinessLevel)};color:${getBadgeTextColor(readinessLevel)};padding:6px 20px;border-radius:20px;font-size:14px;font-weight:600;">${readinessLevel} Level</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Readiness Message -->
        <tr>
          <td style="padding:0 40px 24px;">
            ${readinessMessage}
          </td>
        </tr>

        <!-- Personalised Recommendations -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbea;border-left:4px solid #ffd559;border-radius:0 8px 8px 0;padding:0;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a1a1a;">Personalised Recommendations</p>
                  ${getPersonalisedRecommendation(readinessLevel)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Recommended Learning Path -->
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1a1a1a;">Your Recommended Learning Path</p>
            ${getLearningPathSection(readinessLevel)}
          </td>
        </tr>

        <!-- Details -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;padding-top:20px;">
              ${sanitizedCompany ? `<tr><td style="padding:4px 0;color:#888;font-size:13px;">Company</td><td style="padding:4px 0;font-size:13px;font-weight:600;">${sanitizedCompany}</td></tr>` : ''}
              ${sanitizedRole    ? `<tr><td style="padding:4px 0;color:#888;font-size:13px;">Role</td><td style="padding:4px 0;font-size:13px;font-weight:600;">${sanitizedRole}</td></tr>` : ''}
              ${sanitizedCountry ? `<tr><td style="padding:4px 0;color:#888;font-size:13px;">Country</td><td style="padding:4px 0;font-size:13px;font-weight:600;">${sanitizedCountry}</td></tr>` : ''}
              <tr><td style="padding:4px 0;color:#888;font-size:13px;">Date</td><td style="padding:4px 0;font-size:13px;font-weight:600;">${new Date().toLocaleDateString()}</td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;" align="center">
            <p style="margin:0 0 16px;font-weight:600;font-size:16px;">Ready to advance your Lean journey?</p>
            <a href="${courseLink}" style="display:inline-block;background:#ffd559;color:#1a1a1a;padding:14px 36px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none;">View Your Recommended Course</a>
            <p style="margin:12px 0 0;font-size:12px;color:#888;">Exclusive discount applied automatically</p>
          </td>
        </tr>

        ${pdfBase64 ? `<tr><td style="padding:0 40px 16px;"><p style="margin:0;font-size:13px;color:#555;">Your detailed PDF report is attached to this email.</p></td></tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background:#1a1a1a;padding:20px 40px;" align="center">
            <p style="margin:0;color:#888;font-size:12px;">&copy; ${new Date().getFullYear()} Kaizen Academy &mdash; Empowering Operational Excellence Worldwide</p>
            <p style="margin:6px 0 0;"><a href="https://academy.continuousimprovement.education" style="color:#ffd559;font-size:12px;text-decoration:none;">academy.continuousimprovement.education</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── ADMIN EMAIL ────────────────────────────────────────────────────────────
    const adminEmailHtml = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#333;">
  <h2 style="color:#1a1a1a;">New Assessment Lead</h2>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr><td style="color:#888;width:120px;">Name</td><td><strong>${sanitizedName}</strong></td></tr>
    <tr><td style="color:#888;">Email</td><td>${sanitizedEmail}</td></tr>
    ${sanitizedCompany ? `<tr><td style="color:#888;">Company</td><td>${sanitizedCompany}</td></tr>` : ''}
    ${sanitizedRole    ? `<tr><td style="color:#888;">Role</td><td>${sanitizedRole}</td></tr>` : ''}
    ${sanitizedCountry ? `<tr><td style="color:#888;">Country</td><td>${sanitizedCountry}</td></tr>` : ''}
    <tr><td style="color:#888;">Score</td><td>${score}/${totalQuestions} (${Math.round(percentage)}%)</td></tr>
    <tr><td style="color:#888;">Readiness</td><td><strong>${readinessLevel}</strong></td></tr>
    <tr><td style="color:#888;">Date</td><td>${new Date().toISOString()}</td></tr>
  </table>
  <p style="margin-top:16px;color:#555;">${getAdminFollowUpSuggestion(readinessLevel)}</p>
</body></html>`

    // ── SEND USER EMAIL ────────────────────────────────────────────────────────
    const userPayload: any = {
      from: fromAddress,
      to: sanitizedEmail,
      subject: `Your Lean Assessment Results — ${readinessLevel} Level`,
      html: userEmailHtml,
    }
    if (pdfBase64) {
      userPayload.attachments = [{
        filename: `Lean-Assessment-${sanitizedName.replace(/\s+/g, '-')}.pdf`,
        content: pdfBase64,
        content_type: 'application/pdf',
      }]
    }

    const userRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    })
    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error('User email failed:', errText)
      throw new Error('Failed to send user email')
    }
    console.log('User email sent to:', sanitizedEmail)

    // ── SEND ADMIN EMAIL ───────────────────────────────────────────────────────
    try {
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromAddress,
          to: adminEmail,
          subject: `New Lead: ${sanitizedName} — ${readinessLevel}`,
          html: adminEmailHtml,
        }),
      })
      if (!adminRes.ok) console.warn('Admin notification failed:', await adminRes.text())
      else console.log('Admin notification sent to:', adminEmail)
    } catch (adminErr) {
      // Non-blocking — user email already succeeded
      console.warn('Admin email error:', adminErr)
    }

    return NextResponse.json({ success: true, message: 'Results sent successfully' }, { headers })

  } catch (error) {
    console.error('send-results error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500, headers })
  }
}

function getBadgeColor(level: string): string {
  const map: Record<string, string> = {
    Advanced: '#4caf50', Intermediate: '#2196f3', Developing: '#ff9800', Beginner: '#ffd559'
  }
  return map[level] || '#888'
}

function getBadgeTextColor(level: string): string {
  return level === 'Beginner' ? '#1a1a1a' : '#ffffff'
}

function getCourseLink(level: string): string {
  const base = 'https://academy.continuousimprovement.education/p/'
  const map: Record<string, string> = {
    Advanced:     base + 'certified-lean-practitioner-training-bundle?coupon_code=kaizen60',
    Intermediate: base + 'certified-lean-practitioner-training-bundle?coupon_code=kaizen60',
    Developing:   base + 'advanced-value-stream-mapping?coupon_code=kaizen60',
    Beginner:     base + 'toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60',
  }
  return map[level] || map['Beginner']
}

function getReadinessMessage(level: string): string {
  const map: Record<string, string> = {
    Beginner: `<p style="margin:0;color:#555;line-height:1.6;">You're at the <strong>beginning of your Lean journey</strong> — and that's a great place to start. This is an exciting time to build solid foundational knowledge. With the right learning path, you'll quickly develop the skills to identify waste, improve flow, and contribute meaningfully to your organisation's efficiency.</p>`,
    Developing: `<p style="margin:0;color:#555;line-height:1.6;">You have <strong>solid foundational Lean knowledge</strong> and are ready to deepen your expertise. The next step is focused practical application — mastering tools like Value Stream Mapping and Business Process Management will bridge the gap between theory and real-world impact.</p>`,
    Intermediate: `<p style="margin:0;color:#555;line-height:1.6;">You demonstrate <strong>strong Lean knowledge and practical understanding</strong>. You're well-positioned for advanced topics and leadership roles. Earning the Lean Practitioner certification will formally validate your expertise and open doors to higher-impact roles in continuous improvement.</p>`,
    Advanced: `<p style="margin:0;color:#555;line-height:1.6;"><strong>Outstanding result!</strong> You have exceptional mastery of Lean and Toyota Production System principles. You're positioned to lead large-scale organisational transformation, design improvement systems, and mentor the next generation of Lean practitioners.</p>`,
  }
  return map[level] || map['Beginner']
}

function getPersonalisedRecommendation(level: string): string {
  const map: Record<string, string> = {
    Beginner: `
      <ul style="margin:8px 0 0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
        <li>Start with the <strong>8 Wastes</strong> — identify at least 3 examples in your current role</li>
        <li>Apply <strong>5S</strong> to your own workspace this week as a hands-on exercise</li>
        <li>Shadow or interview a colleague who runs improvement projects</li>
        <li>Enrol in a structured Lean fundamentals course to accelerate your learning</li>
      </ul>`,
    Developing: `
      <ul style="margin:8px 0 0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
        <li>Create a <strong>Current State Value Stream Map</strong> for a key process in your organisation</li>
        <li>Run a focused <strong>Kaizen event</strong> targeting your highest-impact waste area</li>
        <li>Practice <strong>A3 thinking</strong> on a real problem — define the gap, analyse root cause, propose countermeasures</li>
        <li>Deepen your BPM skills to connect process design with measurable business outcomes</li>
      </ul>`,
    Intermediate: `
      <ul style="margin:8px 0 0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
        <li>Lead a <strong>cross-functional improvement initiative</strong> with clear KPIs and a structured review cadence</li>
        <li>Apply <strong>Hoshin Kanri</strong> to align your team's improvement priorities with strategic goals</li>
        <li>Begin coaching colleagues — teaching Lean is one of the fastest ways to deepen your own mastery</li>
        <li>Pursue the <strong>Lean Practitioner Certification</strong> to validate and credential your expertise</li>
      </ul>`,
    Advanced: `
      <ul style="margin:8px 0 0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
        <li>Design and deploy a <strong>Lean Management System</strong> across a business unit or value stream</li>
        <li>Develop internal <strong>Lean coaching and training capability</strong> to build organisational resilience</li>
        <li>Engage with senior leadership on <strong>strategic deployment</strong> using Hoshin Kanri</li>
        <li>Obtain formal certification to formalise your practitioner status for clients and stakeholders</li>
      </ul>`,
  }
  return map[level] || map['Beginner']
}

function getLearningPathSection(level: string): string {
  const base = 'https://academy.continuousimprovement.education/p/'
  const bundleUrl = base + 'certified-lean-practitioner-training-bundle?coupon_code=kaizen60'

  if (level === 'Intermediate' || level === 'Advanced') {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a1a1a;">Certified Lean Practitioner Bundle</p>
            <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">The complete practitioner certification — advanced methodologies, real-world projects, and an industry-recognised credential.</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#888;text-decoration:line-through;padding-right:12px;">$995</td>
                <td style="font-size:20px;font-weight:700;color:#2e7d32;padding-right:12px;">$398</td>
                <td><span style="background:#d32f2f;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;">60% OFF</span></td>
              </tr>
            </table>
            <p style="margin:12px 0 6px;font-size:12px;color:#555;font-weight:600;">What's included:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:#555;line-height:2;padding-right:8px;">+ Advanced Lean &amp; TPS methodologies<br>+ Value Stream Mapping mastery<br>+ Scientific Problem Solving (A3/PDCA)</td>
                <td style="font-size:12px;color:#555;line-height:2;">+ Hoshin Kanri strategic deployment<br>+ Industry-recognised certification<br>+ Lifetime course access</td>
              </tr>
            </table>
            <p style="margin:16px 0 0;">
              <a href="${bundleUrl}" style="display:inline-block;background:#1a1a1a;color:#ffd559;padding:10px 28px;border-radius:6px;font-weight:700;font-size:13px;text-decoration:none;">Enrol Now &rarr;</a>
              <span style="margin-left:12px;font-size:11px;color:#888;">Exclusive discount applied automatically</span>
            </p>
          </td>
        </tr>
      </table>`
  }

  if (level === 'Developing') {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 10px;">
        <tr>
          <td style="padding-bottom:10px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1a1a1a;">Advanced Value Stream Mapping</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#555;">Master end-to-end process visualisation and waste elimination</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#888;text-decoration:line-through;padding-right:8px;">$89</td>
                      <td style="font-size:15px;font-weight:700;color:#2e7d32;padding-right:8px;">$71</td>
                      <td><span style="background:#ffd559;color:#1a1a1a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">20% OFF</span></td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 0;">
                    <a href="${base}advanced-value-stream-mapping?coupon_code=kaizen60" style="display:inline-block;background:#1a1a1a;color:#ffd559;padding:8px 20px;border-radius:5px;font-weight:700;font-size:12px;text-decoration:none;">Enrol Now &rarr;</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1a1a1a;">Business Process Management</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#555;">Apply BPM techniques for sustained organisational efficiency</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#888;text-decoration:line-through;padding-right:8px;">$250</td>
                      <td style="font-size:15px;font-weight:700;color:#2e7d32;padding-right:8px;">$200</td>
                      <td><span style="background:#ffd559;color:#1a1a1a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">20% OFF</span></td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 0;">
                    <a href="${base}business-process-management?coupon_code=kaizen60" style="display:inline-block;background:#1a1a1a;color:#ffd559;padding:8px 20px;border-radius:5px;font-weight:700;font-size:12px;text-decoration:none;">Enrol Now &rarr;</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
  }

  // Beginner
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 10px;">
      <tr>
        <td style="padding-bottom:10px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1a1a1a;">Toyota Production System &amp; Lean Fundamentals</p>
                <p style="margin:0 0 8px;font-size:12px;color:#555;">Core TPS principles, 8 wastes, 5S, Jidoka, JIT — everything to get started</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#888;text-decoration:line-through;padding-right:8px;">$99</td>
                    <td style="font-size:15px;font-weight:700;color:#2e7d32;padding-right:8px;">$79</td>
                    <td><span style="background:#ffd559;color:#1a1a1a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">20% OFF</span></td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;">
                  <a href="${base}toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60" style="display:inline-block;background:#1a1a1a;color:#ffd559;padding:8px 20px;border-radius:5px;font-weight:700;font-size:12px;text-decoration:none;">Enrol Now &rarr;</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1a1a1a;">Scientific Problem Solving</p>
                <p style="margin:0 0 8px;font-size:12px;color:#555;">PDCA, A3 thinking, 5 Whys, root cause analysis in practice</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#888;text-decoration:line-through;padding-right:8px;">$89</td>
                    <td style="font-size:15px;font-weight:700;color:#2e7d32;padding-right:8px;">$71</td>
                    <td><span style="background:#ffd559;color:#1a1a1a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">20% OFF</span></td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;">
                  <a href="${base}en-home?coupon_code=kaizen60" style="display:inline-block;background:#1a1a1a;color:#ffd559;padding:8px 20px;border-radius:5px;font-weight:700;font-size:12px;text-decoration:none;">Enrol Now &rarr;</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function getAdminFollowUpSuggestion(level: string): string {
  const map: Record<string, string> = {
    Beginner:     'Recommend TPS & Lean Fundamentals + Scientific Problem Solving.',
    Developing:   'Suggest Advanced VSM and Business Process Management.',
    Intermediate: 'Offer Lean Practitioner certification (60% off with kaizen60).',
    Advanced:     'Propose Lean Practitioner certification (60% off) and coaching opportunities.',
  }
  return map[level] || map['Beginner']
}
