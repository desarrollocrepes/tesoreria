import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios
 * @param {Object} valoresIniciales - Valores iniciales del formulario
 * @returns {Object} - Estado y funciones del formulario
 */
export const useFormulario = (valoresIniciales = {}) => {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValores(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const manejarEnvio = useCallback((validar, alEnviar) => {
    return async (e) => {
      e.preventDefault();
      setEnviando(true);

      // Validar si se proporciona función de validación
      if (validar) {
        const erroresValidacion = validar(valores);
        setErrores(erroresValidacion);
        
        if (Object.keys(erroresValidacion).length > 0) {
          setEnviando(false);
          return;
        }
      }

      try {
        await alEnviar(valores);
      } catch (error) {
        console.error('Error al enviar formulario:', error);
      } finally {
        setEnviando(false);
      }
    };
  }, [valores]);

  const reiniciar = useCallback(() => {
    setValores(valoresIniciales);
    setErrores({});
    setEnviando(false);
  }, [valoresIniciales]);

  return {
    valores,
    errores,
    enviando,
    manejarCambio,
    manejarEnvio,
    reiniciar,
    setValores,
    setErrores
  };
};

export default useFormulario;
