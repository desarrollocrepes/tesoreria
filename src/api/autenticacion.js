import axios from 'axios';

// Servicios de autenticación
export const serviciosAutenticacion = {
  // Validar analista por documento
  validarAnalista: async (documento) => {
    try {
      const respuesta = await axios.get('https://macfer.crepesywaffles.com/api/distribucion-analistas');
      
      console.log('Respuesta de la API:', respuesta.data);
      console.log('Buscando documento:', documento);
      
      // La API retorna { data: [...], meta: {...} }
      const analistas = respuesta.data.data;
      
      // Buscar el documento en la lista de analistas
      // El documento está en attributes.document
      const analistaEncontrado = analistas.find(a => {
        const docApi = String(a.attributes.document);
        const docIngresado = String(documento).trim();
        console.log('Comparando:', docApi, 'con', docIngresado);
        return docApi === docIngresado;
      });
      
      if (analistaEncontrado) {
        const datosUsuario = {
          documento: documento,
          rol: 'analista',
          nombre: analistaEncontrado.attributes.Analista,
          admin: analistaEncontrado.attributes.admin,
          basic: analistaEncontrado.attributes.basic,
          id: analistaEncontrado.id,
          datosCompletos: analistaEncontrado
        };
        
        // Guardar información del analista
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        
        console.log('Analista encontrado:', datosUsuario);
        
        return { 
          exito: true, 
          usuario: datosUsuario,
          rol: 'analista'
        };
      } else {
        console.log('Documento no encontrado');
        return { 
          exito: false, 
          mensaje: 'Documento no encontrado en el sistema de analistas' 
        };
      }
    } catch (error) {
      console.error('Error al validar analista:', error);
      throw { 
        exito: false, 
        mensaje: 'Error al conectar con el servidor. Intente nuevamente.' 
      };
    }
  },

  // Cerrar sesión
  cerrarSesion: () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  },

  // Obtener usuario actual
  obtenerUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obtener puntos de venta asignados al analista
  obtenerPdvsAnalista: async (documento) => {
    try {
      const respuesta = await axios.get(
        `https://macfer.crepesywaffles.com/api/distribucion-analistas?populate=*&filters[document][$eq]=${documento}`
      );
      
      console.log('PDVs del analista:', respuesta.data);
      
      if (respuesta.data.data && respuesta.data.data.length > 0) {
        const analista = respuesta.data.data[0];
        const pdvs = analista.attributes.pdv_ips.data.map(pdv => ({
          id: pdv.id,
          nombre: pdv.attributes.pdv,
          ip: pdv.attributes.ip,
          cu: pdv.attributes.cu,
          ciudad: pdv.attributes.ciudad,
          tipo: pdv.attributes.tipo,
          erp: pdv.attributes.erp,
          correo: pdv.attributes.correo,
          todosLosDatos: pdv.attributes
        }));
        
        return {
          exito: true,
          pdvs: pdvs,
          analista: analista.attributes.Analista
        };
      } else {
        return {
          exito: false,
          mensaje: 'No se encontraron puntos de venta para este analista'
        };
      }
    } catch (error) {
      console.error('Error al obtener PDVs:', error);
      throw {
        exito: false,
        mensaje: 'Error al cargar los puntos de venta'
      };
    }
  }
};

export default serviciosAutenticacion;
