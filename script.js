document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias al DOM ---
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.navbar__link');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    const reservaForm = document.getElementById('reservaForm');
    const successModal = document.getElementById('successModal');
    const successClose = document.getElementById('successClose');
    const successDetails = document.getElementById('successDetails');
    const galeriaModal = document.getElementById('galeriaModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const galeriaItems = document.querySelectorAll('.galeria__item');
    const faqQuestions = document.querySelectorAll('.faq__question');
    const subscribeForm = document.getElementById('subscribeForm');
    const statNumbers = document.querySelectorAll('.stat__number[data-count]');

    // --- Array de imágenes de la galería para el modal ---
    let galeriaImages = [];
    let currentImageIndex = 0;

    galeriaItems.forEach(item => {
        const fullSrc = item.getAttribute('data-full');
        galeriaImages.push(fullSrc);
    });

    // ==================== NAVBAR: Cambio de estilo al hacer scroll ====================
    function updateNavbarOnScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbarOnScroll);
    // Verificar estado inicial
    updateNavbarOnScroll();

    // ==================== MENÚ HAMBURGUESA ====================
    function toggleMenu() {
        hamburgerBtn.classList.toggle('navbar__hamburger--active');
        navMenu.classList.toggle('navbar__nav--open');
        body.style.overflow = navMenu.classList.contains('navbar__nav--open') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburgerBtn.classList.remove('navbar__hamburger--active');
        navMenu.classList.remove('navbar__nav--open');
        body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('navbar__nav--open') &&
            !navMenu.contains(e.target) &&
            !hamburgerBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('navbar__nav--open')) {
            closeMenu();
        }
    });

    // ==================== TEMA CLARO/OSCURO ====================
    // Cargar tema guardado en localStorage
    const savedTheme = localStorage.getItem('ecocabanas-theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');

        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('ecocabanas-theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('ecocabanas-theme', 'light');
        }
    });

    // ==================== VALIDACIÓN DEL FORMULARIO DE RESERVACIÓN ====================
    const validaciones = {
        nombre: {
            elemento: document.getElementById('nombre'),
            errorElemento: document.getElementById('nombreError'),
            validar: (valor) => {
                if (!valor.trim()) return 'El nombre completo es obligatorio.';
                if (valor.trim().length < 4) return 'El nombre debe tener al menos 4 caracteres.';
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor.trim())) return 'El nombre solo puede contener letras y espacios.';
                return '';
            }
        },
        email: {
            elemento: document.getElementById('email'),
            errorElemento: document.getElementById('emailError'),
            validar: (valor) => {
                if (!valor.trim()) return 'El correo electrónico es obligatorio.';
                const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(valor.trim())) return 'Ingresa un correo electrónico válido (ejemplo@dominio.com).';
                return '';
            }
        },
        telefono: {
            elemento: document.getElementById('telefono'),
            errorElemento: document.getElementById('telefonoError'),
            validar: (valor) => {
                if (valor.trim() && !/^\+?\d{8,15}$/.test(valor.trim().replace(/[\s\-]/g, ''))) {
                    return 'Ingresa un número de teléfono válido (8 a 15 dígitos).';
                }
                return '';
            }
        },
        fechaIngreso: {
            elemento: document.getElementById('fechaIngreso'),
            errorElemento: document.getElementById('fechaIngresoError'),
            validar: (valor) => {
                if (!valor) return 'La fecha de ingreso es obligatoria.';
                const fecha = new Date(valor + 'T00:00:00');
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                if (fecha < hoy) return 'La fecha de ingreso no puede ser anterior a hoy.';
                return '';
            }
        },
        fechaSalida: {
            elemento: document.getElementById('fechaSalida'),
            errorElemento: document.getElementById('fechaSalidaError'),
            validar: (valor, valores) => {
                if (!valor) return 'La fecha de salida es obligatoria.';
                const salida = new Date(valor + 'T00:00:00');
                const ingreso = new Date(valores.fechaIngreso + 'T00:00:00');
                if (salida <= ingreso) return 'La fecha de salida debe ser posterior a la de ingreso.';
                return '';
            }
        },
        huespedes: {
            elemento: document.getElementById('huespedes'),
            errorElemento: document.getElementById('huespedesError'),
            validar: (valor) => {
                if (!valor) return 'Selecciona el número de huéspedes.';
                return '';
            }
        },
        habitacion: {
            elemento: document.getElementById('habitacion'),
            errorElemento: document.getElementById('habitacionError'),
            validar: (valor) => {
                if (!valor) return 'Selecciona un tipo de habitación.';
                return '';
            }
        }
    };

    // Validar un campo específico
    function validarCampo(nombreCampo) {
        const campo = validaciones[nombreCampo];
        const valor = campo.elemento.value;
        const valores = {
            fechaIngreso: validaciones.fechaIngreso.elemento.value,
        };

        // Validar también fechaSalida si cambia fechaIngreso
        if (nombreCampo === 'fechaIngreso' && validaciones.fechaSalida.elemento.value) {
            validarCampo('fechaSalida');
        }

        const error = campo.validar(valor, valores);
        campo.errorElemento.textContent = error;

        if (error) {
            campo.elemento.classList.add('error');
            campo.elemento.classList.remove('valid');
            return false;
        } else if (valor.trim()) {
            campo.elemento.classList.remove('error');
            campo.elemento.classList.add('valid');
            return true;
        } else {
            campo.elemento.classList.remove('error', 'valid');
            return false;
        }
    }

    // Limpiar error al escribir/cambiar
    Object.keys(validaciones).forEach(nombreCampo => {
        const campo = validaciones[nombreCampo];
        campo.elemento.addEventListener('input', () => {
            validarCampo(nombreCampo);
        });
        campo.elemento.addEventListener('change', () => {
            validarCampo(nombreCampo);
        });
    });

    // Validar todo el formulario
    function validarFormulario() {
        let esValido = true;
        Object.keys(validaciones).forEach(nombreCampo => {
            const valido = validarCampo(nombreCampo);
            if (!valido) esValido = false;
        });
        return esValido;
    }

    // Enviar formulario
    reservaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const esValido = validarFormulario();

        if (esValido) {
            // Construir resumen de la reservación
            const nombre = validaciones.nombre.elemento.value.trim();
            const email = validaciones.email.elemento.value.trim();
            const fechaIngreso = validaciones.fechaIngreso.elemento.value;
            const fechaSalida = validaciones.fechaSalida.elemento.value;
            const huespedes = validaciones.huespedes.elemento.options[validaciones.huespedes.elemento.selectedIndex].text;
            const habitacion = validaciones.habitacion.elemento.options[validaciones.habitacion.elemento.selectedIndex].text;

            successDetails.textContent = `${habitacion} | ${fechaIngreso} → ${fechaSalida} | ${huespedes}`;
            successModal.classList.add('modal--open');
            document.body.style.overflow = 'hidden';

            // Guardar en consola (simulación de envío)
            console.log('📋 Reservación enviada:', {
                nombre,
                email,
                fechaIngreso,
                fechaSalida,
                huespedes,
                habitacion,
                comentarios: document.getElementById('comentarios').value
            });

            reservaForm.reset();
            // Limpiar clases de validación
            Object.keys(validaciones).forEach(nombreCampo => {
                validaciones[nombreCampo].elemento.classList.remove('error', 'valid');
                validaciones[nombreCampo].errorElemento.textContent = '';
            });
        } else {
            // Scroll al primer error
            const primerError = document.querySelector('.form__group .error');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
        }
    });

    // Cerrar modal de éxito
    successClose.addEventListener('click', () => {
        successModal.classList.remove('modal--open');
        document.body.style.overflow = '';
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('modal--open');
            document.body.style.overflow = '';
        }
    });

    // ==================== MODAL DE GALERÍA ====================
    function openGaleriaModal(index) {
        currentImageIndex = index;
        modalImage.src = galeriaImages[currentImageIndex];
        modalImage.alt = `Imagen ${currentImageIndex + 1} de la galería`;
        galeriaModal.classList.add('modal--open');
        document.body.style.overflow = 'hidden';
    }

    function closeGaleriaModal() {
        galeriaModal.classList.remove('modal--open');
        document.body.style.overflow = '';
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galeriaImages.length;
        modalImage.src = galeriaImages[currentImageIndex];
        modalImage.alt = `Imagen ${currentImageIndex + 1} de la galería`;
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galeriaImages.length) % galeriaImages.length;
        modalImage.src = galeriaImages[currentImageIndex];
        modalImage.alt = `Imagen ${currentImageIndex + 1} de la galería`;
    }

    galeriaItems.forEach((item, index) => {
        item.addEventListener('click', () => openGaleriaModal(index));
    });

    modalClose.addEventListener('click', closeGaleriaModal);
    modalNext.addEventListener('click', showNextImage);
    modalPrev.addEventListener('click', showPrevImage);

    galeriaModal.addEventListener('click', (e) => {
        if (e.target === galeriaModal) closeGaleriaModal();
    });

    // Navegación con teclado en el modal de galería
    document.addEventListener('keydown', (e) => {
        if (!galeriaModal.classList.contains('modal--open')) return;
        if (e.key === 'Escape') closeGaleriaModal();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // ==================== FAQ: Mostrar/Ocultar respuestas ====================
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isOpen = faqItem.classList.contains('faq__item--open');

            // Cerrar todas las demás
            document.querySelectorAll('.faq__item--open').forEach(item => {
                item.classList.remove('faq__item--open');
                item.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });

            // Abrir o cerrar la actual
            if (!isOpen) {
                faqItem.classList.add('faq__item--open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ==================== SUSCRIPCIÓN EN FOOTER ====================
    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = subscribeForm.querySelector('input');
        const email = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

        if (emailRegex.test(email)) {
            alert('🎉 ¡Gracias por suscribirte! Recibirás nuestras ofertas especiales en tu correo.');
            emailInput.value = '';
        } else {
            alert('Por favor, ingresa un correo electrónico válido.');
        }
    });

    // ==================== ANIMACIÓN DE CONTADORES (NOSOTROS) ====================
    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 segundos
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing ease-out
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(easedProgress * target);

                stat.textContent = currentValue.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // ==================== ANIMACIONES AL HACER SCROLL ====================
    const elementosAnimados = document.querySelectorAll(
        '.habitacion-card, .servicio-card, .tarifa-card, .testimonio-card, .galeria__item, .faq__item, .nosotros__image, .nosotros__content'
    );

    elementosAnimados.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll--visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementosAnimados.forEach(el => observer.observe(el));

    // Observer específico para los contadores (sección nosotros)
    const statsSection = document.querySelector('.nosotros__stats');
    if (statsSection) {
        let countersAnimated = false;
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    animateCounters();
                    countersAnimated = true;
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // ==================== SCROLL SUAVE PARA ANCLAS (RESPALDO) ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 16;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== HIGHLIGHT DE SECCIÓN ACTIVA EN NAVBAR ====================
    const secciones = document.querySelectorAll('section[id]');

    function highlightActiveSection() {
        const scrollY = window.pageYOffset;
        const navbarHeight = navbar.offsetHeight;

        secciones.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('navbar__link--active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('navbar__link--active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        updateNavbarOnScroll();
        highlightActiveSection();
    });

    // Estilo para el enlace activo en CSS
    const styleActive = document.createElement('style');
    styleActive.textContent = `
        .navbar__link--active {
            color: var(--color-primary) !important;
            background-color: rgba(45, 106, 79, 0.1);
            font-weight: 600;
        }
        body.dark-mode .navbar__link--active {
            background-color: rgba(64, 145, 108, 0.2);
        }
        .navbar__link--cta.navbar__link--active {
            background-color: var(--color-primary-dark) !important;
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(styleActive);

    // ==================== INICIALIZACIÓN FINAL ====================
    console.log('🌿 EcoHostal El Paraíso - Landing Page lista');
    console.log('📍 Ruta de las Flores, El Salvador');
    console.log('✅ Navbar interactiva | Menú hamburguesa | Validación de formulario | Modal de galería | FAQ | Tema oscuro | Animaciones');

    // Establecer fecha mínima en los campos de fecha (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    validaciones.fechaIngreso.elemento.setAttribute('min', hoy);
    validaciones.fechaSalida.elemento.setAttribute('min', hoy);
});