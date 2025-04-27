import Swal from 'sweetalert2';


const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});


export const showSuccess = (title = 'Berhasil', text = '') => {
  Toast.fire({
    icon: 'success',
    title,
    text,
  });
};

export const showError = (title = 'Gagal', text = '') => {
  Toast.fire({
    icon: 'error',
    title,
    text,
  });
};
