// components/ui/Modal.jsx
// Se usa createPortal para montar el modal directamente en document.body,
// evitando que cualquier ancestor con overflow/transform/position rompa el fixed.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    // Bloquear scroll del body mientras el modal está abierto
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)

    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return createPortal(
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
