// ============================================================
// src/app/api/contact/route.ts
// Octavian Global — Contact form submission
// Saves to Supabase + sends notification via Resend
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const CONTACT_NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL ?? 'contact@octavian.global'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, organization, inquiry_type, message } = body

    // ── Validation ────────────────────────────────────────
    if (!name || !email || !inquiry_type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, inquiry_type, message' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message exceeds 2000 character limit' }, { status: 400 })
    }

    const validInquiryTypes = [
      'institutional_inquiry',
      'private_briefing',
      'press',
      'partnership',
      'general',
    ]
    if (!validInquiryTypes.includes(inquiry_type)) {
      return NextResponse.json({ error: 'Invalid inquiry type' }, { status: 400 })
    }

    // ── Save to Supabase ──────────────────────────────────
    const supabase = createServiceClient() as any
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        organization: organization?.trim() ?? null,
        inquiry_type,
        message: message.trim(),
        responded: false,
      })

    if (dbError) {
      console.error('[api/contact] Supabase insert error:', dbError.message)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // ── Send notification email via Resend ─────────────────
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Octavian Global <noreply@octavian.global>',
            to: CONTACT_NOTIFY_EMAIL,
            subject: `[Octavian] New ${inquiry_type.replace('_', ' ')} inquiry — ${name}`,
            text: [
              `Name: ${name}`,
              `Email: ${email}`,
              `Organization: ${organization ?? 'Not provided'}`,
              `Type: ${inquiry_type}`,
              '',
              'Message:',
              message,
            ].join('\n'),
          }),
        })
      } catch (emailError) {
        // Don't fail the request if email notification fails
        console.error('[api/contact] Resend notification error:', emailError)
      }
    }

    return NextResponse.json(
      { success: true, message: 'Submission received.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/contact] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
