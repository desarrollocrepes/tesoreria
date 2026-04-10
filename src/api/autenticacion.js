import axios from 'axios';

export const serviciosAutenticacion = {

  validarAnalista: async (documento) => {
    try {
      const respuesta = await axios.get(`https://apialohav2.crepesywaffles.com/buk/tesoreria/${documento}`);
      
      console.log('Respuesta API Analista:', respuesta.data);
      
      if (respuesta.data.ok && respuesta.data.data) {
        const datos = respuesta.data.data;
        
        // Validar que el cargo_area sea ANALISTA VENTAS
        const esAnalista = datos.cargo_area && 
                          datos.cargo_area.toUpperCase().includes('ANALISTA VENTAS');
        
        if (esAnalista) {
          const datosUsuario = {
            documento: datos.document_number,
            rol: 'analista',
            nombre: datos.nombre,
            codigo: datos.codigo,
            cargoArea: datos.cargo_area,
            cargoGeneral: datos.cargo_general,
            areaName: datos.area_nombre,
            foto: datos.foto,
            datosCompletos: datos
          };
          
          console.log('Analista encontrado:', datosUsuario);
          
          return { 
            exito: true, 
            usuario: datosUsuario,
            rol: 'analista'
          };
        } else {
          console.log('No cumple requisitos de analista');
          return {
            exito: false,
            mensaje: 'El usuario no tiene permisos de analista'
          };
        }
      } else {
        return {
          exito: false,
          mensaje: 'Documento no encontrado en el sistema'
        };
      }
    } catch (error) {
      console.error('Error al validar analista:', error);
      // Si es error 404, el documento no existe
      if (error.response && error.response.status === 404) {
        return {
          exito: false,
          mensaje: 'Documento no encontrado en el sistema'
        };
      }
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
  },

 
  validarCajera: async (documento) => {
    try {
      const respuesta = await axios.get(`https://apialohav2.crepesywaffles.com/buk/tesoreria/${documento}`);
      
      console.log('Respuesta API Cajera:', respuesta.data);
      
      if (respuesta.data.ok && respuesta.data.data) {
        const datos = respuesta.data.data;
        
        // Validar que el cargo_area sea AUXILIAR DE RESTAURANTE
        const esCajera = datos.cargo_area && 
                        datos.cargo_area.toUpperCase().includes('AUXILIAR DE RESTAURANTE');
        
        if (esCajera) {
          const datosUsuario = {
            documento: datos.document_number,
            rol: 'cajera',
            nombre: datos.nombre,
            codigo: datos.codigo,
            pdv: datos.area_nombre,
            cargoArea: datos.cargo_area,
            cargoGeneral: datos.cargo_general,
            foto: datos.foto,
            datosCompletos: datos
          };
          
          console.log('Cajera encontrada:', datosUsuario);
          
          return {
            exito: true,
            usuario: datosUsuario,
            rol: 'cajera'
          };
        } else {
          console.log('No cumple requisitos de cajera');
          return {
            exito: false,
            mensaje: 'El usuario no tiene permisos de cajera'
          };
        }
      } else {
        return {
          exito: false,
          mensaje: 'Documento no encontrado en el sistema'
        };
      }
    } catch (error) {
      console.error('Error al validar cajera:', error);
      // Si es error 404, el documento no existe
      if (error.response && error.response.status === 404) {
        return {
          exito: false,
          mensaje: 'Documento no encontrado en el sistema'
        };
      }
      throw {
        exito: false,
        mensaje: 'Error al conectar con el servidor. Intente nuevamente.'
      };
    }
  }
};

export default serviciosAutenticacion;
