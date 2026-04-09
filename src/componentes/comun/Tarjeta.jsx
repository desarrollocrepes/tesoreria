const Tarjeta = ({ titulo, children, className = '' }) => {
  return (
    <div className={`tarjeta ${className}`}>
      {titulo && <h3 className="tarjeta-titulo">{titulo}</h3>}
      <div className="tarjeta-contenido">
        {children}
      </div>
    </div>
  );
};

export default Tarjeta;
