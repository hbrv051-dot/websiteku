import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

// 1. Toast Notification Config
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0f172a',
  color: '#f8fafc',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-medium',
  },
});

/**
 * Display a modern corner toast using SweetAlert2
 */
export const showToast = (
  title: string,
  icon: SweetAlertIcon = 'success'
) => {
  return Toast.fire({
    icon,
    title,
  });
};

/**
 * Display a standard modal alert
 */
export const showAlert = (
  title: string,
  text?: string,
  icon: SweetAlertIcon = 'info'
) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#2563eb',
    customClass: {
      popup: 'rounded-3xl shadow-2xl border border-slate-200',
      confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs',
      title: 'text-lg font-extrabold text-slate-800',
      htmlContainer: 'text-xs text-slate-600',
    },
  });
};

/**
 * Display a Success modal
 */
export const showSuccess = (title: string, text?: string) => {
  return showAlert(title, text, 'success');
};

/**
 * Display an Error modal
 */
export const showError = (title: string, text?: string) => {
  return showAlert(title, text, 'error');
};

/**
 * Display a confirmation dialog (e.g. Delete, Clear, Restore, Logout)
 */
export const showConfirmDialog = async (options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
  confirmButtonColor?: string;
  isDangerous?: boolean;
}): Promise<boolean> => {
  const {
    title,
    text = '',
    confirmButtonText = 'Ya, Lanjutkan',
    cancelButtonText = 'Batal',
    icon = 'warning',
    confirmButtonColor = options.isDangerous ? '#e11d48' : '#2563eb',
  } = options;

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-3xl shadow-2xl border border-slate-200',
      confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs shadow-md',
      cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs border border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200',
      title: 'text-lg font-extrabold text-slate-800',
      htmlContainer: 'text-xs text-slate-600',
    },
  });

  return result.isConfirmed;
};

export default Swal;
