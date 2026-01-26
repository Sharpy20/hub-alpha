import { toast } from 'sonner'

/**
 * Toast notification utilities for Inpatient Hub
 * Uses sonner for lightweight, accessible notifications
 */

export const showSuccess = (message: string) => {
  toast.success(message)
}

export const showError = (message: string) => {
  toast.error(message)
}

export const showInfo = (message: string) => {
  toast.info(message)
}

export const showWarning = (message: string) => {
  toast.warning(message)
}

// Specialized toast messages for common actions
export const toasts = {
  // Task actions
  taskClaimed: (taskTitle: string) =>
    showSuccess(`Task claimed: ${taskTitle}`),
  taskUnclaimed: () =>
    showInfo('Task unclaimed'),
  taskStolen: (taskTitle: string) =>
    showSuccess(`Task taken over: ${taskTitle}`),
  taskSaved: () =>
    showSuccess('Task saved successfully'),
  taskCompleted: () =>
    showSuccess('Task marked as complete'),

  // Patient actions
  patientTransferred: (patientName: string, ward: string) =>
    showSuccess(`${patientName} transferred to ${ward} Ward`),
  dischargeConfirmed: (patientName: string) =>
    showSuccess(`Discharge confirmed for ${patientName}`),

  // Clipboard
  copiedToClipboard: () =>
    showSuccess('Copied to clipboard'),

  // Generic
  changesSaved: () =>
    showSuccess('Changes saved'),
  actionComplete: (action: string) =>
    showSuccess(`${action} complete`),
}
