# Módulo de Analista - Gestión de Cierres de Caja

## Características Implementadas

### 1. **Selector de Punto de Venta**
- Carga automática de los puntos de venta asignados al analista
- Selección intuitiva con dropdown
- Visualización de nombre, ciudad y tipo de PDV

### 2. **Selector de Fechas Personalizado**
- **RangePicker de Ant Design**: Selector de rango de fechas elegante y profesional
- Formato de fecha: DD/MM/YYYY
- Iconos personalizados (calendario)
- Búsqueda dinámica al cambiar las fechas
- Por defecto selecciona el día actual

### 3. **Tabla de Cierres de Caja**
- **Columnas**:
  - **Fecha**: Ordenable con formato DD/MM/YYYY
  - **Turno**: Filtrable (Mañana/Tarde)
  - **Cajera**: Muestra nombre y número de documento
  - **Total Ventas**: Ordenable con formato de moneda
  - **Diferencia**: Con código de colores (rojo=faltante, verde=sobrante, gris=cuadrado)
  - **Estado**: Tags con colores (Cuadrado, Faltante, Sobrante) y filtros
  - **Acciones**: Botones de Ver y Editar

- **Características de la tabla**:
  - Paginación con tamaño configurable
  - Ordenamiento por columnas
  - Filtros por turno y estado
  - Indicador de total de registros
  - Scroll horizontal para pantallas pequeñas
  - Estados de carga
  - Mensaje cuando no hay datos

### 4. **Modal de Visualización de Detalles**
Muestra toda la información del cierre de caja de forma organizada:

- **Información General**:
  - Fecha del cierre
  - Turno (Mañana/Tarde)
  - Nombre de la cajera
  - Documento de la cajera

- **Resumen Financiero**:
  - Total de ventas (destacado)
  - Total en efectivo
  - Total en tarjetas
  - Diferencia (con código de colores)

- **Medios de Pago**:
  - Listado detallado de cada medio de pago
  - Cantidad de transacciones por medio
  - Valor total por medio de pago

### 5. **Modal de Edición**
Permite al analista editar cualquier cierre de caja:

- **Campos editables**:
  - Fecha del cierre
  - Turno
  - Total de ventas
  - Total en efectivo
  - Total en tarjetas
  
- **Características**:
  - Validación de campos numéricos
  - Prefijo de moneda ($)
  - Botones de Guardar y Cancelar
  - Mensajes de confirmación
  - Actualización automática en la tabla

### 6. **Integración con Ant Design**
- **Componentes utilizados**:
  - `Table`: Tabla profesional con todas las características
  - `DatePicker` / `RangePicker`: Selector de fechas elegante
  - `Modal`: Modales con diseño moderno
  - `Button`: Botones con iconos y estilos
  - `Tag`: Etiquetas con colores para estados
  - `Input`: Campos de entrada con validación
  - `message`: Notificaciones de éxito/error
  - `Tooltip`: Ayudas contextuales

### 7. **Iconografía con Lucide React**
- Iconos modernos y consistentes
- Eye: Ver detalles
- Edit: Editar cierre
- Calendar: Selector de fechas
- Search: Buscar cierres
- CheckCircle: Estado cuadrado
- AlertCircle: Estado con diferencia

## Estructura de Datos

### Cierre de Caja
```javascript
{
  id: number,
  fecha: string,           // Formato: YYYY-MM-DD
  turno: string,           // 'Mañana' o 'Tarde'
  cajera: string,
  documentoCajera: string,
  totalVentas: number,
  totalEfectivo: number,
  totalTarjetas: number,
  diferencia: number,
  estado: string,          // 'cuadrado', 'faltante', 'sobrante'
  horaInicio: string,
  horaFin: string,
  mediosPago: {
    [medio]: {
      cantidad: number,
      valor: number
    }
  }
}
```

## Funcionalidades Pendientes (TODO)

1. **Integración con API Backend**:
   - Reemplazar datos de ejemplo con llamadas reales a la API
   - Endpoint: `GET /api/cierres?pdv={id}&fechaInicio={fecha}&fechaFin={fecha}`
   - Endpoint: `PUT /api/cierres/{id}` para editar

2. **Exportación de Datos**:
   - Botón para exportar tabla a Excel/CSV
   - Exportar PDF con detalles del cierre

3. **Gráficos y Análisis**:
   - Gráfica de tendencias de ventas
   - Análisis de diferencias por cajera
   - Comparación de turnos

4. **Filtros Adicionales**:
   - Búsqueda por nombre de cajera
   - Filtro por rango de monto
   - Filtro por estado múltiple

5. **Permisos y Auditoría**:
   - Registrar quién edita cada cierre
   - Historial de cambios
   - Restricción de edición por fecha límite

## Estilos y Diseño

- **Paleta de colores**:
  - Fondo: #F7F2F0 (beige claro)
  - Blanco: #FFFFFF
  - Primario: #3b82f6 (azul)
  - Error: #ef4444 (rojo)
  - Éxito: #10b981 (verde)
  - Advertencia: #f59e0b (naranja)

- **Tipografía**:
  - Familia: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
  - Tamaños: 11px-16px

- **Responsive**:
  - Breakpoint móvil: 768px
  - Ajuste de columnas en tablets/móviles
  - Botones y filtros apilados en pantallas pequeñas

## Uso

1. **Seleccionar Punto de Venta**: Elegir la sede desde el dropdown
2. **Seleccionar Rango de Fechas**: Usar el selector de fechas para definir el período
3. **Ver Tabla de Cierres**: La tabla se actualiza automáticamente
4. **Ver Detalles**: Click en el icono de ojo para ver información completa
5. **Editar Cierre**: Click en el icono de lápiz para modificar valores
6. **Guardar Cambios**: Confirmar los cambios en el modal de edición

## Notas Técnicas

- **Formato de moneda**: COP (Peso colombiano) sin decimales
- **Formato de fecha**: dayjs para manejo consistente
- **Estado de carga**: Spinners mientras se cargan datos
- **Validación**: Campos numéricos con parseo automático
