export default function TermsPage() {
  return (
    <div style={{ background:'#020817', minHeight:'100vh', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ marginBottom:48 }}>
          <p style={{ fontSize:12, color:'#6366F1', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Legal</p>
          <h1 style={{ fontSize:40, fontWeight:800, color:'white', marginBottom:8 }}>Terms of Service</h1>
          <p style={{ color:'#64748B', fontSize:14 }}>Last updated: May 2026</p>
        </div>

        {[
          { title:'1. Acceptance', body:'By accessing or using Sho8lana ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. These terms apply to all users including students, employers, and developers.' },
          { title:'2. Eligibility', body:'Students must be enrolled in or have recently graduated from a recognized Egyptian university. Employers must be a registered legal entity. You must be at least 18 years old to use the Platform. By using the Platform you represent that you meet these requirements.' },
          { title:'3. Student accounts', body:'Students may use the Platform free of charge. You agree to: complete simulations honestly and independently without assistance or automated tools, represent your skills and achievements accurately, not manipulate or artificially inflate your KPI scores. Violation of these rules may result in account suspension or permanent ban.' },
          { title:'4. Employer accounts', body:'Employers access the talent marketplace through paid subscription plans. Subscriptions are billed monthly and renew automatically. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are not provided for partial billing periods. Employers agree to use candidate data solely for legitimate hiring purposes and not to discriminate unlawfully.' },
          { title:'5. Simulations and content', body:'Employers who upload simulation content represent that they own or have rights to all content uploaded. Sho8lana is not responsible for the accuracy or legality of employer-submitted content. We reserve the right to remove content that violates these terms or applicable law.' },
          { title:'6. Intellectual property', body:'Sho8lana retains all rights to the Platform, including its design, code, and proprietary algorithms. Student simulation performance data, while owned by the student, may be aggregated and anonymized for platform analytics. You grant Sho8lana a limited license to display your profile to verified employers on the Platform.' },
          { title:'7. Prohibited conduct', body:'You may not: use the Platform for any unlawful purpose; attempt to gain unauthorized access to any part of the Platform; reverse engineer or scrape the Platform; submit false or misleading information; harass or discriminate against other users; use automated tools to interact with the Platform without prior written consent.' },
          { title:'8. Payments and billing', body:'Company subscriptions are processed through Stripe. By subscribing, you authorize Stripe to charge your payment method on a recurring basis. Prices are in USD and do not include applicable taxes, which are your responsibility. We reserve the right to change pricing with 30 days notice to existing subscribers.' },
          { title:'9. Limitation of liability', body:'The Platform is provided "as is" without warranties of any kind. Sho8lana is not liable for: indirect, incidental, or consequential damages; loss of profits or data; actions taken by employers based on student KPI profiles; employment outcomes. Our total liability is limited to the amount you paid in the 3 months preceding the claim.' },
          { title:'10. Termination', body:'We reserve the right to suspend or terminate accounts that violate these Terms. You may close your account at any time from the Profile screen. Upon termination, your right to use the Platform ceases immediately, though some data may be retained as described in our Privacy Policy.' },
          { title:'11. Governing law', body:'These Terms are governed by the laws of Egypt. Disputes shall first be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to the courts of Cairo, Egypt.' },
          { title:'12. Contact', body:'For questions about these Terms: legal@sho8lana.com' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom:36, paddingBottom:36, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'white', marginBottom:10 }}>{s.title}</h2>
            <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ marginTop:48, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ color:'#6366F1', textDecoration:'none', fontSize:14, fontWeight:600 }}>← Back to Sho8lana</a>
        </div>
      </div>
    </div>
  )
}
