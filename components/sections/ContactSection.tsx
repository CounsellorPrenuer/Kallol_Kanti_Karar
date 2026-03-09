import { useState, useEffect } from 'react'
import { SectionProps } from '@/lib/sections/registry'
import { urlForImage } from '@/lib/sanity'

// IMPORTANT: Replace with your deployed Cloudflare Worker URL
const WORKER_URL = 'https://kallol-payment-worker.YOUR_SUBDOMAIN.workers.dev'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function ContactSection({ title, description, email, phone, address, formTitle, id, backgroundImage }: SectionProps) {
  const bgImageUrl = backgroundImage ? urlForImage(backgroundImage).width(1600).height(900).url() : null
  const hasContactInfo = email || phone || address

  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState<{ valid?: boolean; message?: string; discountAmount?: number; finalAmount?: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Load initially from localStorage
    const saved = localStorage.getItem('selectedPackage')
    if (saved) {
      try {
        setSelectedPackage(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing saved package', e)
      }
    }

    // Listen for custom events
    const handlePackageSelection = (e: any) => {
      setSelectedPackage(e.detail)
    }

    window.addEventListener('packageSelected', handlePackageSelection)
    return () => window.removeEventListener('packageSelected', handlePackageSelection)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = (e.target as any) || {}
    const fieldName = e.target.placeholder.toLowerCase().includes('name') ? 'name' :
      e.target.placeholder.toLowerCase().includes('email') ? 'email' : 'message'
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    if (!selectedPackage) {
      setCouponStatus({ valid: false, message: 'Please select a package first' })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`${WORKER_URL}/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: parseFloat(selectedPackage.price) })
      })
      const data = await response.json()
      setCouponStatus(data)
    } catch (error) {
      console.error('Coupon validation error:', error)
      setCouponStatus({ valid: false, message: 'Could not validate coupon' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage) {
      alert('Please select a package first')
      return
    }

    const finalAmount = couponStatus?.valid ? couponStatus.finalAmount : parseFloat(selectedPackage.price)

    setIsProcessing(true)
    try {
      // 1. Create Order via Cloudflare Worker
      const orderResponse = await fetch(`${WORKER_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            packageName: selectedPackage.name,
            customerName: formData.name,
            customerEmail: formData.email
          }
        })
      })

      const orderData = await orderResponse.json()
      if (!orderResponse.ok) throw new Error(orderData.error || 'Order creation failed')

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_live_ZDRBsLXKmZI6Gu', // Client-side key id
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kallol Kanti Karar',
        description: `Payment for ${selectedPackage.name}`,
        order_id: orderData.id,
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        handler: function (response: any) {
          alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id)
          // Here you can redirect or show success message
        },
        theme: {
          color: '#3b82f6'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      alert('Payment failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section
      id={id || 'contact'}
      className="contact-section"
      style={{
        padding: '80px 20px',
        backgroundColor: 'var(--color-surface)',
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {/* Optional overlay if background image is present */}
      {bgImageUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {title && (
          <h2 style={{ fontSize: '3rem', marginBottom: '10px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: '700' }}>
            {title}
          </h2>
        )}
        {description && (
          <p style={{ fontSize: '1.1rem', marginBottom: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {description}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: hasContactInfo ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
            gap: '40px',
            maxWidth: hasContactInfo ? '1200px' : '600px',
            margin: '0 auto',
          }}
        >
          {/* Contact Information */}
          {hasContactInfo && (
            <div
              style={{
                backgroundColor: 'var(--color-background)',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <h3 style={{ fontSize: '1.75rem', marginBottom: '30px', color: 'var(--color-text-primary)', fontWeight: '600' }}>Get in Touch</h3>

              {selectedPackage && (
                <div style={{
                  backgroundColor: '#f0f7ff',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '30px',
                  border: '1px solid #3b82f6'
                }}>
                  <h4 style={{ color: '#3b82f6', marginBottom: '5px', marginTop: 0 }}>Selected Package</h4>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedPackage.name}</div>
                  <div style={{ fontSize: '1.1rem', color: '#666' }}>₹{selectedPackage.price}</div>

                  {couponStatus?.valid && (
                    <div style={{ marginTop: '10px', color: '#059669', fontWeight: '500' }}>
                      Coupon Applied: -₹{couponStatus.discountAmount}
                      <div style={{ fontSize: '1.2rem', color: '#059669' }}>Total: ₹{couponStatus.finalAmount}</div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {email && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</strong>
                    <a href={`mailto:${email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>{email}</a>
                  </div>
                )}
                {phone && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</strong>
                    <a href={`tel:${phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: '500' }}>{phone}</a>
                  </div>
                )}
                {address && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</strong>
                    <p style={{ color: 'var(--color-text-primary)', margin: 0, lineHeight: '1.6', fontSize: '1.1rem' }}>{address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div
            style={{
              backgroundColor: 'var(--color-background)',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {formTitle && <h3 style={{ fontSize: '1.75rem', marginBottom: '30px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{formTitle}</h3>}
            <form
              onSubmit={handlePayment}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <input
                type="text"
                required
                placeholder="Your Name"
                onChange={handleInputChange}
                style={{
                  padding: '16px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <input
                type="email"
                required
                placeholder="Your Email"
                onChange={handleInputChange}
                style={{
                  padding: '16px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: '16px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isProcessing || !couponCode}
                  style={{
                    padding: '0 20px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: (isProcessing || !couponCode) ? 0.6 : 1
                  }}
                >
                  Apply
                </button>
              </div>
              {couponStatus && (
                <div style={{
                  fontSize: '0.9rem',
                  color: couponStatus.valid ? '#059669' : '#dc2626',
                  marginTop: '-10px'
                }}>
                  {couponStatus.message || (couponStatus.valid ? 'Coupon applied successfully!' : '')}
                </div>
              )}

              <textarea
                placeholder="Your Message"
                rows={4}
                onChange={handleInputChange}
                style={{
                  padding: '16px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  minHeight: '100px',
                }}
              />
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  marginTop: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  opacity: isProcessing ? 0.7 : 1
                }}
              >
                {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}


