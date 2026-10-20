document.addEventListener('DOMContentLoaded', () => {
    // VISIBILIDAD DE CONTRASEÑA
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function () {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.querySelector('i').classList.toggle('bi-eye');
            this.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }

    const toggleButtons = document.querySelectorAll('.toggle-pass');
    if (toggleButtons.length > 0) {
        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);

                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    this.querySelector('i').classList.toggle('bi-eye');
                    this.querySelector('i').classList.toggle('bi-eye-slash');
                }
            });
        });
    }

    // VALIDACIÓN Y AUTENTICACIÓN EN LOGIN
    const loginForm = document.querySelector('main.auth-wrapper form');
    if (loginForm && !document.getElementById('nombre')) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            const emailVal = emailInput.value.trim().toLowerCase();
            const passVal = passInput.value;

            // Leemos la lista sincronizada desde Java (dokyUsuarios)
            const usuarios = JSON.parse(localStorage.getItem('dokyUsuarios') || '[]');
            const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === emailVal);

            if (!usuarioEncontrado) {
                alert('No existe una cuenta registrada con este correo electrónico.\nPor favor, crea una cuenta primero.');
                emailInput.focus();
                return;
            }

            if (usuarioEncontrado.password !== passVal) {
                alert('La contraseña ingresada es incorrecta. Por favor verifícala.');
                passInput.focus();
                return;
            }

            // Guardamos sesión activa en el navegador
            localStorage.setItem('dokyUsuarioActivo', JSON.stringify(usuarioEncontrado));

            // Si es ADMIN (según el rol asignado en Java o JS)
            if (usuarioEncontrado.rol && usuarioEncontrado.rol.toUpperCase() === 'ADMIN') {
                alert('¡Inicio de sesión exitoso!\nEstás en el panel de administrador.');
                window.location.href = '/administracion';
            } else {
                alert(`¡Inicio de sesión exitoso!\nBienvenido de vuelta, ${usuarioEncontrado.nombre}.`);
                window.location.href = '/';
            }
        });
    }

    // REGISTRO Y GUARDADO DE CUENTA 
    const createForm = document.querySelector('.card-register form');
    if (createForm) {
        const docInput = document.getElementById('documento');
        const telInput = document.getElementById('telefono');

        if (docInput) {
            docInput.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9A-Za-z]/g, '');
            });
        }

        if (telInput) {
            telInput.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }

        createForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const apellidos = document.getElementById('apellidos').value.trim();
            const tipoDoc = document.getElementById('tipoDoc').value;
            const documento = document.getElementById('documento').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const nacimiento = document.getElementById('nacimiento').value;
            const email = document.getElementById('email').value.trim().toLowerCase();
            const pass = document.getElementById('password').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            const checkDatos = document.getElementById('checkDatos');

            if (nombre.length < 3) {
                alert('El nombre debe tener al menos 3 caracteres.');
                document.getElementById('nombre').focus();
                return;
            }

            if (apellidos.length < 3) {
                alert('Los apellidos deben tener al menos 3 caracteres.');
                document.getElementById('apellidos').focus();
                return;
            }

            if (!tipoDoc) {
                alert('Por favor, selecciona un tipo de documento.');
                document.getElementById('tipoDoc').focus();
                return;
            }

            if (tipoDoc === 'DNI' && documento.length !== 8) {
                alert('El DNI debe tener exactamente 8 dígitos numéricos.');
                document.getElementById('documento').focus();
                return;
            } else if (documento.length < 4) {
                alert('Por favor, ingresa un número de documento válido.');
                document.getElementById('documento').focus();
                return;
            }

            // Teléfono de 9 dígitos y que empiece con 9 
            if (telefono.length !== 9 || !telefono.startsWith('9')) {
                alert('El número de teléfono celular debe tener 9 dígitos y comenzar obligatoriamente con el número 9.');
                document.getElementById('telefono').focus();
                return;
            }

            // Validación de mayoría de edad
            if (!nacimiento) {
                alert('Por favor, ingresa tu fecha de nacimiento.');
                document.getElementById('nacimiento').focus();
                return;
            }

            const fechaNac = new Date(nacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNac.getFullYear();
            const mes = hoy.getMonth() - fechaNac.getMonth();

            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                edad--;
            }

            if (edad < 18) {
                alert('Debes ser mayor de edad para registrarte.');
                document.getElementById('nacimiento').focus();
                return;
            }

            // Validación de Correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const userPart = email.split('@')[0] || '';
            if (userPart.length < 3 || !emailRegex.test(email)) {
                alert('Ingresa un correo electrónico válido (mínimo 3 caracteres antes del @).');
                document.getElementById('email').focus();
                return;
            }

            // Verificar si el correo ya está registrado
            const usuarios = JSON.parse(localStorage.getItem('dokyUsuarios') || '[]');
            if (usuarios.some(u => u.email.toLowerCase() === email)) {
                alert('Este correo electrónico ya se encuentra registrado. Por favor utilice otro correo para iniciar sesión.');
                document.getElementById('email').focus();
                return;
            }

            // Validación de Contraseña segura
            const hasUpperCase = /[A-Z]/.test(pass);
            const hasNumber = /[0-9]/.test(pass);
            const hasSpecialChar = /[!@°#$%&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

            if (pass.length < 8) {
                alert('La contraseña debe tener al menos 8 caracteres.');
                document.getElementById('password').focus();
                return;
            }

            if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
                alert('La contraseña debe incluir al menos una letra mayúscula, un número y un carácter especial.');
                document.getElementById('password').focus();
                return;
            }

            if (pass !== confirmPass) {
                alert('Las contraseñas no coinciden. Por favor verifícalas.');
                document.getElementById('confirmPassword').focus();
                return;
            }

            // Aceptar términos y tratamiento de datos
            if (checkDatos && !checkDatos.checked) {
                alert('Debes aceptar la política y tratamiento de datos personales para continuar.');
                checkDatos.focus();
                return;
            }

            // Guardar usuario en localStorage
            const nuevoUsuario = {
                nombre: nombre,
                apellidos: apellidos,
                tipoDoc: tipoDoc,
                documento: documento,
                telefono: telefono,
                nacimiento: nacimiento,
                email: email,
                password: pass
            };

            usuarios.push(nuevoUsuario);
            localStorage.setItem('dokyUsuarios', JSON.stringify(usuarios));

            alert('¡Cuenta creada con éxito!\nTu registro ha sido completado. Procediendo a iniciar sesión...');
            window.location.href = '/login';
        });
    }

});