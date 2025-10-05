'use client'

import { useState } from 'react'
import { X, Upload, FileText, CheckCircle } from 'lucide-react'
import { submitProviderClaim } from '@/lib/auth'

interface ProviderClaimModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string
  providerName: string
}

export default function ProviderClaimModal({ 
  isOpen, 
  onClose, 
  providerId, 
  providerName 
}: ProviderClaimModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    business_license: '',
    tax_id: '',
    verification_documents: [] as File[]
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({
      ...formData,
      verification_documents: [...formData.verification_documents, ...files]
    })
  }

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      verification_documents: formData.verification_documents.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Upload files to Supabase Storage and get URLs
      const documentUrls: string[] = [] // Placeholder for uploaded file URLs

      const result = await submitProviderClaim({
        provider_id: providerId,
        claimant_name: formData.claimant_name,
        claimant_email: formData.claimant_email,
        claimant_phone: formData.claimant_phone,
        business_license: formData.business_license,
        tax_id: formData.tax_id,
        verification_documents: documentUrls
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to submit claim')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Claim Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your claim for <strong>{providerName}</strong> has been submitted successfully. 
              Our team will review your application and contact you within 2-3 business days.
            </p>
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Claim Provider Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Claiming: {providerName}
            </h3>
            <p className="text-blue-700 text-sm">
              To claim this provider profile, please provide verification documents and business information. 
              Our team will review your application within 2-3 business days.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.claimant_name}
                  onChange={(e) => setFormData({ ...formData, claimant_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.claimant_email}
                  onChange={(e) => setFormData({ ...formData, claimant_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.claimant_phone}
                onChange={(e) => setFormData({ ...formData, claimant_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business License Number
                </label>
                <input
                  type="text"
                  value={formData.business_license}
                  onChange={(e) => setFormData({ ...formData, business_license: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter business license number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID / EIN
                </label>
                <input
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter tax ID or EIN"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Documents
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload documents to verify your identity and business (ID, business license, portfolio samples, etc.)
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload files or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, JPG, PNG up to 10MB each
                  </span>
                </label>
              </div>

              {formData.verification_documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {formData.verification_documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
