# Sistema Bancario Core API - Grupo 1 IN6BV

Este proyecto es el servidor principal desarrollado en Node.js y MongoDB para el Sistema Bancario. Se encarga de la gestión de cuentas, transacciones, productos y favoritos, delegando la autenticación de usuarios a un microservicio externo construido en .NET.

## Tecnologías Utilizadas

El sistema está construido sobre el ecosistema de JavaScript utilizando **Node.js** con el framework **Express**. La persistencia de datos se maneja mediante **MongoDB** y **Mongoose**. Para la seguridad, se implementan **JSON Web Tokens (JWT)**, limitadores de peticiones con Express Rate Limit y cabeceras de seguridad con Helmet. La conversión de divisas en tiempo real se logra mediante la integración con la API de **FastForex**.

## Instalación y Configuración

1. Clonar el repositorio en el entorno local.
2. Ejecutar `pnpm install` para instalar todas las dependencias listadas en el `package.json`.
3. Crear un archivo `.env` en la raíz, guiándose por el esquema proporcionado en la sección de Variables de Entorno.
4. Asegurarse de tener el servicio de base de datos MongoDB en ejecución local o proporcionar una URI de Mongo Atlas.
5. Levantar el servicio externo de AuthService (.NET) para que la emisión de tokens funcione correctamente.
6. Ejecutar el comando `npm run dev` para iniciar el servidor con recarga en caliente a través de Nodemon.

## Variables de Entorno (.env)

El archivo de configuración debe contener las siguientes claves para el correcto funcionamiento del servidor:

PORT=3007

URI_MONGO=mongodb://localhost:27017/DBSistemaBancario

JWT_SECRET=tu_secreto_aqui

JWT_ISSUER=AuthService

JWT_AUDIENCE=AuthService

FASTFOREX_API_KEY=tu_api_key_aqui

BASE_CURRENCY=GTQ

## Características Principales

**Funciones de Administrador**
El sistema crea automáticamente una cuenta bóveda del banco al inicializarse. Los administradores pueden registrar nuevos usuarios validando que sus ingresos mensuales sean superiores a Q100. Tienen la capacidad de visualizar las cuentas con mayor cantidad de movimientos y auditar los últimos 5 movimientos de cualquier usuario. Además, pueden registrar depósitos en efectivo con la ventaja de poder modificar el monto o revertirlos si se comete un error, siempre y cuando no haya transcurrido más de 1 minuto desde la transacción. También gestionan el catálogo de productos y servicios exclusivos del banco.

**Funciones de Cliente**
Los usuarios clientes pueden visualizar su saldo actualizado y su historial completo de transacciones. El sistema les permite realizar transferencias a terceros respetando un límite de Q2000 por operación y un máximo de Q10,000 diarios por seguridad. Cuentan con una libreta de contactos favoritos donde pueden asignar alias a números de cuenta frecuentes para agilizar los envíos de dinero. Finalmente, gracias a la API externa, pueden consultar el equivalente de su saldo actual en las principales divisas globales (USD, EUR, BTC, etc.).

## Rutas Principales (Endpoints)

| Módulo | Método | Endpoint | Descripción |
|---|---|---|---|
| **Cuentas** | POST | `/api/v1/bank/accounts/create` | (Admin) Crea una cuenta bancaria asociada a un Auth ID |
| **Cuentas** | GET | `/api/v1/bank/accounts/my-account` | Obtiene los datos y saldo de la cuenta del usuario logueado |
| **Cuentas** | GET | `/api/v1/bank/accounts/my-account/currencies` | Obtiene el saldo convertido a múltiples divisas |
| **Transacciones** | POST | `/api/v1/bank/transactions/transfer` | Transfiere fondos entre dos cuentas |
| **Transacciones** | POST | `/api/v1/bank/transactions/deposit` | (Admin) Realiza un depósito desde la cuenta bóveda |
| **Transacciones** | PUT | `/api/v1/bank/transactions/reverse/:id` | (Admin) Revierte un depósito reciente |
| **Favoritos** | POST | `/api/v1/bank/favorites` | Guarda una cuenta de terceros con un alias |
| **Favoritos** | POST | `/api/v1/bank/favorites/transfer` | Transfiere fondos utilizando el alias del favorito |
| **Productos** | GET | `/api/v1/bank/products/get` | Lista los productos y servicios disponibles |