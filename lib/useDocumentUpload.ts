'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from './store'
import { idbSet, idbDelete, idbGetObjectUrl } from './idb'
import { sbUploadDocument, sbSaveDocumentMeta, sbDeleteDocument } from './supabase'
import { DOCUMENTS } from './data'
import type { DocumentFile } from './types'

export function useDocumentUpload() {
  const { state, dispatch } = useApp()
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const inputRefs   = useRef<Record<string, HTMLInputElement | null>>({})
  const objectUrls  = useRef<string[]>([])

  // Restore Object URLs from IndexedDB on mount (for locally-stored files without a Supabase URL)
  useEffect(() => {
    const restore = async () => {
      for (const [key, df] of Object.entries(state.documentFiles)) {
        if (df.status === 'uploaded' && df.storageType === 'local' && !df.url) {
          const url = await idbGetObjectUrl(`doc_${key}`)
          if (url) {
            objectUrls.current.push(url)
            dispatch({ type: 'SET_DOC_URL', key, url })
          }
        }
      }
    }
    restore()
    return () => { objectUrls.current.forEach(u => URL.revokeObjectURL(u)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: string
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (inputRefs.current[docKey]) inputRefs.current[docKey]!.value = ''

    const doc = DOCUMENTS.find(d => d.key === docKey)!
    const clearErr = () =>
      setErrors(prev => { const n = { ...prev }; delete n[docKey]; return n })

    // ── Frontend validation ───────────────────────────────────────────────
    if (!doc.mimeTypes.includes(file.type)) {
      const friendly = doc.mimeTypes
        .map(m =>
          m.split('/').pop()!
            .replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
            .replace('msword', 'doc')
            .replace('jpeg', 'jpg')
        )
        .join(', ')
        .toUpperCase()
      setErrors(prev => ({ ...prev, [docKey]: `Invalid type. Allowed: ${friendly}` }))
      return
    }
    if (file.size > doc.maxSizeMB * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [docKey]: `File too large. Maximum is ${doc.maxSizeMB} MB.`,
      }))
      return
    }

    clearErr()
    setUploading(prev => ({ ...prev, [docKey]: true }))

    try {
      // ── Backend validation ────────────────────────────────────────────────
      const vRes = await fetch('/api/upload/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: docKey, name: file.name, size: file.size, mimeType: file.type,
        }),
      })
      const vData = await vRes.json()
      if (!vRes.ok) {
        setErrors(prev => ({ ...prev, [docKey]: vData.error }))
        return
      }

      // ── Storage: Supabase → IndexedDB fallback ────────────────────────────
      let url: string | undefined
      let storageType: 'local' | 'supabase' = 'local'

      if (state.user.supabaseId) {
        try {
          url = await sbUploadDocument(state.user.supabaseId, file, docKey)
          storageType = 'supabase'
        } catch { /* fall through to local */ }
      }

      if (storageType === 'local') {
        await idbSet(`doc_${docKey}`, file)
        const objUrl = URL.createObjectURL(file)
        objectUrls.current.push(objUrl)
        url = objUrl
      }

      const docFile: DocumentFile = {
        key: docKey, name: file.name, size: file.size,
        mimeType: file.type, uploadedAt: new Date().toISOString(),
        status: 'uploaded', storageType, url,
      }

      dispatch({ type: 'SET_DOCUMENT_FILE', file: docFile })
      dispatch({
        type: 'SET_USER',
        user: { documents: { ...state.user.documents, [docKey]: true } },
      })
      // Persist metadata to Supabase if user is authenticated
      if (state.user.supabaseId && storageType === 'supabase') {
        sbSaveDocumentMeta(state.user.supabaseId, docFile)
      }
      clearErr()
    } catch {
      setErrors(prev => ({
        ...prev,
        [docKey]: 'Upload failed. Check your connection and try again.',
      }))
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }))
    }
  }

  function handleRemove(docKey: string) {
    const existing = state.documentFiles[docKey]
    idbDelete(`doc_${docKey}`)
    if (state.user.supabaseId && existing?.storageType === 'supabase') {
      sbDeleteDocument(state.user.supabaseId, docKey, existing.name)
    }
    dispatch({ type: 'REMOVE_DOCUMENT_FILE', key: docKey })
    const docs = { ...state.user.documents }
    delete docs[docKey]
    dispatch({ type: 'SET_USER', user: { documents: docs } })
    setErrors(prev => { const n = { ...prev }; delete n[docKey]; return n })
  }

  function triggerInput(docKey: string) {
    inputRefs.current[docKey]?.click()
  }

  const requiredDocs  = DOCUMENTS.filter(d => d.required)
  const allRequiredOk = requiredDocs.every(
    d => state.documentFiles[d.key]?.status === 'uploaded'
  )

  return {
    uploading,
    errors,
    inputRefs,
    documentFiles: state.documentFiles,
    allRequiredOk,
    handleFileSelect,
    handleRemove,
    triggerInput,
  }
}
