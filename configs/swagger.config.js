export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema Bancario Core API',
    version: '1.0.0',
    description: 'Documentación oficial del Core Server para el Sistema Bancario del grupo 1, IN6BV. Gestiona cuentas, transferencias, productos y favoritos.',
  },
  servers: [
    {
      url: '/api/v1/bank',
      description: 'Ruta base'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu JWT token proporcionado por el AuthService'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    // ==========================================
    // CUENTAS (7 Endpoints)
    // ==========================================
    '/accounts/create': {
      post: {
        tags: ['Cuentas'],
        summary: 'Crear una cuenta bancaria',
        description: 'Requiere ADMIN_ROLE. Crea un perfil bancario y genera un número de cuenta aleatorio.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['authAccountId', 'dpi', 'address', 'phone', 'jobName', 'monthlyIncome'],
                properties: {
                  authAccountId: { type: 'string', example: 'USER_ID_EXTERNO' },
                  dpi: { type: 'string', example: '1234567890123' },
                  address: { type: 'string', example: 'Ciudad de Guatemala' },
                  phone: { type: 'string', example: '55554444' },
                  jobName: { type: 'string', example: 'Desarrollador' },
                  monthlyIncome: { type: 'number', example: 5000 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Cuenta creada' }, '400': { description: 'Error de validación' } }
      }
    },
    '/accounts/': {
      get: {
        tags: ['Cuentas'],
        summary: 'Obtener todas las cuentas',
        description: 'Requiere ADMIN_ROLE. Lista todas las cuentas bancarias del sistema.',
        responses: { '200': { description: 'Lista de cuentas' } }
      }
    },
    '/accounts/my-account': {
      get: {
        tags: ['Cuentas'],
        summary: 'Obtener mi cuenta',
        description: 'Devuelve la información de la cuenta bancaria asociada al token actual.',
        responses: { '200': { description: 'Datos de la cuenta' }, '404': { description: 'Cuenta no encontrada' } }
      }
    },
    '/accounts/my-account/currencies': {
      get: {
        tags: ['Cuentas'],
        summary: 'Obtener mi saldo en divisas',
        description: 'Devuelve el saldo actual de la cuenta convertido a múltiples divisas (USD, EUR, BTC, etc.).',
        responses: { '200': { description: 'Saldo con divisas' } }
      }
    },
    '/accounts/{id}': {
      put: {
        tags: ['Cuentas'],
        summary: 'Actualizar cuenta',
        description: 'Permite editar dirección, teléfono, trabajo e ingresos. Un usuario solo puede editar su cuenta a menos que sea ADMIN.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  jobName: { type: 'string' },
                  monthlyIncome: { type: 'number' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Cuenta actualizada' } }
      }
    },
    '/accounts/{id}/activate': {
      put: {
        tags: ['Cuentas'],
        summary: 'Activar cuenta',
        description: 'Requiere ADMIN_ROLE. Cambia el estado de la cuenta a activa.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Cuenta activada' } }
      }
    },
    '/accounts/{id}/desactivate': {
      put: {
        tags: ['Cuentas'],
        summary: 'Desactivar cuenta',
        description: 'Requiere ADMIN_ROLE. Bloquea la cuenta.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Cuenta desactivada' } }
      }
    },

    // ==========================================
    // FAVORITOS (7 Endpoints)
    // ==========================================
    '/favorites/': {
      get: {
        tags: ['Favoritos'],
        summary: 'Mis favoritos',
        description: 'Obtiene la lista de cuentas favoritas del usuario logueado.',
        responses: { '200': { description: 'Lista de favoritos' } }
      },
      post: {
        tags: ['Favoritos'],
        summary: 'Agregar favorito',
        description: 'Agrega una cuenta existente a la libreta de favoritos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['favoriteAccountNumber'],
                properties: {
                  favoriteAccountNumber: { type: 'string', example: '1234567890' },
                  alias: { type: 'string', example: 'Pago Universidad' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Favorito agregado' } }
      }
    },
    '/favorites/search': {
      get: {
        tags: ['Favoritos'],
        summary: 'Buscar en favoritos',
        description: 'Busca favoritos por alias o número de cuenta.',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Resultados de búsqueda' } }
      }
    },
    '/favorites/check/{accountNumber}': {
      get: {
        tags: ['Favoritos'],
        summary: 'Verificar favorito',
        description: 'Comprueba si un número de cuenta ya está en los favoritos del usuario.',
        parameters: [{ name: 'accountNumber', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Estado de verificación' } }
      }
    },
    '/favorites/{favoriteId}': {
      put: {
        tags: ['Favoritos'],
        summary: 'Actualizar alias',
        description: 'Modifica el alias de un favorito existente.',
        parameters: [{ name: 'favoriteId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { alias: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Alias actualizado' } }
      },
      delete: {
        tags: ['Favoritos'],
        summary: 'Eliminar favorito',
        description: 'Elimina un contacto de la lista de favoritos.',
        parameters: [{ name: 'favoriteId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Favorito eliminado' } }
      }
    },
    '/favorites/transfer': {
      post: {
        tags: ['Favoritos'],
        summary: 'Transferir por alias',
        description: 'Realiza una transferencia usando el alias guardado en lugar del número de cuenta.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['alias', 'amount'],
                properties: {
                  alias: { type: 'string', example: 'Mi Amigo' },
                  amount: { type: 'number', example: 500 },
                  description: { type: 'string', example: 'Deuda saldada' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Transferencia exitosa' } }
      }
    },

    // ==========================================
    // PRODUCTOS (7 Endpoints)
    // ==========================================
    '/products/create': {
      post: {
        tags: ['Productos'],
        summary: 'Crear producto/servicio',
        description: 'Requiere ADMIN_ROLE. Crea un producto exclusivo del banco.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'type', 'price'],
                properties: {
                  name: { type: 'string', example: 'Tarjeta Black' },
                  description: { type: 'string', example: 'Membresía premium' },
                  type: { type: 'string', example: 'PRODUCT' },
                  price: { type: 'number', example: 150 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Producto creado' } }
      }
    },
    '/products/get': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos',
        description: 'Obtiene el catálogo con opciones de paginación.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean', default: true } }
        ],
        responses: { '200': { description: 'Catálogo de productos' } }
      }
    },
    '/products/get/currencies': {
      get: {
        tags: ['Productos'],
        summary: 'Productos con precios en divisas',
        description: 'Muestra el catálogo de productos convirtiendo sus precios a las monedas globales.',
        responses: { '200': { description: 'Catálogo multidivisa' } }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Obtener producto',
        description: 'Busca un producto específico por su ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detalle del producto' } }
      },
      put: {
        tags: ['Productos'],
        summary: 'Editar producto',
        description: 'Requiere ADMIN_ROLE. Modifica la información del producto.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } }
            }
          }
        },
        responses: { '200': { description: 'Producto actualizado' } }
      }
    },
    '/products/{id}/activate': {
      put: {
        tags: ['Productos'],
        summary: 'Activar producto',
        description: 'Requiere ADMIN_ROLE.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Producto activado' } }
      }
    },
    '/products/{id}/deactivate': {
      put: {
        tags: ['Productos'],
        summary: 'Desactivar producto',
        description: 'Requiere ADMIN_ROLE.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Producto desactivado' } }
      }
    },

    // ==========================================
    // TRANSACCIONES (8 Endpoints)
    // ==========================================
    '/transactions/transfer': {
      post: {
        tags: ['Transacciones'],
        summary: 'Transferir fondos',
        description: 'Envía dinero entre dos cuentas. Valida fondos y límite diario de Q10,000.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountNumberFrom', 'accountNumberTo', 'amount'],
                properties: {
                  accountNumberFrom: { type: 'string' },
                  accountNumberTo: { type: 'string' },
                  amount: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Transferencia realizada' } }
      }
    },
    '/transactions/deposit': {
      post: {
        tags: ['Transacciones'],
        summary: 'Realizar depósito',
        description: 'Requiere ADMIN_ROLE. Ingresa dinero desde la bóveda del banco a un usuario.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountNumberTo', 'type', 'amount'],
                properties: {
                  accountNumberTo: { type: 'string' },
                  type: { type: 'string', example: 'DEPOSIT' },
                  amount: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Depósito registrado' } }
      }
    },
    '/transactions/payment': {
      post: {
        tags: ['Transacciones'],
        summary: 'Pago de producto/servicio',
        description: 'Debita el costo de un producto del saldo del cliente.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountNumberFrom', 'type', 'product'],
                properties: {
                  accountNumberFrom: { type: 'string' },
                  type: { type: 'string', example: 'PAYMENT' },
                  product: { type: 'string', description: 'ID Mongo del producto' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Pago exitoso' } }
      }
    },
    '/transactions/deposit/{id}': {
      put: {
        tags: ['Transacciones'],
        summary: 'Editar depósito',
        description: 'Requiere ADMIN_ROLE. Ajusta la cantidad de un depósito existente.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number' } } } } }
        },
        responses: { '200': { description: 'Depósito editado' } }
      }
    },
    '/transactions/reverse/{id}': {
      put: {
        tags: ['Transacciones'],
        summary: 'Revertir depósito',
        description: 'Requiere ADMIN_ROLE. Anula un depósito si no ha pasado más de 1 minuto.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Transacción revertida' } }
      }
    },
    '/transactions/topAccounts': {
      get: {
        tags: ['Transacciones'],
        summary: 'Top Cuentas',
        description: 'Requiere ADMIN_ROLE. Obtiene las 10 cuentas con mayor volumen de transacciones recibidas.',
        responses: { '200': { description: 'Reporte generado' } }
      }
    },
    '/transactions/admin/last-movements/{accountId}': {
      get: {
        tags: ['Transacciones'],
        summary: 'Últimos 5 movimientos',
        description: 'Requiere ADMIN_ROLE. Consulta las últimas 5 transacciones de una cuenta específica.',
        parameters: [{ name: 'accountId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Historial obtenido' } }
      }
    },
    '/transactions/history': {
      get: {
        tags: ['Transacciones'],
        summary: 'Mi historial',
        description: 'Devuelve todo el historial de transacciones (envíos, cobros, depósitos) de la cuenta logueada.',
        responses: { '200': { description: 'Historial personal' } }
      }
    }
  }
};