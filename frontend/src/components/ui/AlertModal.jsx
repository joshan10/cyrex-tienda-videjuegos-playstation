import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertContext } from './alertContext';

const ALERT_STYLES = {
  success: {
    wrapper: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
    button: 'bg-emerald-500 text-white hover:bg-emerald-400'
  },
  error: {
    wrapper: 'bg-red-500/10 border-red-500/40 text-red-400',
    button: 'bg-red-500 text-white hover:bg-red-400'
  },
  warning: {
    wrapper: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
    button: 'bg-amber-500 text-white hover:bg-amber-400'
  },
  info: {
    wrapper: 'bg-blue-500/10 border-blue-500/40 text-blue-400',
    button: 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90'
  }
};

const ICONS = {
  success: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  ),
  error: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  ),
  warning: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  ),
  info: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  )
};

const DEFAULT_TITLES = {
  success: '¡Listo!',
  error: 'Ups, algo salió mal',
  warning: 'Atención',
  info: 'Información'
};

function resolveMessage(message) {
  if (!message) return '';
  if (typeof message === 'string') return message;
  return (
    message?.error?.message ||
    (typeof message?.error === 'string' ? message.error : null) ||
    message?.detail ||
    message?.message ||
    'Ocurrió un error inesperado.'
  );
}

export function AlertProvider({ children }) {
  const [state, setState] = useState(null);
  const [visible, setVisible] = useState(false);
  const resolverRef = useRef(null);

  const close = useCallback((result = true) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setVisible(false);
    setState(null);
    resolve?.(result);
  }, []);

  const open = useCallback((config) => {
    resolverRef.current = config.resolve;
    setState(config);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const showAlert = useCallback(
    ({ type = 'success', title, message, duration = 4000, buttonText = 'Aceptar' } = {}) =>
      new Promise((resolve) => {
        open({
          type,
          title: title || DEFAULT_TITLES[type] || 'Aviso',
          message: resolveMessage(message),
          confirm: false,
          duration,
          buttonText,
          resolve
        });
      }),
    [open]
  );

  const showConfirm = useCallback(
    ({
      type = 'warning',
      title = '¿Estás seguro?',
      message = '',
      confirmText = 'Sí, continuar',
      cancelText = 'Cancelar'
    } = {}) =>
      new Promise((resolve) => {
        open({
          type,
          title,
          message: resolveMessage(message),
          confirm: true,
          duration: 0,
          buttonText: confirmText,
          cancelText,
          resolve
        });
      }),
    [open]
  );

  useEffect(() => {
    if (!state || !state.duration) return undefined;
    const timer = setTimeout(() => close(true), state.duration);
    return () => clearTimeout(timer);
  }, [state, close]);

  useEffect(() => {
    if (!state) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close(state.confirm ? false : true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, close]);

  const value = { showAlert, showConfirm };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {state && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-[color:rgba(9,10,15,.72)] px-4 backdrop-blur-sm transition-opacity duration-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(state.confirm ? false : true);
          }}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={state.title}
            className={`w-full max-w-sm scale-95 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,.45)] transition-all duration-200 ${
              visible ? 'scale-100 opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${ALERT_STYLES[state.type]?.wrapper || ALERT_STYLES.info.wrapper}`}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {ICONS[state.type] || ICONS.info}
              </svg>
            </div>

            <h3 className="mt-4 font-display text-xl text-[var(--color-text)]">{state.title}</h3>
            {state.message && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{state.message}</p>
            )}

            <div className={`mt-6 flex gap-3 ${state.confirm ? '' : 'justify-center'}`}>
              {state.confirm && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-line)]"
                >
                  {state.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => close(true)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  ALERT_STYLES[state.type]?.button || ALERT_STYLES.info.button
                }`}
              >
                {state.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export default AlertProvider;
