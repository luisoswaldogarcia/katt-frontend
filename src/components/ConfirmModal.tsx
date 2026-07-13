interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-xs space-y-4 border border-katt-200 dark:border-katt-800" onClick={e => e.stopPropagation()}>
        <p className="text-sm text-center">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors border border-katt-200 dark:border-katt-800">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
