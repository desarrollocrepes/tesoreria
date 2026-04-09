const Boton = ({ children, onClick, tipo = 'button', variante = 'primario', deshabilitado = false }) => {
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      className={`boton boton-${variante}`}
    >
      {children}
    </button>
  );
};

export default Boton;
